import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, getOutsiderToken, type AuthToken } from '../helpers/auth'
import {
  PACKAGE_WEDDING_ID,
  PACKAGE_PORTRAIT_ID,
  STUDIO_A_ID,
  STUDIO_B_ID,
  ADDON_DRONE_ID,
} from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateGst } from '@/lib/gst/calculator'

describe('GET /api/v1/packages', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/packages')
    expect(status).toBe(401)
  })

  it('200 returns active packages (seed: 3+; excludes inactive)', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/packages', { token: owner.access_token })
    expect(status).toBe(200)
    const rows = (body as { data: any }).data as { is_active: boolean }[]
    expect(rows.every((p) => p.is_active !== false)).toBe(true)
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })

  it('each package has gst_amount computed correctly', async () => {
    const { body } = await makeRequest('GET', '/api/v1/packages', { token: owner.access_token })
    for (const p of (body as { data: any }).data) {
      expect(p).toHaveProperty('gst_amount')
      expect(String(p.gst_amount)).toMatch(/^\d+\.\d{2}$/)
    }
  })

  it('base_price 85000 → gst_amount 15300.00', async () => {
    const { body } = await makeRequest('GET', '/api/v1/packages', { token: owner.access_token })
    const wedding = (body as { data: any }).data.find((p: { id: string }) => p.id === PACKAGE_WEDDING_ID)
    expect(wedding).toBeTruthy()
    const gst = calculateGst(85000, 'cgst_sgst').total as number
    expect(wedding.gst_amount).toBe(gst.toFixed(2))
    expect(wedding.gst_amount).toBe('15300.00')
  })

  it('RLS: Studio B cannot see Studio A packages', async () => {
    const { body } = await makeRequest('GET', '/api/v1/packages', { token: outsider.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((p) => p.id)
    expect(ids).not.toContain(PACKAGE_WEDDING_ID)
  })
})

describe('GET /api/v1/packages/templates', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/packages/templates')
    expect(status).toBe(401)
  })

  it('200 returns exactly 6 templates', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/packages/templates', { token: owner.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data).toHaveLength(6)
  })

  it('Cache-Control: public, max-age=3600', async () => {
    const res = await makeRequest('GET', '/api/v1/packages/templates', { token: owner.access_token })
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600')
  })

  it('each template has is_template: true', async () => {
    const { body } = await makeRequest('GET', '/api/v1/packages/templates', { token: owner.access_token })
    for (const t of (body as { data: any }).data) {
      expect(t.is_template).toBe(true)
    }
  })
})

describe('POST /api/v1/packages', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      body: { name: 'X', event_type: 'wedding', base_price: '1000.00' },
    })
    expect(status).toBe(401)
  })

  it('403 photographer cannot create', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: photographer.access_token,
      body: {
        name: 'X',
        event_type: 'wedding',
        base_price: '1000.00',
      },
    })
    expect(status).toBe(403)
  })

  it('400 missing name', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: { event_type: 'wedding', base_price: '1000.00' },
    })
    expect(status).toBe(400)
  })

  it('400 missing event_type', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: { name: 'X', base_price: '1000.00' },
    })
    expect(status).toBe(400)
  })

  it("400 base_price = '0'", async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: { name: 'X', event_type: 'wedding', base_price: '0' },
    })
    expect(status).toBe(400)
  })

  it('400 base_price negative', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: { name: 'X', event_type: 'wedding', base_price: '-10.00' },
    })
    expect(status).toBe(400)
  })

  it('400 turnaround_days = 0', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: {
        name: 'X',
        event_type: 'wedding',
        base_price: '1000.00',
        turnaround_days: 0,
      },
    })
    expect(status).toBe(400)
  })

  it('400 turnaround_days = 400 (over 365)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: {
        name: 'X',
        event_type: 'wedding',
        base_price: '1000.00',
        turnaround_days: 400,
      },
    })
    expect(status).toBe(400)
  })

  it('201 valid package → gst_amount in response', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/packages', {
      token: owner.access_token,
      body: {
        name: `Pkg ${Date.now()}`,
        event_type: 'birthday',
        base_price: '5000.00',
      },
    })
    expect(status).toBe(201)
    expect((body as { data: any }).data.gst_amount).toBeDefined()
  })
})

describe('PATCH /api/v1/packages/:id', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`, {
      body: { name: 'Y' },
    })
    expect(status).toBe(401)
  })

  it('403 not owner', async () => {
    const photographer = await getPhotographerToken()
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`, {
      token: photographer.access_token,
      body: { name: 'Y' },
    })
    expect(status).toBe(403)
  })

  it('400 empty body', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`, {
      token: owner.access_token,
      body: {},
    })
    expect(status).toBe(400)
  })

  it('404 Studio B package (RLS)', async () => {
    const admin = createAdminClient()
    const { data: bPkg } = await (admin.from('service_packages') as any)
      .insert({
        studio_id: STUDIO_B_ID,
        name: 'B-only',
        event_type: 'portrait',
        base_price: 1000,
        is_gst_applicable: true,
        is_active: true,
        sort_order: 0,
      })
      .select('id')
      .single()
    const pid = (bPkg as { id: string }).id
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${pid}`, {
      token: owner.access_token,
      body: { name: 'Nope' },
    })
    expect(status).toBe(404)
    await (admin.from('service_packages') as any).delete().eq('id', pid)
  })

  it('200 valid update', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`, {
      token: owner.access_token,
      body: { description: 'Updated in integration test' },
    })
    expect(status).toBe(200)
  })
})

describe('DELETE /api/v1/packages/:id', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`)
    expect(status).toBe(401)
  })

  it('403 not owner', async () => {
    const photographer = await getPhotographerToken()
    const { status } = await makeRequest('DELETE', `/api/v1/packages/${PACKAGE_PORTRAIT_ID}`, {
      token: photographer.access_token,
    })
    expect(status).toBe(403)
  })

  it('404 not found', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/packages/00000000-0000-4000-8000-000000000099`, {
      token: owner.access_token,
    })
    expect(status).toBe(404)
  })

  it('409 package linked to active booking', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/packages/${PACKAGE_WEDDING_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(409)
  })

  it('204 package with no active bookings deleted', async () => {
    const admin = createAdminClient()
    const { data: row } = await (admin.from('service_packages') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        name: `Delete me ${Date.now()}`,
        event_type: 'newborn',
        base_price: 1000,
        is_gst_applicable: true,
        is_active: true,
        sort_order: 99,
      })
      .select('id')
      .single()
    const pid = (row as { id: string }).id
    const { status } = await makeRequest('DELETE', `/api/v1/packages/${pid}`, { token: owner.access_token })
    expect(status).toBe(204)
  })

  it('package set is_active=FALSE in DB (not hard deleted)', async () => {
    const admin = createAdminClient()
    const { data: row } = await (admin.from('service_packages') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        name: `Soft del ${Date.now()}`,
        event_type: 'other',
        base_price: 2000,
        is_gst_applicable: true,
        is_active: true,
        sort_order: 98,
      })
      .select('id')
      .single()
    const pid = (row as { id: string }).id
    await makeRequest('DELETE', `/api/v1/packages/${pid}`, { token: owner.access_token })
    const { data: pkg } = await (admin.from('service_packages') as any).select('is_active').eq('id', pid).single()
    expect((pkg as { is_active: boolean }).is_active).toBe(false)
  })
})

describe('GET /api/v1/addons', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/addons')
    expect(status).toBe(401)
  })

  it('200 returns add-ons (seed: 3+)', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/addons', { token: owner.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data.length).toBeGreaterThanOrEqual(3)
  })

  it('Studio B cannot see Studio A add-ons', async () => {
    const { body } = await makeRequest('GET', '/api/v1/addons', { token: outsider.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((a) => a.id)
    expect(ids).not.toContain(ADDON_DRONE_ID)
  })
})

describe('POST/DELETE /api/v1/addons', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('403 not owner (POST)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/addons', {
      token: photographer.access_token,
      body: { name: 'X', price: '100.00', unit: 'flat' },
    })
    expect(status).toBe(403)
  })

  it("400 price = '0'", async () => {
    const { status } = await makeRequest('POST', '/api/v1/addons', {
      token: owner.access_token,
      body: { name: 'Zero', price: '0', unit: 'flat' },
    })
    expect(status).toBe(400)
  })

  it('400 invalid unit value', async () => {
    const { status } = await makeRequest('POST', '/api/v1/addons', {
      token: owner.access_token,
      body: { name: 'Bad unit', price: '100.00', unit: 'each' as any },
    })
    expect(status).toBe(400)
  })

  it('201 valid add-on created', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/addons', {
      token: owner.access_token,
      body: { name: `Addon ${Date.now()}`, price: '500.00', unit: 'flat' },
    })
    expect(status).toBe(201)
    expect((body as { data: any }).data.id).toBeTruthy()
  })

  it('204 delete add-on', async () => {
    const admin = createAdminClient()
    const { data: row } = await (admin.from('package_addons') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        name: `To delete ${Date.now()}`,
        price: 100,
        unit: 'flat',
        is_active: true,
      })
      .select('id')
      .single()
    const id = (row as { id: string }).id
    const { status } = await makeRequest('DELETE', `/api/v1/addons/${id}`, { token: owner.access_token })
    expect(status).toBe(204)
  })
})
