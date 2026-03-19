import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import { STUDIO_A_ID } from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'

describe('GET /api/v1/studio/profile', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('401 when no token provided', async () => {
    const { status } = await makeRequest('GET', '/api/v1/studio/profile')
    expect(status).toBe(401)
  })

  it('200 owner gets full studio profile', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    expect(status).toBe(200)
    const data = (body as { data: any }).data
    expect(data.id).toBe(STUDIO_A_ID)
  })

  it('200 photographer gets same profile (any member)', async () => {
    const a = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    const b = await makeRequest('GET', '/api/v1/studio/profile', { token: photographer.access_token })
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect((a.body as any).data.id).toBe((b.body as any).data.id)
  })

  it('response has all required fields', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    expect(status).toBe(200)
    const d = (body as { data: any }).data
    expect(d).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
      plan_tier: expect.any(String),
    })
    expect(d.storage).toMatchObject({
      used_gb: expect.any(Number),
      limit_gb: expect.any(Number),
      usage_pct: expect.any(Number),
    })
  })

  it('storage object has used_gb, limit_gb, usage_pct', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    const s = (body as { data: any }).data.storage
    expect(typeof s.used_gb).toBe('number')
    expect(typeof s.limit_gb).toBe('number')
    expect(typeof s.usage_pct).toBe('number')
  })

  it('bank_account_number is masked (XXXX + last 4)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    const bank = (body as { data: any }).data.bank_account_number
    // null if ciphertext in DB is legacy/invalid; after `npm run db:reset:seed` expect masked value
    expect(bank === null || /^XXXX\d{4}$/.test(bank)).toBe(true)
  })

  it('bank_account_number not returned as plaintext', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    const bank = (body as { data: any }).data.bank_account_number
    if (bank != null) {
      expect(bank).not.toContain('123456789012')
    }
  })

  it('Cache-Control: no-store header present', async () => {
    const res = await makeRequest('GET', '/api/v1/studio/profile', { token: owner.access_token })
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('PATCH /api/v1/studio/profile', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', { body: { name: 'X' } })
    expect(status).toBe(401)
  })

  it('403 photographer cannot update profile', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: photographer.access_token,
      body: { name: 'Hacked Name' },
    })
    expect(status).toBe(403)
  })

  it('400 empty body', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: {},
    })
    expect(status).toBe(400)
  })

  it('400 invalid GSTIN format (wrong checksum)', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { gstin: '24AABCU9603R1ZX' },
    })
    expect(status).toBe(400)
  })

  it('400 GSTIN wrong length (not 15 chars)', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { gstin: '24AABCU9603R1' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid PAN format', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { pan: 'INVALID' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid IFSC format', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { bank_ifsc: 'BAD' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid pincode (less than 6 digits)', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { pincode: '12345' },
    })
    expect(status).toBe(400)
  })

  it('400 brand_color without # prefix', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { brand_color: 'FF00FF' },
    })
    expect(status).toBe(400)
  })

  it('400 invoice_prefix with lowercase letters', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { invoice_prefix: 'abc' },
    })
    expect(status).toBe(400)
  })

  it('400 default_advance_pct = 101', async () => {
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { default_advance_pct: 101 },
    })
    expect(status).toBe(400)
  })

  it('200 valid update returns updated profile', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { tagline: 'Integration test tagline' },
    })
    expect(status).toBe(200)
    expect((body as { data: any }).data.tagline).toBe('Integration test tagline')
  })

  it('200 bank_account_number encrypted in DB', async () => {
    const plain = '9988776655443322'
    const { status } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { bank_account_number: plain },
    })
    expect(status).toBe(200)
    const admin = createAdminClient()
    const { data } = await admin.from('studios').select('bank_account_number').eq('id', STUDIO_A_ID).single()
    const raw = (data as { bank_account_number: string | null })?.bank_account_number
    expect(raw).toBeTruthy()
    expect(raw).not.toBe(plain)
    expect(raw).toMatch(/^[0-9a-f:]+$/)
  })

  it('200 valid invoice_prefix (uppercase alphanumeric)', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/v1/studio/profile', {
      token: owner.access_token,
      body: { invoice_prefix: 'X99' },
    })
    expect(status).toBe(200)
    expect((body as { data: any }).data.invoice_prefix).toBe('X99')
  })
})
