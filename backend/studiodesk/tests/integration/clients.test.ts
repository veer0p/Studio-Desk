import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  CLIENT_PRIYA_ID,
  CLIENT_MEERA_ID,
  CLIENT_VIKRAM_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'

describe('GET /api/v1/clients', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/clients')
    expect(status).toBe(401)
  })

  it('200 returns Studio A clients only (not Studio B); seed baseline 5+', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/clients', { token: owner.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data.length).toBeGreaterThanOrEqual(5)
    const ids = ((body as { data: any }).data as { id: string }[]).map((c) => c.id)
    expect(ids).not.toContain(CLIENT_VIKRAM_ID)
  })

  it('pagination works: pageSize=2 → 2 clients', async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', {
      token: owner.access_token,
      query: { page: '0', pageSize: '2' },
    })
    expect((body as { data: any }).data).toHaveLength(2)
  })

  it("search by name: 'priya' → Priya Sharma", async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', {
      token: owner.access_token,
      query: { search: 'priya' },
    })
    expect((body as { data: any }).data[0].full_name).toMatch(/Priya/i)
  })

  it("search by phone: '9876' → Priya Sharma", async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', {
      token: owner.access_token,
      query: { search: '9876' },
    })
    expect((body as { data: any }).data.length).toBeGreaterThanOrEqual(1)
    expect((body as { data: any }).data[0].phone).toContain('9876')
  })

  it('meta.count is total client rows for studio', async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', {
      token: owner.access_token,
      query: { page: '0', pageSize: '100' },
    })
    const m = (body as { meta: any }).meta
    const rows = (body as { data: any[] }).data
    expect(m.count).toBeGreaterThanOrEqual(5)
    expect(rows.length).toBeLessThanOrEqual(100)
    expect(m.count).toBeGreaterThanOrEqual(rows.length)
    expect(m.totalPages).toBe(Math.ceil(m.count / m.pageSize))
  })

  it('each client has full_name, phone', async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', { token: owner.access_token })
    for (const c of (body as { data: any }).data) {
      expect(c).toMatchObject({
        full_name: expect.any(String),
        phone: expect.anything(),
      })
    }
  })
})

describe('POST /api/v1/clients', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      body: { full_name: 'A', phone: '9876543210' },
    })
    expect(status).toBe(401)
  })

  it('400 missing full_name', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { phone: '9876543210' },
    })
    expect(status).toBe(400)
  })

  it('400 missing phone', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { full_name: 'A' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid phone (8 digits)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { full_name: 'A', phone: '12345678' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid GSTIN format', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { full_name: 'A', phone: '9876543210', gstin: 'INVALIDGSTIN' },
    })
    expect(status).toBe(400)
  })

  it('409 duplicate phone in same studio', async () => {
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { full_name: 'Dup', phone: '9876543210' },
    })
    expect(status).toBe(409)
  })

  it('201 valid client created', async () => {
    const phone = `8${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const { status } = await makeRequest('POST', '/api/v1/clients', {
      token: owner.access_token,
      body: { full_name: 'Valid Client', phone, city: 'Surat' },
    })
    expect(status).toBe(201)
  })
})

describe('GET /api/v1/clients/:id', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`)
    expect(status).toBe(401)
  })

  it('404 Studio B client (RLS)', async () => {
    const { status } = await makeRequest('GET', `/api/v1/clients/${CLIENT_VIKRAM_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(404)
  })

  it('404 non-existent UUID', async () => {
    const { status } = await makeRequest('GET', `/api/v1/clients/00000000-0000-4000-8000-000000009999`, {
      token: owner.access_token,
    })
    expect(status).toBe(404)
  })

  it('200 returns client with stats + booking history', async () => {
    const { status, body } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(200)
    const d = (body as { data: any }).data
    expect(d.stats).toBeDefined()
    expect(Array.isArray(d.bookings)).toBe(true)
  })

  it('200 stats.total_bookings correct count', async () => {
    const { body } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`, { token: owner.access_token })
    const n = (body as { data: any }).data.stats.total_bookings
    expect(n).toBeGreaterThanOrEqual(1)
  })

  it('200 stats.total_revenue in INR string format', async () => {
    const { body } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`, { token: owner.access_token })
    const rev = (body as { data: any }).data.stats.total_revenue
    expect(rev).toMatch(/^\d+\.\d{2}$/)
  })

  it('200 bookings array sorted by event_date DESC', async () => {
    const { body } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`, { token: owner.access_token })
    const bookings = (body as { data: any }).data.bookings as { event_date: string }[]
    if (bookings.length >= 2) {
      const d0 = new Date(bookings[0].event_date).getTime()
      const d1 = new Date(bookings[1].event_date).getTime()
      expect(d0).toBeGreaterThanOrEqual(d1)
    }
  })
})

describe('PATCH /api/v1/clients/:id', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, { body: { city: 'X' } })
    expect(status).toBe(401)
  })

  it('400 empty body', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: owner.access_token,
      body: {},
    })
    expect(status).toBe(400)
  })

  it('404 wrong studio', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_VIKRAM_ID}`, {
      token: owner.access_token,
      body: { city: 'X' },
    })
    expect(status).toBe(404)
  })

  it('400 invalid email format', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: owner.access_token,
      body: { email: 'bad' },
    })
    expect(status).toBe(400)
  })

  it("409 phone change to another client's phone", async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: owner.access_token,
      body: { phone: '9876543210' },
    })
    expect(status).toBe(409)
  })

  it('200 phone change to own phone (no conflict)', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: owner.access_token,
      body: { phone: '7654321098' },
    })
    expect(status).toBe(200)
  })

  it('200 valid update', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: owner.access_token,
      body: { city: 'Mumbai' },
    })
    expect(status).toBe(200)
  })
})

describe('DELETE /api/v1/clients/:id', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('403 photographer cannot delete', async () => {
    const photographer = await getPhotographerToken()
    const { status } = await makeRequest('DELETE', `/api/v1/clients/${CLIENT_MEERA_ID}`, {
      token: photographer.access_token,
    })
    expect(status).toBe(403)
  })

  it('409 client has active bookings', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/clients/${CLIENT_PRIYA_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(409)
  })

  it('204 client with no active bookings deleted', async () => {
    const admin = createAdminClient()
    const { data: row } = await (admin.from('clients') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        full_name: `Del Client ${Date.now()}`,
        phone: `6${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10),
      } as any)
      .select('id')
      .single()
    const cid = (row as { id: string }).id
    const { status } = await makeRequest('DELETE', `/api/v1/clients/${cid}`, { token: owner.access_token })
    expect(status).toBe(204)
  })

  it('client still queryable by admin but not by RLS', async () => {
    const admin = createAdminClient()
    const { data: row } = await (admin.from('clients') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        full_name: `Soft ${Date.now()}`,
        phone: `7${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10),
      } as any)
      .select('id')
      .single()
    const cid = (row as { id: string }).id
    await makeRequest('DELETE', `/api/v1/clients/${cid}`, { token: owner.access_token })
    const { data: raw } = await (admin.from('clients') as any).select('id,deleted_at').eq('id', cid).single()
    expect((raw as { deleted_at: string | null }).deleted_at).toBeTruthy()
    const { status } = await makeRequest('GET', `/api/v1/clients/${cid}`, { token: owner.access_token })
    expect(status).toBe(404)
  })
})
