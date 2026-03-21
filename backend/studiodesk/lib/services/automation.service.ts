import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { automationRepo, AUTOMATION_SETTINGS_META } from '@/lib/repositories/automation.repo'
import { Errors } from '@/lib/errors'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'
import { sendEmail } from '@/lib/resend/client'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { formatIndianDate } from '@/lib/formatters'
import { phoneSchema } from '@/lib/validations/common.schema'
import type {
  AutomationLogQueryInput,
  StatsQueryInput,
  TestMessageInput,
  TriggerManualInput,
  UpdateSettingInput,
} from '@/lib/validations/automation.schema'

type Db = SupabaseClient<any>
type Channel = 'whatsapp' | 'email' | 'both'

export type AutomationType =
  | 'lead_acknowledgment'
  | 'lead_follow_up'
  | 'proposal_sent'
  | 'proposal_reminder'
  | 'contract_sent'
  | 'contract_reminder'
  | 'contract_signed'
  | 'advance_payment_reminder'
  | 'balance_payment_reminder'
  | 'payment_overdue_reminder'
  | 'payment_received'
  | 'gallery_ready'
  | 'gallery_reminder'
  | 'shoot_reminder'
  | 'post_shoot_followup'

export interface AutomationSetting {
  id: string
  automation_type: AutomationType
  label: string
  description: string
  trigger: string
  is_enabled: boolean
  channel: Channel
  delay_days: number
  delay_hours: number
  send_time: string | null
  updated_at: string
}

const TYPES = Object.keys(AUTOMATION_SETTINGS_META) as AutomationType[]
const MAX_MESSAGE_LENGTH = 1500
const DB_PERSISTED_TYPES = new Set<AutomationType>([
  'lead_acknowledgment',
  'contract_reminder',
  'advance_payment_reminder',
  'balance_payment_reminder',
  'gallery_ready',
  'shoot_reminder',
])

export const DEFAULT_AUTOMATION_SETTINGS = [
  { automation_type: 'lead_acknowledgment', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'lead_follow_up', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'proposal_sent', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'proposal_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'contract_sent', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'contract_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'contract_signed', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'advance_payment_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'balance_payment_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'payment_overdue_reminder', is_enabled: true, channel: 'both', delay_days: 1, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'payment_received', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'gallery_ready', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'gallery_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'shoot_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'post_shoot_followup', is_enabled: false, channel: 'whatsapp', delay_days: 1, delay_hours: 0, send_time: '11:00' },
] as const

export const WHATSAPP_TEMPLATES: Record<AutomationType, string> = {
  lead_acknowledgment: 'Hi {{client_name}}, thank you for reaching out to {{studio_name}}! We received your inquiry for {{event_type}} on {{event_date}}.',
  lead_follow_up: 'Hi {{client_name}}, this is {{studio_name}}. We wanted to follow up on your photography inquiry. Are you still looking for a photographer?',
  proposal_sent: 'Hi {{client_name}}, your photography proposal from {{studio_name}} is ready! View it here: {{proposal_url}} Valid until {{valid_until}}.',
  proposal_reminder: 'Hi {{client_name}}, your photography proposal from {{studio_name}} expires on {{valid_until}}. View it here: {{proposal_url}}',
  contract_sent: 'Hi {{client_name}}, please review and sign your photography agreement with {{studio_name}} here: {{contract_url}}',
  contract_reminder: 'Hi {{client_name}}, a gentle reminder to sign your photography agreement with {{studio_name}}: {{contract_url}}',
  contract_signed: 'Hi {{client_name}}, your contract with {{studio_name}} has been signed! We look forward to capturing your memories.',
  advance_payment_reminder: 'Hi {{client_name}}, your advance payment of {{amount}} for {{booking_title}} is due on {{due_date}}. Pay here: {{payment_link}}',
  balance_payment_reminder: 'Hi {{client_name}}, your balance payment of {{amount}} for {{booking_title}} is due on {{due_date}}. Pay here: {{payment_link}}',
  payment_overdue_reminder: 'Hi {{client_name}}, your payment of {{amount}} for {{booking_title}} is overdue. Please pay at your earliest: {{payment_link}}',
  payment_received: 'Hi {{client_name}}, we received your payment of {{amount}} for {{booking_title}}. Thank you!',
  gallery_ready: 'Hi {{client_name}}, your photo gallery from {{studio_name}} is ready! View your photos here: {{gallery_url}}',
  gallery_reminder: 'Hi {{client_name}}, your photo gallery expires on {{expiry_date}}. Download your photos before then: {{gallery_url}}',
  shoot_reminder: 'Hi {{client_name}}, your photography session with {{studio_name}} is on {{event_date}} at {{venue}}. See you there!',
  post_shoot_followup: 'Hi {{client_name}}, thank you for choosing {{studio_name}}! Your photos are being edited and will be ready in {{turnaround_days}} days.',
}

function templateVariables(template: string) {
  return Array.from(new Set((template.match(/\{\{(\w+)\}\}/g) ?? []).map((item) => item.slice(2, -2))))
}

function formatPhone(phone: string) {
  return phone.replace(/^\+91/, '').replace(/\D/g, '')
}

function replaceTemplateVariables(template: string, variables: Record<string, string>) {
  let out = template
  for (const [key, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return out.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').slice(0, MAX_MESSAGE_LENGTH)
}

function buildEmailSubject(automationType: AutomationType, variables: Record<string, string>) {
  const subjects: Record<AutomationType, string> = {
    lead_acknowledgment: 'Thanks from {{studio_name}}',
    lead_follow_up: 'Following up from {{studio_name}}',
    proposal_sent: 'Your proposal from {{studio_name}} is ready',
    proposal_reminder: 'Your proposal from {{studio_name}} expires soon',
    contract_sent: 'Please sign your agreement with {{studio_name}}',
    contract_reminder: 'Reminder to sign your agreement with {{studio_name}}',
    contract_signed: 'Your contract with {{studio_name}} has been signed',
    advance_payment_reminder: 'Payment reminder - {{booking_title}}',
    balance_payment_reminder: 'Balance reminder - {{booking_title}}',
    payment_overdue_reminder: 'Payment overdue - {{booking_title}}',
    payment_received: 'Payment received - {{booking_title}}',
    gallery_ready: 'Your photos are ready!',
    gallery_reminder: 'Your gallery is expiring soon',
    shoot_reminder: 'Reminder: Your shoot is on {{event_date}}',
    post_shoot_followup: 'Your shoot with {{studio_name}} is complete',
  }
  return replaceTemplateVariables(subjects[automationType], variables)
}

function buildEmailHtml(message: string, studioName: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#111"><h2>${studioName}</h2><p>${message}</p><p style="font-size:12px;color:#666">Reply to opt out of future messages.</p></div>`
}

function validateSetting(row: UpdateSettingInput) {
  if (row.delay_days != null && (row.delay_days < 0 || row.delay_days > 30)) throw Errors.validation('delay_days must be between 0 and 30')
  if (row.delay_hours != null && (row.delay_hours < 0 || row.delay_hours > 23)) throw Errors.validation('delay_hours must be between 0 and 23')
  if (row.send_time != null && !/^\d{2}:\d{2}$/.test(row.send_time)) throw Errors.validation('Invalid send_time format')
}

function defaultSetting(type: AutomationType) {
  return DEFAULT_AUTOMATION_SETTINGS.find((row) => row.automation_type === type)!
}

function mergeWithDefaults(rows: Array<Record<string, any>>, studioId: string) {
  const byType = new Map(rows.map((row) => [row.automation_type as AutomationType, row]))
  return TYPES.map((type) => {
    const current = byType.get(type)
    const fallback = defaultSetting(type)
    const meta = AUTOMATION_SETTINGS_META[type]
    return {
      id: current?.id ?? `virtual:${studioId}:${type}`,
      automation_type: type,
      label: meta.label,
      description: meta.description,
      trigger: meta.trigger,
      is_enabled: current?.is_enabled ?? fallback.is_enabled,
      channel: current?.channel ?? fallback.channel,
      delay_days: current?.delay_days ?? fallback.delay_days,
      delay_hours: current?.delay_hours ?? fallback.delay_hours,
      send_time: current?.send_time ?? fallback.send_time,
      updated_at: current?.updated_at ?? new Date(0).toISOString(),
    }
  })
}

async function fetchStudio(db: Db, studioId: string) {
  const { data, error } = await db.from('studios').select('id, name').eq('id', studioId).maybeSingle()
  if (error || !data) throw Errors.notFound('Studio')
  return data as Record<string, any>
}

async function fetchClient(db: Db, studioId: string, clientId: string) {
  const { data, error } = await db.from('clients').select('id, full_name, phone, email, whatsapp').eq('id', clientId).eq('studio_id', studioId).maybeSingle()
  if (error || !data) throw Errors.notFound('Client')
  return data as Record<string, any>
}

async function fetchBooking(db: Db, studioId: string, bookingId: string) {
  const { data, error } = await db
    .from('bookings')
    .select('id, title, event_type, event_date, venue_name, total_amount, package_snapshot, client_id, deleted_at')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .maybeSingle()
  if (error || !data || data.deleted_at) throw Errors.notFound('Booking')
  return data as Record<string, any>
}

async function fetchLead(db: Db, studioId: string, leadId: string) {
  const { data, error } = await db
    .from('leads')
    .select('id, client_id, event_type, event_date_approx, venue, deleted_at')
    .eq('id', leadId)
    .eq('studio_id', studioId)
    .maybeSingle()
  if (error || !data || data.deleted_at) throw Errors.notFound('Lead')
  return data as Record<string, any>
}

async function sendWhatsAppImpl(params: { to: string; message: string; studioId: string }) {
  const phone = formatPhone(params.to)
  if (!phoneSchema.safeParse(phone).success) throw Errors.validation('Invalid Indian mobile number')
  const baseUrl = env.WHATSAPP_API_BASE_URL?.replace(/\/+$/, '')
  if (!baseUrl || !env.WHATSAPP_API_KEY) throw Errors.external('WhatsApp')
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.WHATSAPP_API_KEY },
    body: JSON.stringify({ to: `+91${phone}`, message: params.message, studio_id: params.studioId }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw Errors.external('WhatsApp')
  return { messageId: String(body.messageId ?? body.id ?? '') }
}

export const automationTransport = { sendWhatsApp: sendWhatsAppImpl }

export async function sendAutomation(params: {
  studioId: string
  automationType: string
  channel?: Channel
  recipientPhone?: string
  recipientEmail?: string
  recipientName: string
  variables: Record<string, string>
  bookingId?: string
  leadId?: string
  clientId?: string
}): Promise<void> {
  const admin = createAdminClient()
  try {
    const setting = await automationRepo.getSettingByType(admin, params.studioId, params.automationType)
    const fallback = DEFAULT_AUTOMATION_SETTINGS.find((row) => row.automation_type === params.automationType)
    if (setting?.is_enabled === false) return
    const channel = params.channel ?? setting?.channel ?? fallback?.channel ?? 'whatsapp'
    const template = WHATSAPP_TEMPLATES[params.automationType as AutomationType]
    if (!template) return
    const message = replaceTemplateVariables(template, params.variables)
    const log = await automationRepo.createLogEntry(admin, {
      studio_id: params.studioId,
      booking_id: params.bookingId ?? null,
      lead_id: params.leadId ?? null,
      client_id: params.clientId ?? null,
      automation_type: params.automationType,
      channel,
      status: 'pending',
      recipient_phone: params.recipientPhone ?? null,
      recipient_email: params.recipientEmail ?? null,
      subject: buildEmailSubject(params.automationType as AutomationType, params.variables),
      message_preview: message,
      scheduled_at: new Date().toISOString(),
    })
    let sent = false
    let failed = false
    let providerMessageId: string | null = null
    if ((channel === 'whatsapp' || channel === 'both') && params.recipientPhone) {
      try {
        const result = await automationTransport.sendWhatsApp({ to: params.recipientPhone, message, studioId: params.studioId })
        providerMessageId = result.messageId || null
        sent = true
      } catch (error) {
        failed = true
        await logError({ severity: 'warning', message: 'WhatsApp automation failed', studioId: params.studioId, context: { automationType: params.automationType, error: String(error) } })
      }
    }
    if ((channel === 'email' || channel === 'both') && params.recipientEmail) {
      try {
        await sendEmail({
          to: params.recipientEmail,
          subject: buildEmailSubject(params.automationType as AutomationType, params.variables),
          html: buildEmailHtml(message, params.variables.studio_name ?? 'Studio'),
          studioId: params.studioId,
        })
        sent = true
      } catch (error) {
        failed = true
        await logError({ severity: 'warning', message: 'Email automation failed', studioId: params.studioId, context: { automationType: params.automationType, error: String(error) } })
      }
    }
    const status = sent && !failed ? 'sent' : failed ? 'failed' : 'skipped'
    await automationRepo.updateLogStatus(admin, log.id, status, {
      provider_message_id: providerMessageId,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      error_message: status === 'failed' ? 'delivery_failed' : null,
      provider_response: providerMessageId ? { messageId: providerMessageId } : null,
    })
  } catch (error) {
    await logError({ severity: 'warning', message: 'Automation dispatch failed', studioId: params.studioId, context: { automationType: params.automationType, error: String(error) } })
  }
}

export const AutomationService = {
  replaceTemplateVariables,
  buildEmailSubject,
  buildEmailHtml,
  sendAutomation,

  async getSettings(supabase: Db, studioId: string) {
    const persistedDefaults = DEFAULT_AUTOMATION_SETTINGS.filter((row) =>
      DB_PERSISTED_TYPES.has(row.automation_type as AutomationType)
    )
    let settings = await automationRepo.getSettings(supabase, studioId)
    if (!settings.length) {
      await automationRepo
        .ensureDefaultSettings(supabase, studioId, persistedDefaults as unknown as Array<Record<string, unknown>>)
        .catch(() => {})
      settings = await automationRepo.getSettings(supabase, studioId)
    }
    return mergeWithDefaults(settings, studioId) as AutomationSetting[]
  },

  async updateSettings(supabase: Db, studioId: string, settings: UpdateSettingInput[]) {
    settings.forEach(validateSetting)
    const current = await this.getSettings(supabase, studioId)
    const merged = settings.map((row) => {
      const existing = current.find((item) => item.automation_type === row.automation_type)
      return {
        automation_type: row.automation_type,
        is_enabled: row.is_enabled ?? existing?.is_enabled ?? true,
        channel: row.channel ?? existing?.channel ?? 'whatsapp',
        delay_days: row.delay_days ?? existing?.delay_days ?? 0,
        delay_hours: row.delay_hours ?? existing?.delay_hours ?? 0,
        send_time: row.send_time ?? existing?.send_time ?? null,
      }
    })
    const persisted = merged.filter((row) => DB_PERSISTED_TYPES.has(row.automation_type as AutomationType))
    if (persisted.length > 0) {
      await automationRepo.upsertSettings(supabase, studioId, persisted)
    }
    const refreshed = await this.getSettings(supabase, studioId)
    const overrides = new Map(merged.map((row) => [row.automation_type, row]))
    return refreshed.map((row) => {
      const override = overrides.get(row.automation_type)
      return override ? { ...row, ...override } : row
    })
  },

  async getAutomationLog(supabase: Db, studioId: string, params: AutomationLogQueryInput) {
    return automationRepo.getAutomationLog(supabase, studioId, params)
  },

  async triggerManual(supabase: Db, studioId: string, data: TriggerManualInput, _userId: string) {
    if (!data.booking_id && !data.lead_id) throw Errors.validation('Either booking_id or lead_id required')
    const studio = await fetchStudio(supabase, studioId)
    const record = data.booking_id
      ? await fetchBooking(supabase, studioId, data.booking_id)
      : await fetchLead(supabase, studioId, data.lead_id as string)
    const client = await fetchClient(supabase, studioId, record.client_id as string)
    const variables = {
      client_name: String(client.full_name ?? 'Client'),
      studio_name: String(studio.name ?? 'Studio'),
      event_date: formatIndianDate(data.booking_id ? record.event_date : record.event_date_approx ?? new Date()),
      event_type: String(record.event_type ?? 'event').replace(/_/g, ' '),
      venue: String(record.venue_name ?? record.venue ?? 'TBD'),
      booking_title: String(record.title ?? 'Booking'),
      amount: String(record.total_amount ?? '0.00'),
      due_date: formatIndianDate(data.booking_id ? record.event_date : new Date()),
      proposal_url: `${env.NEXT_PUBLIC_APP_URL}/proposals/view/manual`,
      contract_url: `${env.NEXT_PUBLIC_APP_URL}/contracts/sign/manual`,
      payment_link: `${env.NEXT_PUBLIC_APP_URL}/pay/manual`,
      gallery_url: `${env.NEXT_PUBLIC_APP_URL}/gallery/manual`,
      valid_until: formatIndianDate(new Date()),
      expiry_date: formatIndianDate(new Date()),
      turnaround_days: String(record.package_snapshot?.turnaround_days ?? 30),
      today_date: formatIndianDate(new Date()),
    }
    sendAutomation({
      studioId,
      automationType: data.automation_type,
      recipientPhone: client.phone ?? client.whatsapp ?? undefined,
      recipientEmail: client.email ?? undefined,
      recipientName: String(client.full_name ?? 'Client'),
      bookingId: data.booking_id,
      leadId: data.lead_id,
      clientId: String(record.client_id),
      variables,
    }).catch(() => {})
    return { message: 'Automation triggered. Check the log for delivery status.' }
  },

  async getTemplates(supabase: Db, studioId: string) {
    const builtIn = TYPES.map((type) => ({
      automation_type: type,
      label: AUTOMATION_SETTINGS_META[type].label,
      type: 'built_in' as const,
      preview: WHATSAPP_TEMPLATES[type],
      variables: templateVariables(WHATSAPP_TEMPLATES[type]),
      channel: 'whatsapp' as const,
    }))
    let custom = await automationRepo.getWhatsAppTemplates(supabase, studioId)
    if (!custom.length) {
      custom = await automationRepo.getWhatsAppTemplates(createAdminClient(), studioId)
    }
    return [...builtIn, ...custom]
  },

  async sendTestMessage(supabase: Db, studioId: string, data: TestMessageInput, _userId: string) {
    if (!phoneSchema.safeParse(data.phone).success) throw Errors.validation('Invalid Indian mobile number')
    await checkAndIncrementRateLimitWithCustomMax(`automation_test:${studioId}`, 10)
    const studio = await fetchStudio(supabase, studioId)
    sendAutomation({
      studioId,
      automationType: data.automation_type,
      channel: data.channel ?? 'whatsapp',
      recipientPhone: data.phone,
      recipientName: 'Test Client',
      variables: {
        client_name: 'Test Client',
        studio_name: String(studio.name ?? 'Studio'),
        event_date: '15 Nov 2025',
        event_type: 'Wedding',
        venue: 'Test Venue',
        booking_title: 'Test Booking',
        amount: '10,000.00',
        due_date: '15 Nov 2025',
        proposal_url: 'https://example.com/p',
        valid_until: '20 Nov 2025',
        contract_url: 'https://example.com/c',
        payment_link: 'https://example.com/pay',
        gallery_url: 'https://example.com/g',
        expiry_date: '20 Nov 2025',
        turnaround_days: '30',
        today_date: '15 Nov 2025',
      },
    }).catch(() => {})
    return { message: `Test message sent to +91${formatPhone(data.phone)}` }
  },

  async getStats(supabase: Db, studioId: string, period: StatsQueryInput['period']) {
    return automationRepo.getDeliveryStats(supabase, studioId, period)
  },
}
