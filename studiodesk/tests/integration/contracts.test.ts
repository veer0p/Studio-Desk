import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getOutsiderToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  CONTRACT_DRAFT_ID,
  CONTRACT_DRAFT_TOKEN,
  CONTRACT_REMINDER_ID,
  CONTRACT_REMINDER_TOKEN,
  CONTRACT_SENT_ID,
  CONTRACT_SENT_TOKEN,
  CONTRACT_SIGNED_ID,
  CONTRACT_SIGNED_TOKEN,
  CONTRACT_TEMPLATE_GENERAL_ID,
  CONTRACT_TEMPLATE_WEDDING_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'

async function restoreTemplates(admin: ReturnType<typeof createAdminClient>) {
  await admin.from('contract_templates').upsert(
    [
      {
        id: CONTRACT_TEMPLATE_WEDDING_ID,
        studio_id: STUDIO_A_ID,
        name: 'Wedding Photography Agreement',
        event_type: 'wedding',
        content_html:
          '<h1>Photography Agreement</h1><p><strong>{{client_name}}</strong> agrees to photography coverage on {{event_date}} at {{venue}} for &#8377;{{total_amount}}.</p>',
        version: 1,
        is_default: false,
        is_active: true,
      },
      {
        id: CONTRACT_TEMPLATE_GENERAL_ID,
        studio_id: STUDIO_A_ID,
        name: 'General Agreement',
        event_type: null,
        content_html:
          '<h1>General Photography Agreement</h1><p>{{studio_name}} will deliver coverage for {{event_type}} on {{event_date}}.</p>',
        version: 1,
        is_default: true,
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )
}

async function resetFixtures(admin: ReturnType<typeof createAdminClient>) {
  const now = new Date()
  const eventDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const corpDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  await admin.from('contracts').delete().eq('studio_id', STUDIO_A_ID)
  await admin.from('contract_templates').delete().eq('studio_id', STUDIO_A_ID)
  await admin.from('booking_activity_feed').delete().eq('studio_id', STUDIO_A_ID).in('event_type', ['contract_sent', 'contract_reminded', 'contract_signed'])
  await admin.from('automation_log').delete().eq('studio_id', STUDIO_A_ID).in('automation_type', ['custom', 'contract_reminder'])

  await admin.from('bookings').upsert(
    [
      { id: BOOKING_CONVERTED_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_PRIYA_ID, title: 'Priya Sharma - Wedding', event_type: 'wedding', event_date: eventDate, venue_name: 'Hotel Grand, Surat', total_amount: 85000, advance_amount: 25500, amount_paid: 25500, gst_type: 'cgst_sgst', status: 'proposal_sent', package_snapshot: { name: 'Wedding Full Day', turnaround_days: 30 } },
      { id: BOOKING_CONTRACT_SIGNED_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_RAJ_ID, title: 'Raj Kumar - Corporate Event', event_type: 'corporate', event_date: corpDate, venue_name: 'Convention Centre, Ahmedabad', total_amount: 45000, advance_amount: 15000, amount_paid: 15000, gst_type: 'cgst_sgst', status: 'contract_signed', package_snapshot: { name: 'Corporate Event', turnaround_days: 7 } },
    ],
    { onConflict: 'id' }
  )
  await restoreTemplates(admin)
  await admin.from('contracts').upsert(
    [
      { id: CONTRACT_DRAFT_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_CONVERTED_ID, client_id: CLIENT_PRIYA_ID, template_id: CONTRACT_TEMPLATE_WEDDING_ID, status: 'draft', content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>', access_token: CONTRACT_DRAFT_TOKEN },
      { id: CONTRACT_SENT_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_CONVERTED_ID, client_id: CLIENT_PRIYA_ID, template_id: CONTRACT_TEMPLATE_WEDDING_ID, status: 'sent', content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>', access_token: CONTRACT_SENT_TOKEN, sent_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: CONTRACT_SIGNED_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_CONTRACT_SIGNED_ID, client_id: CLIENT_RAJ_ID, template_id: CONTRACT_TEMPLATE_GENERAL_ID, status: 'signed', content_html: '<h1>Corporate Agreement</h1><p>Signed agreement.</p>', access_token: CONTRACT_SIGNED_TOKEN, sent_at: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(), signed_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), signature_data: 'Raj Kumar', signed_ip: '103.1.2.3', signed_user_agent: 'Seeded' },
      { id: CONTRACT_REMINDER_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_CONVERTED_ID, client_id: CLIENT_PRIYA_ID, template_id: CONTRACT_TEMPLATE_WEDDING_ID, status: 'sent', content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>', access_token: CONTRACT_REMINDER_TOKEN, sent_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), reminder_sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    ],
    { onConflict: 'id' }
  )
}

describe('Contracts API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
    outsider = await getOutsiderToken()
  })

  beforeEach(async () => {
    await resetFixtures(createAdminClient())
  })

  it('GET /contracts handles auth, pagination, and RLS', async () => {
    expect((await makeRequest('GET', '/api/v1/contracts')).status).toBe(401)
    const ownerRes = await makeRequest('GET', '/api/v1/contracts?page=0&pageSize=2', { token: owner.access_token })
    expect(ownerRes.status).toBe(200)
    expect((ownerRes.body as any).data.length).toBeLessThanOrEqual(2)
    expect((ownerRes.body as any).meta.pageSize).toBe(2)
    const outsiderRes = await makeRequest('GET', '/api/v1/contracts', { token: outsider.access_token })
    const ids = ((outsiderRes.body as any).data as Array<{ id: string }>).map((row) => row.id)
    expect(ids).not.toContain(CONTRACT_DRAFT_ID)
  })

  it('POST /contracts rejects photographer and missing templates, then creates a valid draft', async () => {
    expect(
      (
        await makeRequest('POST', '/api/v1/contracts', {
          token: photographer.access_token,
          body: { booking_id: BOOKING_CONVERTED_ID },
        })
      ).status
    ).toBe(403)

    const admin = createAdminClient()
    await admin.from('contracts').update({ template_id: null }).eq('studio_id', STUDIO_A_ID)
    await admin.from('contract_templates').delete().eq('studio_id', STUDIO_A_ID)
    expect(
      (
        await makeRequest('POST', '/api/v1/contracts', {
          token: owner.access_token,
          body: { booking_id: BOOKING_CONVERTED_ID },
        })
      ).status
    ).toBe(422)
    await restoreTemplates(admin)

    const created = await makeRequest('POST', '/api/v1/contracts', {
      token: owner.access_token,
      body: { booking_id: BOOKING_CONVERTED_ID, notes: 'Custom cancellation terms applied' },
    })
    expect(created.status).toBe(201)
    expect((created.body as any).data.content_html).toContain('Priya Sharma')
    expect((created.body as any).data.content_html).toMatch(/May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr/)
  })

  it('PATCH /contracts/:id blocks sent and updates draft', async () => {
    expect((await makeRequest('PATCH', `/api/v1/contracts/${CONTRACT_SENT_ID}`, {
      token: owner.access_token,
      body: { notes: 'nope' },
    })).status).toBe(409)

    const res = await makeRequest('PATCH', `/api/v1/contracts/${CONTRACT_DRAFT_ID}`, {
      token: owner.access_token,
      body: { notes: 'Updated draft notes' },
    })
    expect(res.status).toBe(200)
    expect((res.body as any).data.notes).toBe('Updated draft notes')
  })

  it('DELETE /contracts/:id blocks sent and deletes a temp draft', async () => {
    expect((await makeRequest('DELETE', `/api/v1/contracts/${CONTRACT_SENT_ID}`, { token: owner.access_token })).status).toBe(409)
    const temp = await makeRequest('POST', '/api/v1/contracts', {
      token: owner.access_token,
      body: { booking_id: BOOKING_CONVERTED_ID, custom_content: '<h1>Custom Contract</h1><p>This is a sufficiently long custom contract body for delete testing.</p>' },
    })
    const id = (temp.body as any).data.id
    expect((await makeRequest('DELETE', `/api/v1/contracts/${id}`, { token: owner.access_token })).status).toBe(204)
  })

  it('POST /contracts/:id/send sends draft, resends sent, and logs activity', async () => {
    const admin = createAdminClient()
    const { count: beforeFeed } = await admin.from('booking_activity_feed').select('id', { head: true, count: 'exact' }).eq('studio_id', STUDIO_A_ID).eq('event_type', 'contract_sent')
    const { count: beforeAutomation } = await admin.from('automation_log').select('id', { head: true, count: 'exact' }).eq('studio_id', STUDIO_A_ID).eq('channel', 'email')

    expect((await makeRequest('POST', `/api/v1/contracts/${CONTRACT_SIGNED_ID}/send`, { token: owner.access_token })).status).toBe(409)
    expect((await makeRequest('POST', `/api/v1/contracts/${CONTRACT_DRAFT_ID}/send`, { token: owner.access_token })).status).toBe(200)

    const beforeResend = await admin.from('contracts').select('sent_at').eq('id', CONTRACT_SENT_ID).single()
    const resend = await makeRequest('POST', `/api/v1/contracts/${CONTRACT_SENT_ID}/send`, { token: owner.access_token })
    const afterResend = await admin.from('contracts').select('sent_at').eq('id', CONTRACT_SENT_ID).single()
    expect(resend.status).toBe(200)
    expect(new Date((afterResend.data as any).sent_at).getTime()).toBeGreaterThanOrEqual(new Date((beforeResend.data as any).sent_at).getTime())

    const { count: afterFeed } = await admin.from('booking_activity_feed').select('id', { head: true, count: 'exact' }).eq('studio_id', STUDIO_A_ID).eq('event_type', 'contract_sent')
    const { count: afterAutomation } = await admin.from('automation_log').select('id', { head: true, count: 'exact' }).eq('studio_id', STUDIO_A_ID).eq('channel', 'email')
    expect((afterFeed ?? 0)).toBeGreaterThan(beforeFeed ?? 0)
    expect((afterAutomation ?? 0)).toBeGreaterThan(beforeAutomation ?? 0)
  })

  it('POST /contracts/:id/remind validates state, rate limit, and success path', async () => {
    expect((await makeRequest('POST', `/api/v1/contracts/${CONTRACT_SIGNED_ID}/remind`, { token: owner.access_token })).status).toBe(400)
    expect((await makeRequest('POST', `/api/v1/contracts/${CONTRACT_REMINDER_ID}/remind`, { token: owner.access_token })).status).toBe(409)
    const res = await makeRequest('POST', `/api/v1/contracts/${CONTRACT_SENT_ID}/remind`, { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data.reminded_at).toBeTruthy()
  })

  it('GET /contracts/view/:token validates token, hides secrets, and marks viewed', async () => {
    expect((await makeRequest('GET', '/api/v1/contracts/view/not-a-token')).status).toBe(400)
    expect((await makeRequest('GET', `/api/v1/contracts/view/${'a'.repeat(64)}`)).status).toBe(404)
    const res = await makeRequest('GET', `/api/v1/contracts/view/${CONTRACT_SENT_TOKEN}`)
    expect(res.status).toBe(200)
    expect((res.body as any).data.content_html).toBeTruthy()
    expect((res.body as any).data).not.toHaveProperty('access_token')
    expect((res.body as any).data).not.toHaveProperty('signed_ip')
    expect((res.body as any).data.studio).not.toHaveProperty('gstin')
    let viewedAt: string | null = null
    for (let i = 0; i < 5; i += 1) {
      const viewed = await createAdminClient().from('contracts').select('viewed_at').eq('id', CONTRACT_SENT_ID).single()
      viewedAt = (viewed.data as any).viewed_at
      if (viewedAt) break
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    expect(viewedAt).toBeTruthy()
  })

  it('POST /contracts/sign/:token validates, signs, updates booking, and logs activity', async () => {
    expect((await makeRequest('POST', '/api/v1/contracts/sign/bad-token', { body: { signature_data: 'x' } })).status).toBe(400)
    expect((await makeRequest('POST', `/api/v1/contracts/sign/${'b'.repeat(64)}`, { body: { signature_data: 'x' } })).status).toBe(404)
    expect((await makeRequest('POST', `/api/v1/contracts/sign/${CONTRACT_SIGNED_TOKEN}`, { body: { signature_data: 'Priya Sharma' } })).status).toBe(409)
    expect((await makeRequest('POST', `/api/v1/contracts/sign/${CONTRACT_SENT_TOKEN}`, { body: { signature_data: '' } })).status).toBe(400)

    const res = await makeRequest('POST', `/api/v1/contracts/sign/${CONTRACT_SENT_TOKEN}`, {
      body: { signature_data: 'Priya Sharma' },
      headers: { 'x-forwarded-for': '198.51.100.23' },
    })
    expect(res.status).toBe(200)
    const admin = createAdminClient()
    const signed = await admin.from('contracts').select('status, signed_at, signed_ip').eq('id', CONTRACT_SENT_ID).single()
    const booking = await admin.from('bookings').select('status').eq('id', BOOKING_CONVERTED_ID).single()
    const activity = await admin.from('booking_activity_feed').select('id').eq('studio_id', STUDIO_A_ID).eq('booking_id', BOOKING_CONVERTED_ID).eq('event_type', 'contract_signed')
    expect((signed.data as any).status).toBe('signed')
    expect((signed.data as any).signed_at).toBeTruthy()
    expect((signed.data as any).signed_ip).toBe('198.51.100.23')
    expect((booking.data as any).status).toBe('contract_signed')
    expect(activity.data?.length).toBeGreaterThan(0)
  })

  it('GET /contract-templates and template CRUD enforce access and default behavior', async () => {
    expect((await makeRequest('GET', '/api/v1/contract-templates')).status).toBe(401)
    expect((await makeRequest('GET', '/api/v1/contract-templates', { token: owner.access_token })).status).toBe(200)
    expect((await makeRequest('POST', '/api/v1/contract-templates', {
      token: photographer.access_token,
      body: { name: 'Nope', content_html: '<p>short</p>' },
    })).status).toBe(403)

    const created = await makeRequest('POST', '/api/v1/contract-templates', {
      token: owner.access_token,
      body: { name: 'Portrait Add-on Template', event_type: 'portrait', content_html: '<h1>Portrait</h1><p>This portrait agreement has enough content to pass validation and be saved correctly for testing.</p>' },
    })
    expect(created.status).toBe(201)
    const tempId = (created.body as any).data.id

    const defaulted = await makeRequest('POST', '/api/v1/contract-templates', {
      token: owner.access_token,
      body: { name: 'New Default Template', content_html: '<h1>Default</h1><p>This general template is long enough to satisfy validation and replace the previous default.</p>', is_default: true },
    })
    expect(defaulted.status).toBe(201)
    const general = await createAdminClient().from('contract_templates').select('is_default').eq('id', CONTRACT_TEMPLATE_GENERAL_ID).single()
    expect((general.data as any).is_default).toBe(false)

    expect((await makeRequest('PATCH', `/api/v1/contract-templates/${CONTRACT_TEMPLATE_WEDDING_ID}`, {
      token: outsider.access_token,
      body: { name: 'Wrong studio' },
    })).status).toBe(404)
    expect((await makeRequest('PATCH', `/api/v1/contract-templates/${tempId}`, {
      token: owner.access_token,
      body: { name: 'Portrait Updated' },
    })).status).toBe(200)
    expect((await makeRequest('DELETE', `/api/v1/contract-templates/${CONTRACT_TEMPLATE_WEDDING_ID}`, { token: owner.access_token })).status).toBe(409)
    expect((await makeRequest('DELETE', `/api/v1/contract-templates/${tempId}`, { token: owner.access_token })).status).toBe(204)
  })

  it('GET /contract-templates auto-seeds defaults when none exist', async () => {
    const admin = createAdminClient()
    await admin.from('contracts').update({ template_id: null }).eq('studio_id', STUDIO_A_ID)
    await admin.from('contract_templates').delete().eq('studio_id', STUDIO_A_ID)
    const res = await makeRequest('GET', '/api/v1/contract-templates', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data.length).toBeGreaterThanOrEqual(4)
  })
})
