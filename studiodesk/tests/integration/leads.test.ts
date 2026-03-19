import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, getOutsiderToken, type AuthToken } from '../helpers/auth'
import {
  LEAD_1_ID,
  LEAD_2_ID,
  LEAD_3_ID,
  LEAD_4_ID,
  LEAD_5_ID,
  LEAD_6_ID,
  LEAD_7_ID,
  LEAD_8_ID,
  CLIENT_PRIYA_ID,
  CLIENT_DEV_ID,
  CLIENT_MEERA_ID,
  CLIENT_ANITA_ID,
  BOOKING_CONVERTED_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'

async function waitForActivity(bookingId: string, maxMs = 3000) {
  const admin = createAdminClient()
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    const { data } = await admin
      .from('booking_activity_feed')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('event_type', 'lead_converted')
      .limit(1)
    if (data?.length) return
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error('booking_activity_feed row not found')
}

describe('GET /api/v1/leads', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/leads')
    expect(status).toBe(401)
  })

  it('200 returns leads for Studio A only (not Studio B)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', { token: owner.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((l) => l.id)
    expect(ids).not.toContain(LEAD_8_ID)
  })

  it('pagination: page=0 pageSize=3 → returns up to 3 leads', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { page: '0', pageSize: '3' },
    })
    expect(status).toBe(200)
    const m = (body as { meta: any }).meta
    expect((body as { data: any }).data.length).toBe(Math.min(3, m.count))
  })

  it('meta.count and meta.totalPages consistent with pagination', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { page: '0', pageSize: '3' },
    })
    const m = (body as { meta: any }).meta
    expect(m.count).toBeGreaterThanOrEqual(7)
    expect(m.totalPages).toBe(Math.ceil(m.count / 3))
    expect((body as { data: any }).data.length).toBeLessThanOrEqual(3)
  })

  it('filter by status=new_lead → only new leads', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { status: 'new_lead' },
    })
    for (const l of (body as { data: any }).data) {
      expect(l.status).toBe('new_lead')
    }
  })

  it('filter by status=lost → only lost leads', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { status: 'lost' },
    })
    expect((body as { data: any }).data.length).toBeGreaterThanOrEqual(1)
    for (const l of (body as { data: any }).data) {
      expect(l.status).toBe('lost')
    }
  })

  it('filter by source=inquiry_form → only form leads', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { source: 'inquiry_form' },
    })
    for (const l of (body as { data: any }).data) {
      expect(l.source).toBe('inquiry_form')
    }
  })

  it('search by client name → correct lead returned', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', {
      token: owner.access_token,
      query: { search: 'priya' },
    })
    const ids = ((body as { data: any }).data as { id: string }[]).map((l) => l.id)
    expect(ids).toContain(LEAD_4_ID)
  })

  it('form_data NOT included in list response', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', { token: owner.access_token })
    for (const l of (body as { data: any }).data) {
      expect(l.form_data).toBeUndefined()
    }
  })

  it('each lead has client object with full_name + phone', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', { token: owner.access_token })
    for (const l of (body as { data: any }).data) {
      expect(l.client).toMatchObject({
        full_name: expect.any(String),
        phone: expect.anything(),
      })
    }
  })
})

describe('POST /api/v1/leads', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      body: { full_name: 'A', phone: '9876543210' },
    })
    expect(status).toBe(401)
  })

  it('400 missing full_name', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { phone: '9876543210' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid phone format', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { full_name: 'A', phone: '123' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid email format', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { full_name: 'A', phone: '9876543210', email: 'bad' },
    })
    expect(status).toBe(400)
  })

  it('201 new phone → creates client + lead', async () => {
    const phone = `8${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { full_name: 'New Client Lead', phone },
    })
    expect(status).toBe(201)
  })

  it('201 existing phone → reuses client, creates lead', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { full_name: 'Another lead same phone', phone: '7654321098' },
    })
    expect(status).toBe(201)
  })

  it('201 with client_id → uses that client directly', async () => {
    const { status } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: {
        full_name: 'Priya Sharma',
        phone: '9876543210',
        client_id: CLIENT_PRIYA_ID,
      },
    })
    expect(status).toBe(201)
  })

  it("201 source defaults to 'phone'", async () => {
    const phone = `7${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const { body } = await makeRequest('POST', '/api/v1/leads', {
      token: owner.access_token,
      body: { full_name: 'Default source', phone },
    })
    expect((body as { data: any }).data.source).toBe('phone')
  })
})

describe('GET /api/v1/leads/:id', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', `/api/v1/leads/${LEAD_1_ID}`)
    expect(status).toBe(401)
  })

  it('404 lead from Studio B (RLS isolation)', async () => {
    const { status } = await makeRequest('GET', `/api/v1/leads/${LEAD_8_ID}`, { token: owner.access_token })
    expect(status).toBe(404)
  })

  it('404 non-existent UUID', async () => {
    const { status } = await makeRequest('GET', `/api/v1/leads/00000000-0000-4000-8000-000000009999`, {
      token: owner.access_token,
    })
    expect(status).toBe(404)
  })

  it('200 includes form_data in detail view', async () => {
    const { status, body } = await makeRequest('GET', `/api/v1/leads/${LEAD_1_ID}`, { token: owner.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data.form_data).toBeDefined()
  })

  it('200 converted lead shows booking_id', async () => {
    const { body } = await makeRequest('GET', `/api/v1/leads/${LEAD_4_ID}`, { token: owner.access_token })
    expect((body as { data: any }).data.booking_id).toBe(BOOKING_CONVERTED_ID)
  })
})

describe('PATCH /api/v1/leads/:id', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, { body: { status: 'contacted' } })
    expect(status).toBe(401)
  })

  it('400 empty body', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, {
      token: owner.access_token,
      body: {},
    })
    expect(status).toBe(400)
  })

  it('404 wrong studio', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_8_ID}`, {
      token: owner.access_token,
      body: { notes: 'nope' },
    })
    expect(status).toBe(404)
  })

  it('400 backward status: contacted → new_lead', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_7_ID}`, {
      token: owner.access_token,
      body: { status: 'new_lead' },
    })
    expect(status).toBe(400)
  })

  it('400 backward status: proposal_sent → contacted', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_3_ID}`, {
      token: owner.access_token,
      body: { status: 'contacted' },
    })
    expect(status).toBe(400)
  })

  it('200 forward status: new_lead → contacted', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, {
      token: owner.access_token,
      body: { status: 'contacted' },
    })
    expect(status).toBe(200)
  })

  it('200 forward status skipping: contacted → proposal_sent', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_2_ID}`, {
      token: owner.access_token,
      body: { status: 'proposal_sent' },
    })
    expect(status).toBe(200)
  })

  it('200 any → lost (always valid)', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_7_ID}`, {
      token: owner.access_token,
      body: { status: 'lost' },
    })
    expect(status).toBe(200)
    await makeRequest('PATCH', `/api/v1/leads/${LEAD_7_ID}`, {
      token: owner.access_token,
      body: { status: 'contacted' },
    })
  })

  it('400 follow_up_at in the past', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, {
      token: owner.access_token,
      body: { follow_up_at: '2020-01-01T00:00:00.000Z' },
    })
    expect(status).toBe(400)
  })

  it('200 valid follow_up_at in future', async () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString()
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, {
      token: owner.access_token,
      body: { follow_up_at: future },
    })
    expect(status).toBe(200)
  })
})

describe('DELETE /api/v1/leads/:id', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/leads/${LEAD_1_ID}`)
    expect(status).toBe(401)
  })

  it('404 wrong studio', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/leads/${LEAD_8_ID}`, { token: owner.access_token })
    expect(status).toBe(404)
  })

  it('409 already converted to booking', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/leads/${LEAD_4_ID}`, { token: owner.access_token })
    expect(status).toBe(409)
  })

  it('204 marks lead as lost (not deleted from DB)', async () => {
    const admin = createAdminClient()
    const phone = `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_DEV_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    const { status } = await makeRequest('DELETE', `/api/v1/leads/${lid}`, { token: owner.access_token })
    expect(status).toBe(204)
    const { data } = await admin.from('leads').select('status').eq('id', lid).single()
    expect((data as { status: string }).status).toBe('lost')
  })

  it('lead still exists in DB with status=lost after delete', async () => {
    const admin = createAdminClient()
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_MEERA_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    await makeRequest('DELETE', `/api/v1/leads/${lid}`, { token: owner.access_token })
    const { data } = await admin.from('leads').select('id,status').eq('id', lid).single()
    expect(data).toBeTruthy()
    expect((data as { status: string }).status).toBe('lost')
  })
})

describe('POST /api/v1/leads/:id/convert', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_1_ID}/convert`, {
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(401)
  })

  it('403 photographer cannot convert', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_1_ID}/convert`, {
      token: photographer.access_token,
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(403)
  })

  it('404 lead not found', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/00000000-0000-4000-8000-000000000001/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(404)
  })

  it('404 wrong studio', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_8_ID}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(404)
  })

  it('409 already converted lead', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_4_ID}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(409)
  })

  it('409 lost lead cannot be converted', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_5_ID}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-12-01' },
    })
    expect(status).toBe(409)
  })

  it('400 missing event_date', async () => {
    const { status } = await makeRequest('POST', `/api/v1/leads/${LEAD_1_ID}/convert`, {
      token: owner.access_token,
      body: {},
    })
    expect(status).toBe(400)
  })

  it('201 valid convert → booking created in DB', async () => {
    const admin = createAdminClient()
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        event_type: 'portrait',
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    const { status, body } = await makeRequest('POST', `/api/v1/leads/${lid}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-11-15' },
    })
    expect(status).toBe(201)
    const bid = (body as { data: any }).data.booking_id
    const { data: b } = await admin.from('bookings').select('id').eq('id', bid).single()
    expect(b).toBeTruthy()
  })

  it('201 lead.converted_to_booking = TRUE after convert', async () => {
    const admin = createAdminClient()
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_DEV_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        event_type: 'corporate',
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    const { status, body } = await makeRequest('POST', `/api/v1/leads/${lid}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-10-01' },
    })
    expect(status).toBe(201)
    const bid = (body as { data: any }).data.booking_id
    const { data: ld } = await admin.from('leads').select('converted_to_booking').eq('id', lid).single()
    expect((ld as { converted_to_booking: boolean }).converted_to_booking).toBe(true)
    await admin.from('bookings').delete().eq('id', bid)
    await admin.from('leads').delete().eq('id', lid)
  })

  it('201 booking_activity_feed row created', async () => {
    const admin = createAdminClient()
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_MEERA_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        event_type: 'wedding',
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    const { status, body } = await makeRequest('POST', `/api/v1/leads/${lid}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-09-01' },
    })
    expect(status).toBe(201)
    const bid = (body as { data: any }).data.booking_id
    await waitForActivity(bid)
    await admin.from('bookings').delete().eq('id', bid)
    await admin.from('leads').delete().eq('id', lid)
  })

  it('201 lead.status = contract_signed after convert', async () => {
    const admin = createAdminClient()
    const { data: leadRow } = await admin
      .from('leads')
      .insert({
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        status: 'new_lead',
        source: 'phone',
        priority: 2,
        converted_to_booking: false,
        event_type: 'birthday',
        form_data: {},
      } as any)
      .select('id')
      .single()
    const lid = (leadRow as { id: string }).id
    const { status, body } = await makeRequest('POST', `/api/v1/leads/${lid}/convert`, {
      token: owner.access_token,
      body: { event_date: '2026-08-01' },
    })
    expect(status).toBe(201)
    const bid = (body as { data: any }).data.booking_id
    const { data: ld } = await admin.from('leads').select('status').eq('id', lid).single()
    expect((ld as { status: string }).status).toBe('contract_signed')
    await admin.from('bookings').delete().eq('id', bid)
    await admin.from('leads').delete().eq('id', lid)
  })
})
