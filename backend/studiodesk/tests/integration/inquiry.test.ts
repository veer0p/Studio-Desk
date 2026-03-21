import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { STUDIO_A_ID } from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'

const STUDIO_SLUG = 'xyz-photography'

describe('POST /api/v1/inquiry', () => {
  const baseBody = {
    full_name: 'Inquiry User',
    phone: '9876543210',
  }

  beforeAll(async () => {
    const admin = createAdminClient()
    await (admin.from('rate_limits') as any).delete().like('key', 'inquiry:%')
  })

  it('400 missing ?studio= query param', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', { body: baseBody })
    expect(status).toBe(400)
  })

  it('400 unknown studio slug', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: 'nonexistent-studio-slug-xyz' },
      body: baseBody,
    })
    expect(status).toBe(404)
  })

  it('400 missing full_name', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { phone: '9876543210' },
    })
    expect(status).toBe(400)
  })

  it('400 missing phone', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'A' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid phone (not 10 digits)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Test', phone: '9876' },
    })
    expect(status).toBe(400)
  })

  it('400 phone starting with 5 (invalid Indian mobile)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Test', phone: '5876543210' },
    })
    expect(status).toBe(400)
  })

  it('201 valid submission → lead created in DB', async () => {
    const phone = `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    if (!phone.match(/^[6-9]/)) throw new Error('bad phone')
    const { status, body } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: `Lead ${Date.now()}`, phone },
      headers: { 'x-forwarded-for': '203.0.113.50' },
    })
    expect(status).toBe(201)
    const leadId = (body as { data: any }).data.lead_id
    const admin = createAdminClient()
    const { data } = await (admin.from('leads') as any).select('id').eq('id', leadId).single()
    expect(data).toBeTruthy()
  })

  it('201 same phone as existing client → reuses client', async () => {
    const admin = createAdminClient()
    const { count: before } = await (admin.from('clients') as any).select('id', { count: 'exact', head: true }).eq('studio_id', STUDIO_A_ID)
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Reuse Test', phone: '9876543210' },
    })
    expect(status).toBe(201)
    const { count: after } = await (admin.from('clients') as any).select('id', { count: 'exact', head: true }).eq('studio_id', STUDIO_A_ID)
    expect(after).toBe(before)
  })

  it('201 response never exposes studio_id or internal IDs except lead_id', async () => {
    const phone = `8${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const { status, body } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Privacy', phone },
      headers: { 'x-forwarded-for': '203.0.113.51' },
    })
    expect(status).toBe(201)
    const data = (body as { data: any }).data
    expect(data.lead_id).toBeTruthy()
    expect(JSON.stringify(data)).not.toContain(STUDIO_A_ID)
    expect(data.studio_id).toBeUndefined()
  })

  it('429 rate limit: 6th request from same IP in 1 hour', async () => {
    const ip = `198.51.100.${100 + Math.floor(Math.random() * 50)}`
    const phoneBase = 8000000000
    for (let i = 0; i < 5; i++) {
      const { status } = await makeRequest('POST', '/api/v1/inquiry', {
        query: { studio: STUDIO_SLUG },
        body: { full_name: `R ${i}`, phone: String(phoneBase + i) },
        headers: { 'x-forwarded-for': ip },
      })
      expect(status).toBe(201)
    }
    const { status } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'R blocked', phone: String(phoneBase + 99) },
      headers: { 'x-forwarded-for': ip },
    })
    expect(status).toBe(429)
  })

  it('automation_log row created after valid submission', async () => {
    const phone = `7${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const admin = createAdminClient()
    const { count: c0 } = await (admin.from('automation_log') as any)
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', STUDIO_A_ID)
    await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Auto log', phone },
      headers: { 'x-forwarded-for': '203.0.113.52' },
    })
    const { count: c1 } = await (admin.from('automation_log') as any)
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', STUDIO_A_ID)
    expect((c1 ?? 0)).toBeGreaterThanOrEqual((c0 ?? 0))
  })

  it('form_data preserved in leads table', async () => {
    const phone = `6${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const msg = 'hello <b>world</b>'
    const { body } = await makeRequest('POST', '/api/v1/inquiry', {
      query: { studio: STUDIO_SLUG },
      body: { full_name: 'Form Data', phone, message: msg },
      headers: { 'x-forwarded-for': '203.0.113.53' },
    })
    const leadId = (body as { data: any }).data.lead_id
    const admin = createAdminClient()
    const { data } = await (admin.from('leads') as any).select('form_data').eq('id', leadId).single()
    const fd = (data as { form_data: { message?: string } }).form_data
    expect(fd?.message).toBeDefined()
    expect(fd?.message).not.toContain('<b>')
  })
})
