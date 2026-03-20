import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  repo: {
    getStudioSettings: vi.fn(),
    upsertStudioSettings: vi.fn(),
    getIntegrationConfig: vi.fn(),
    updateIntegrations: vi.fn(),
    getBillingInfo: vi.fn(),
  },
  transport: {
    sendWhatsApp: vi.fn(),
  },
  ordersAll: vi.fn(),
  rateLimit: vi.fn(),
}))

vi.mock('@/lib/repositories/settings.repo', () => ({ settingsRepo: mocks.repo }))
vi.mock('@/lib/services/automation.service', () => ({ automationTransport: mocks.transport }))
vi.mock('@/lib/razorpay/client', () => ({ razorpay: { orders: { all: mocks.ordersAll } } }))
vi.mock('@/lib/rate-limit', () => ({ checkAndIncrementRateLimitWithCustomMax: mocks.rateLimit }))
vi.mock('@/lib/env', () => ({
  env: {
    ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    WHATSAPP_API_BASE_URL: 'https://whatsapp.test',
    IMMICH_BASE_URL: 'https://immich.test',
  },
}))

import { encrypt } from '@/lib/crypto'
import { SettingsService } from '@/lib/services/settings.service'

function makeSupabase(bookingsCount = 0) {
  return {
    from(table: string) {
      if (table !== 'bookings') return this
      return {
        select() {
          return this
        },
        eq() {
          return this
        },
        is() {
          return this
        },
        gte() {
          return this
        },
        lte() {
          return Promise.resolve({ count: bookingsCount, error: null })
        },
      }
    },
  } as any
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.rateLimit.mockResolvedValue(undefined)
  mocks.ordersAll.mockResolvedValue({ data: [] })
  mocks.transport.sendWhatsApp.mockResolvedValue({ messageId: 'msg_1' })
  vi.stubGlobal('fetch', vi.fn())
  ;(globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ major: 1, minor: 2 }) })
})

describe('SettingsService', () => {
  it('returns default notification settings when no row exists', async () => {
    mocks.repo.getStudioSettings.mockResolvedValueOnce(null)

    const result = await SettingsService.getNotificationSettings({} as any, 'studio-1')

    expect(result).toMatchObject({
      notify_new_lead: true,
      notify_payment: true,
      notify_contract_signed: true,
      notify_via_email: true,
      notify_via_whatsapp: true,
      working_hours_start: '09:00',
      working_hours_end: '21:00',
      timezone: 'Asia/Kolkata',
    })
  })

  it('normalizes notification settings from the stored blob', async () => {
    mocks.repo.getStudioSettings.mockResolvedValueOnce({
      notify_new_lead_email: true,
      notify_new_lead_whatsapp: true,
      notify_payment_email: true,
      notify_payment_whatsapp: true,
      invoice_footer_text: '__studiodesk_settings_v1__:' + JSON.stringify({
        notify_new_lead: false,
        notify_payment: false,
        notify_contract_signed: false,
        notify_gallery_viewed: true,
        notify_team_confirmed: false,
        notify_team_declined: false,
        notify_via_email: false,
        notify_via_whatsapp: true,
        working_hours_start: '08:00',
        working_hours_end: '19:00',
      }),
      invoice_terms: 'Terms',
      invoice_bank_details_visible: true,
      gallery_default_expiry_days: 30,
      gallery_watermark_default: true,
      email_from_name: 'XYZ Photography',
      email_reply_to: 'studio@test.com',
      timezone: 'Asia/Kolkata',
    })

    const result = await SettingsService.getNotificationSettings({} as any, 'studio-1')

    expect(result).toMatchObject({
      notify_new_lead: true,
      notify_payment: true,
      notify_contract_signed: true,
      notify_via_email: true,
      notify_via_whatsapp: true,
      working_hours_start: '09:00',
      working_hours_end: '21:00',
    })
  })

  it('encrypts integration keys before persisting', async () => {
    mocks.repo.updateIntegrations.mockResolvedValueOnce({
      whatsapp_api_provider: 'interakt',
      whatsapp_api_key: encrypt('test-whatsapp-key-123'),
      whatsapp_phone: '9876543210',
      razorpay_account_id: 'acct_test123',
      immich_user_id: null,
      immich_api_key: null,
      storage_used_gb: 75.3,
      storage_limit_gb: 200,
    })
    mocks.repo.getIntegrationConfig.mockResolvedValueOnce({
      whatsapp_api_provider: 'interakt',
      whatsapp_api_key: encrypt('test-whatsapp-key-123'),
      whatsapp_phone: '9876543210',
      razorpay_account_id: 'acct_test123',
      immich_user_id: null,
      immich_api_key: null,
      storage_used_gb: 75.3,
      storage_limit_gb: 200,
    })

    const result = await SettingsService.updateIntegrations({} as any, 'studio-1', {
      whatsapp_api_provider: 'interakt',
      whatsapp_api_key: 'test-whatsapp-key-123',
      whatsapp_phone: '9876543210',
      razorpay_account_id: 'acct_test123',
      storage_used_gb: 75.3,
      storage_limit_gb: 200,
    } as any)

    const persisted = mocks.repo.updateIntegrations.mock.calls[0][2]
    expect(persisted.whatsapp_api_key).not.toBe('test-whatsapp-key-123')
    expect(result.whatsapp.is_connected).toBe(true)
    expect(result.whatsapp.api_key_masked).toContain('-123')
    expect(result.immich.storage.usage_pct).toBe(37.7)
  })

  it('validates WhatsApp test configuration and returns live test results', async () => {
    const config = {
      whatsapp_api_provider: 'interakt',
      whatsapp_api_key: encrypt('test-whatsapp-key-123'),
      whatsapp_phone: '9876543210',
      razorpay_account_id: 'acct_test123',
      immich_user_id: null,
      immich_api_key: null,
      storage_used_gb: 0,
      storage_limit_gb: 100,
    }
    mocks.repo.getIntegrationConfig.mockResolvedValueOnce(config).mockResolvedValueOnce(config)

    await expect(SettingsService.testIntegration({} as any, 'studio-1', 'whatsapp')).rejects.toThrow('test_phone required for WhatsApp test')

    const result = await SettingsService.testIntegration({} as any, 'studio-1', 'whatsapp', '9876543210')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages'),
      expect.objectContaining({
        method: 'POST',
      })
    )
    expect(result).toMatchObject({ success: true, service: 'whatsapp' })
  })

  it('returns immich connectivity without throwing on server errors', async () => {
    const config = {
      whatsapp_api_provider: null,
      whatsapp_api_key: null,
      whatsapp_phone: null,
      razorpay_account_id: null,
      immich_user_id: 'immich-user-1',
      immich_api_key: encrypt('immich-key-1'),
      storage_used_gb: 10,
      storage_limit_gb: 100,
    }
    mocks.repo.getIntegrationConfig.mockResolvedValueOnce(config)
    ;(globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ major: 1, minor: 2 }),
    })

    await expect(SettingsService.testIntegration({} as any, 'studio-1', 'immich')).resolves.toMatchObject({
      success: true,
      service: 'immich',
      message: 'Connected to Immich v1.2',
    })
  })

  it('returns razorpay failures as a response object instead of throwing', async () => {
    mocks.repo.getIntegrationConfig.mockResolvedValueOnce({
      whatsapp_api_provider: null,
      whatsapp_api_key: null,
      whatsapp_phone: null,
      razorpay_account_id: 'acct_bad',
      immich_user_id: null,
      immich_api_key: null,
      storage_used_gb: 0,
      storage_limit_gb: 100,
    })
    mocks.ordersAll.mockRejectedValueOnce(new Error('bad credentials'))

    await expect(SettingsService.testIntegration({} as any, 'studio-1', 'razorpay')).resolves.toMatchObject({
      success: false,
      service: 'razorpay',
      error: 'Razorpay credentials invalid',
    })
  })

  it('returns billing info with upgrade recommendation', async () => {
    mocks.repo.getBillingInfo.mockResolvedValueOnce({
      plan_tier: 'studio',
      subscription_status: 'active',
      trial_ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
      storage_used_gb: 75.3,
      storage_limit_gb: 200,
      subscription_plans: [{
        name: 'Studio',
        monthly_price_inr: 2999,
        annual_price_inr: 29999,
        max_team_members: 3,
        storage_limit_gb: 100,
        features: { ai_gallery: true },
      }],
      studio_members: [{ id: 'm1', is_active: true }, { id: 'm2', is_active: true }, { id: 'm3', is_active: true }],
    })

    const result = await SettingsService.getBillingInfo(makeSupabase(4), 'studio-1')

    expect(result.plan_tier).toBe('studio')
    expect(result.usage.member_limit_reached).toBe(false)
    expect(result.upgrade_recommendation).toBe(null)
    expect(result.days_until_trial_ends).toBeGreaterThan(0)
  })

  it('recommends studio for starter plans with high booking volume', async () => {
    mocks.repo.getBillingInfo.mockResolvedValueOnce({
      plan_tier: 'starter',
      subscription_status: 'trialing',
      trial_ends_at: null,
      storage_used_gb: 10,
      storage_limit_gb: 20,
      subscription_plans: [{
        name: 'Starter',
        monthly_price_inr: 999,
        annual_price_inr: 9999,
        max_team_members: 1,
        storage_limit_gb: 20,
        features: {},
      }],
      studio_members: [{ id: 'm1', is_active: true }],
    })

    const result = await SettingsService.getBillingInfo(makeSupabase(9), 'studio-1')

    expect(result.is_trial).toBe(true)
    expect(result.upgrade_recommendation).toBe('studio')
  })
})
