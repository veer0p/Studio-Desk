import { SupabaseClient } from '@supabase/supabase-js'
import { decrypt, encrypt } from '@/lib/crypto'
import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { razorpay } from '@/lib/razorpay/client'
import { settingsRepo } from '@/lib/repositories/settings.repo'
import { phoneSchema } from '@/lib/validations/common.schema'
import type { TestIntegrationInput, UpdateIntegrationsInput, UpdateNotificationInput } from '@/lib/validations/settings.schema'

type Db = SupabaseClient<any>

export interface NotificationSettings {
  notify_new_lead: boolean
  notify_payment: boolean
  notify_contract_signed: boolean
  notify_gallery_viewed: boolean
  notify_team_confirmed: boolean
  notify_team_declined: boolean
  notify_via_email: boolean
  notify_via_whatsapp: boolean
  working_hours_start: string
  working_hours_end: string
  timezone: string
}

export interface IntegrationStatus {
  whatsapp: { 
    is_connected: boolean
    provider: string | null
    phone: string | null
    api_key_masked: string | null 
  }
  razorpay: { 
    is_connected: boolean
    account_id: string | null 
  }
  immich: { 
    is_connected: boolean
    user_id: string | null
    api_key_masked: string | null
    storage: { 
      used_gb: number
      limit_gb: number
      usage_pct: number 
    } 
  }
}

export interface BillingInfo {
  plan_tier: string
  plan_name: string
  subscription_status: string
  trial_ends_at: string | null
  is_trial: boolean
  days_until_trial_ends: number | null
  pricing: { monthly: string; annual: string }
  limits: { max_team_members: number; storage_limit_gb: number }
  usage: { 
    current_members: number
    member_limit_reached: boolean
    storage_used_gb: number
    storage_limit_gb: number
    storage_usage_pct: number 
  }
  features: Record<string, boolean>
  upgrade_recommendation: string | null
}

export interface TestResult {
  success: boolean
  service: string
  message?: string
  error?: string
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notify_new_lead: true,
  notify_payment: true,
  notify_contract_signed: true,
  notify_gallery_viewed: false,
  notify_team_confirmed: true,
  notify_team_declined: true,
  notify_via_email: true,
  notify_via_whatsapp: true,
  working_hours_start: '09:00',
  working_hours_end: '21:00',
  timezone: 'Asia/Kolkata',
}

function isCiphertext(value: string) { 
  return value.includes(':') && value.split(':').length === 3 
}

function tryDecrypt(value: string | null | undefined) { 
  if (!value) return ''
  if (!isCiphertext(value)) return value
  try { return decrypt(value) } catch { return value } 
}

function maskWhatsAppKey(value: string | null | undefined) { 
  const key = tryDecrypt(value)
  return key ? `••••••••${key.slice(-4)}` : null 
}

function maskImmichKey(value: string | null | undefined) { 
  return value ? '••••••••' : null 
}

function toNumber(value: unknown) { return Number(value ?? 0) }

function normalizeSettings(row: Record<string, unknown> | null): NotificationSettings {
  if (!row) return DEFAULT_NOTIFICATION_SETTINGS
  return {
    notify_new_lead: Boolean(row.notify_new_lead ?? true),
    notify_payment: Boolean(row.notify_payment ?? true),
    notify_contract_signed: Boolean(row.notify_contract_signed ?? true),
    notify_gallery_viewed: Boolean(row.notify_gallery_viewed ?? false),
    notify_team_confirmed: Boolean(row.notify_team_confirmed ?? true),
    notify_team_declined: Boolean(row.notify_team_declined ?? true),
    notify_via_email: Boolean(row.notify_via_email ?? true),
    notify_via_whatsapp: Boolean(row.notify_via_whatsapp ?? true),
    working_hours_start: String(row.working_hours_start ?? '09:00'),
    working_hours_end: String(row.working_hours_end ?? '21:00'),
    timezone: String(row.timezone ?? 'Asia/Kolkata'),
  }
}

function validateIntegrationInput(data: UpdateIntegrationsInput) {
  if (data.whatsapp_api_key != null && !data.whatsapp_api_key.trim()) {
    throw Errors.validation('WhatsApp API key cannot be empty')
  }
  if (data.immich_api_key != null && !data.immich_api_key.trim()) {
    throw Errors.validation('Immich API key cannot be empty')
  }
  if (data.whatsapp_phone != null && !phoneSchema.safeParse(data.whatsapp_phone).success) {
    throw Errors.validation('Invalid Indian mobile number')
  }
  if (data.razorpay_account_id != null && !/^acct_[a-zA-Z0-9]+$/.test(data.razorpay_account_id)) {
    throw Errors.validation('Invalid Razorpay account id')
  }
}

async function getCurrentMonthBookingCount(supabase: Db, studioId: string) {
  const now = new Date()
  const from = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()
  const to = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)).toISOString()
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .gte('created_at', from)
    .lte('created_at', to)
  if (error) throw Errors.validation('Failed to count bookings')
  return count ?? 0
}

async function testWhatsApp(apiKey: string, phone: string, studioId: string) {
  const res = await fetch(`${env.WHATSAPP_API_BASE_URL.replace(/\/+$/, '')}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ 
      to: `+91${phone}`, 
      message: 'Test message from StudioDesk. Your WhatsApp integration is working! 🎉', 
      studio_id: studioId 
    }),
  })
  if (!res.ok) throw new Error('WhatsApp API returned error')
}

async function testImmich(apiKey: string) {
  const res = await fetch(`${env.IMMICH_BASE_URL.replace(/\/+$/, '')}/api/server/version`, {
    headers: { 'x-api-key': apiKey }
  })
  if (!res.ok) return { success: false, error: 'Invalid API key or Immich unreachable' }
  const ver = await res.json().catch(() => ({}))
  return { 
    success: true, 
    message: `Connected to Immich v${ver.major ?? 'unknown'}.${ver.minor ?? 'unknown'}` 
  }
}

async function testRazorpay() {
  await razorpay.orders.all({ count: 1 })
  return { success: true, message: 'Razorpay connection verified' }
}

async function getIntegrationStatus(supabase: Db, studioId: string): Promise<IntegrationStatus> {
  const config = (await settingsRepo.getIntegrationConfig(supabase, studioId)) as Record<string, unknown>
  const storageUsed = toNumber(config.storage_used_gb)
  const storageLimit = toNumber(config.storage_limit_gb)
  
  return {
    whatsapp: {
      is_connected: Boolean(config.whatsapp_api_key),
      provider: config.whatsapp_api_provider != null ? String(config.whatsapp_api_provider) : null,
      phone: config.whatsapp_phone != null ? String(config.whatsapp_phone) : null,
      api_key_masked: maskWhatsAppKey(config.whatsapp_api_key as string | null | undefined),
    },
    razorpay: {
      is_connected: Boolean(config.razorpay_account_id),
      account_id: config.razorpay_account_id != null ? String(config.razorpay_account_id) : null,
    },
    immich: {
      is_connected: Boolean(config.immich_api_key),
      user_id: config.immich_user_id != null ? String(config.immich_user_id) : null,
      api_key_masked: maskImmichKey(config.immich_api_key as string | null | undefined),
      storage: {
        used_gb: storageUsed,
        limit_gb: storageLimit,
        usage_pct: storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100 * 10) / 10 : 0,
      },
    },
  }
}

async function getBillingInfo(supabase: Db, studioId: string): Promise<BillingInfo> {
  const [row, bookings] = await Promise.all([
    settingsRepo.getBillingInfo(supabase, studioId) as Promise<Record<string, any>>,
    getCurrentMonthBookingCount(supabase, studioId)
  ])
  
  const storageUsed = toNumber(row.storage_used_gb)
  const storageLimit = toNumber(row.storage_limit_gb)
  const memberCount = toNumber(row.current_member_count)
  const maxTeamMembers = toNumber(row.max_team_members)
  const trialEndsAt = row.trial_ends_at ? new Date(String(row.trial_ends_at)).toISOString() : null
  const trialMs = trialEndsAt ? new Date(trialEndsAt).getTime() - Date.now() : null
  const memberLimitReached = maxTeamMembers > 0 && memberCount >= maxTeamMembers
  
  const recommendation = row.plan_tier === 'starter' && bookings > 8 
    ? 'studio' 
    : row.plan_tier === 'studio' && memberLimitReached 
    ? 'agency' 
    : null

  return {
    plan_tier: String(row.plan_tier ?? 'starter'),
    plan_name: String(row.plan_name ?? row.plan_tier ?? 'Starter'),
    subscription_status: String(row.subscription_status ?? 'trialing'),
    trial_ends_at: trialEndsAt,
    is_trial: row.subscription_status === 'trialing',
    days_until_trial_ends: trialMs != null && trialMs > 0 ? Math.ceil(trialMs / 86400000) : null,
    pricing: { 
      monthly: Number(row.price_monthly ?? 0).toFixed(2), 
      annual: Number(row.price_annual ?? 0).toFixed(2) 
    },
    limits: { 
      max_team_members: maxTeamMembers, 
      storage_limit_gb: storageLimit 
    },
    usage: { 
      current_members: memberCount, 
      member_limit_reached: memberLimitReached, 
      storage_used_gb: storageUsed, 
      storage_limit_gb: storageLimit, 
      storage_usage_pct: storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100 * 10) / 10 : 0 
    },
    features: (row.features as Record<string, boolean>) ?? {},
    upgrade_recommendation: recommendation,
  }
}

async function updateNotificationSettings(supabase: Db, studioId: string, data: UpdateNotificationInput) {
  await settingsRepo.upsertStudioSettings(supabase, studioId, data)
  return getNotificationSettings(supabase, studioId)
}

async function updateIntegrations(supabase: Db, studioId: string, data: UpdateIntegrationsInput) {
  validateIntegrationInput(data)
  await settingsRepo.updateIntegrations(supabase, studioId, {
    whatsapp_api_provider: data.whatsapp_api_provider,
    whatsapp_api_key: data.whatsapp_api_key ? encrypt(data.whatsapp_api_key) : undefined,
    whatsapp_phone: data.whatsapp_phone,
    razorpay_account_id: data.razorpay_account_id,
    immich_user_id: data.immich_user_id,
    immich_api_key: data.immich_api_key ? encrypt(data.immich_api_key) : undefined,
  })
  return getIntegrationStatus(supabase, studioId)
}

async function testIntegration(
  supabase: Db, 
  studioId: string, 
  service: TestIntegrationInput['service'], 
  testPhone?: string
): Promise<TestResult> {
  await checkAndIncrementRateLimitWithCustomMax(`settings_integration_test:${studioId}`, 5)
  const config = (await settingsRepo.getIntegrationConfig(supabase, studioId)) as Record<string, unknown>
  
  if (service === 'whatsapp') {
    if (!config.whatsapp_api_key) throw Errors.validation('WhatsApp API key not configured')
    if (!testPhone) throw Errors.validation('test_phone required for WhatsApp test')
    try {
      await testWhatsApp(tryDecrypt(String(config.whatsapp_api_key)), testPhone, studioId)
      return { success: true, service: 'whatsapp', message: `Test message sent to ${testPhone}` }
    } catch (error) {
      return { success: false, service: 'whatsapp', error: error instanceof Error ? error.message : 'WhatsApp test failed' }
    }
  }
  
  if (service === 'immich') {
    if (!config.immich_api_key) throw Errors.validation('Immich API key not configured')
    try {
      return { service: 'immich', ...(await testImmich(tryDecrypt(String(config.immich_api_key)))) }
    } catch {
      return { success: false, service: 'immich', error: 'Cannot reach Immich server' }
    }
  }
  
  if (service === 'razorpay') {
    if (!config.razorpay_account_id) throw Errors.validation('Razorpay not configured')
    try {
      return { service: 'razorpay', ...(await testRazorpay()) }
    } catch {
      return { success: false, service: 'razorpay', error: 'Razorpay credentials invalid' }
    }
  }
  
  throw Errors.validation('Invalid service')
}

async function getNotificationSettings(supabase: Db, studioId: string) {
  return normalizeSettings((await settingsRepo.getStudioSettings(supabase, studioId)) as Record<string, unknown> | null)
}

export const SettingsService = {
  getNotificationSettings,
  updateNotificationSettings,
  getIntegrationStatus,
  updateIntegrations,
  testIntegration,
  getBillingInfo,
}
