import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { decrypt, encrypt } from '@/lib/crypto'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import { makeRequest } from '../helpers/request'
import { PHOTOGRAPHER_MEMBER_ID, STUDIO_A_ID, STUDIO_B_ID } from '../../supabase/seed'

const SETTINGS_BLOB_PREFIX = '__studiodesk_settings_v1__:'

function settingsBlob(data: Record<string, unknown>) {
  return `${SETTINGS_BLOB_PREFIX}${JSON.stringify(data)}`
}

async function seedSettingsFixtures() {
  const admin = createAdminClient()
  await admin.from('studios').update({
    whatsapp_api_provider: 'interakt',
    whatsapp_api_key: encrypt('test-whatsapp-key-123'),
    whatsapp_phone: '9876543210',
    razorpay_account_id: 'acc_test123',
    trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    storage_used_gb: 75.3,
    storage_limit_gb: 200,
    plan_tier: 'studio',
    subscription_status: 'active',
  }).eq('id', STUDIO_A_ID)

  await admin.from('studios').update({
    whatsapp_api_provider: null,
    whatsapp_api_key: null,
    whatsapp_phone: null,
    razorpay_account_id: null,
  }).eq('id', STUDIO_B_ID)

  await admin.from('studio_settings').upsert(
    [
      {
        studio_id: STUDIO_A_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: true,
        notify_payment_email: true,
        notify_payment_whatsapp: true,
        invoice_footer_text: settingsBlob({
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
        }),
        invoice_terms: 'Payment is due as per agreed schedule.',
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 30,
        gallery_watermark_default: true,
        email_from_name: 'XYZ Photography',
        email_reply_to: 'studio@xyzphoto.com',
        timezone: 'Asia/Kolkata',
      },
      {
        studio_id: STUDIO_B_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: false,
        notify_payment_email: true,
        notify_payment_whatsapp: false,
        invoice_footer_text: null,
        invoice_terms: null,
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 14,
        gallery_watermark_default: false,
        email_from_name: null,
        email_reply_to: null,
        timezone: 'Asia/Kolkata',
      },
    ],
    { onConflict: 'studio_id' }
  )
}

describe('Settings API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  beforeEach(async () => {
    await seedSettingsFixtures()
    const admin = createAdminClient()
    await admin
      .from('studio_members')
      .update({ role: 'photographer', studio_id: STUDIO_A_ID, is_active: true })
      .eq('id', PHOTOGRAPHER_MEMBER_ID)
  })

  it('GET /settings/notifications enforces auth and returns seeded prefs', async () => {
    expect((await makeRequest('GET', '/api/v1/settings/notifications')).status).toBe(401)
    expect((await makeRequest('GET', '/api/v1/settings/notifications', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/settings/notifications', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data).toMatchObject({
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
    })
  })

  it('PATCH /settings/notifications persists the new blob contract', async () => {
    const res = await makeRequest('PATCH', '/api/v1/settings/notifications', {
      token: owner.access_token,
      body: {
        notify_new_lead: false,
        notify_payment: false,
        notify_contract_signed: true,
        notify_gallery_viewed: true,
        notify_team_confirmed: false,
        notify_team_declined: true,
        notify_via_email: false,
        notify_via_whatsapp: true,
        working_hours_start: '08:30',
        working_hours_end: '18:30',
        timezone: 'Asia/Kolkata',
      },
    })

    expect(res.status).toBe(200)
    expect((res.body as any).data).toMatchObject({
      notify_new_lead: false,
      notify_payment: false,
      notify_gallery_viewed: true,
      working_hours_start: '08:30',
      working_hours_end: '18:30',
    })

    const roundTrip = await makeRequest('GET', '/api/v1/settings/notifications', { token: owner.access_token })
    expect((roundTrip.body as any).data).toMatchObject({
      notify_new_lead: false,
      notify_payment: false,
      notify_gallery_viewed: true,
      working_hours_start: '08:30',
      working_hours_end: '18:30',
    })
  })

  it('GET /settings/notifications falls back to defaults when the row is missing', async () => {
    const admin = createAdminClient()
    await admin.from('studio_settings').delete().eq('studio_id', STUDIO_A_ID)

    const res = await makeRequest('GET', '/api/v1/settings/notifications', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data).toMatchObject({
      notify_new_lead: true,
      notify_payment: true,
      notify_contract_signed: true,
      notify_gallery_viewed: false,
      working_hours_start: '09:00',
      working_hours_end: '21:00',
      timezone: 'Asia/Kolkata',
    })
  })

  it('GET /settings/billing returns plan and usage for owners only', async () => {
    expect((await makeRequest('GET', '/api/v1/settings/billing', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/settings/billing', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data).toMatchObject({
      plan_tier: 'studio',
      subscription_status: 'active',
      is_trial: false,
      limits: {
        max_team_members: 3,
        storage_limit_gb: 200,
      },
    })
    expect((res.body as any).data.usage.storage_usage_pct).toBe(37.7)
    expect(res.headers.get('cache-control')).toContain('max-age=300')
  })

  it('stores Studio A integrations encrypted at rest in the database', async () => {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('studios')
      .select('whatsapp_api_provider, whatsapp_api_key, whatsapp_phone, razorpay_account_id')
      .eq('id', STUDIO_A_ID)
      .single()

    expect(error).toBeNull()
    expect(data?.whatsapp_api_provider).toBe('interakt')
    expect(data?.whatsapp_phone).toBe('9876543210')
    expect(data?.razorpay_account_id).toBe('acc_test123')
    expect(decrypt(data?.whatsapp_api_key ?? '')).toBe('test-whatsapp-key-123')
  })
})
