import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, type AuthToken } from '../helpers/auth'
import { STUDIO_A_ID } from '../../supabase/seed'
import { STEP_NAMES } from '@/lib/validations/studio.schema'
import { createAdminClient } from '@/lib/supabase/admin'

describe('GET /api/v1/studio/storage', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/studio/storage')
    expect(status).toBe(401)
  })

  it('200 returns used_gb, limit_gb, available_gb', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/studio/storage', { token: owner.access_token })
    expect(status).toBe(200)
    const d = (body as { data: any }).data
    expect(d).toMatchObject({
      used_gb: expect.any(Number),
      limit_gb: expect.any(Number),
      available_gb: expect.any(Number),
    })
  })

  it("status = 'ok' when usage < 80%", async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/storage', { token: owner.access_token })
    const d = (body as { data: any }).data
    if (d.usage_pct < 80) {
      expect(d.status).toBe('ok')
    }
  })

  it('usage_pct never exceeds 100', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/storage', { token: owner.access_token })
    expect((body as { data: any }).data.usage_pct).toBeLessThanOrEqual(100)
  })
})

describe('GET /api/v1/studio/onboarding', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/studio/onboarding')
    expect(status).toBe(401)
  })

  it('200 returns all 5 steps', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/studio/onboarding', { token: owner.access_token })
    expect(status).toBe(200)
    const steps = (body as { data: any }).data.steps
    expect(steps).toHaveLength(5)
  })

  it('steps array has correct step_names in order', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/onboarding', { token: owner.access_token })
    const steps = (body as { data: any }).data.steps as { step_number: number; step_name: string }[]
    const names = steps.map((s) => s.step_name)
    expect(names).toEqual([1, 2, 3, 4, 5].map((n) => STEP_NAMES[n]))
  })

  it('is_completed = true (Studio A completed onboarding)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/onboarding', { token: owner.access_token })
    expect((body as { data: any }).data.is_completed).toBe(true)
  })

  it('progress_pct = 100 (all steps done)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/studio/onboarding', { token: owner.access_token })
    expect((body as { data: any }).data.progress_pct).toBe(100)
  })
})

describe('POST /api/v1/studio/onboarding/:step', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/1', { body: { data: {} } })
    expect(status).toBe(401)
  })

  it('400 step = 0 (invalid)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/0', {
      token: owner.access_token,
      body: { data: {} },
    })
    expect(status).toBe(400)
  })

  it('400 step = 6 (invalid)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/6', {
      token: owner.access_token,
      body: { data: {} },
    })
    expect(status).toBe(400)
  })

  it('400 step 1 with empty body', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/1', {
      token: owner.access_token,
      body: { data: {} },
    })
    expect(status).toBe(400)
  })

  it('400 step 1 missing required name', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/1', {
      token: owner.access_token,
      body: {
        data: { phone: '9876543210', city: 'Surat', state: 'Gujarat' },
      },
    })
    expect(status).toBe(400)
  })

  it('400 step 1 invalid phone format', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/1', {
      token: owner.access_token,
      body: {
        data: { name: 'Test Studio', phone: '12345', city: 'Surat', state: 'Gujarat' },
      },
    })
    expect(status).toBe(400)
  })

  it('200 step 1 valid data → returns updated status', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/studio/onboarding/1', {
      token: owner.access_token,
      body: {
        data: { name: 'XYZ Photography', phone: '9876543210', city: 'Surat', state: 'Gujarat' },
      },
    })
    expect(status).toBe(200)
    expect((body as { data: any }).data.steps).toBeDefined()
  })

  it('200 step 2 empty body (skippable) → succeeds', async () => {
    const { status } = await makeRequest('POST', '/api/v1/studio/onboarding/2', {
      token: owner.access_token,
      body: { data: {} },
    })
    expect(status).toBe(200)
  })

  it('200 step 5 completes onboarding → is_completed = true in response', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/studio/onboarding/5', {
      token: owner.access_token,
      body: { data: {} },
    })
    expect(status).toBe(200)
    expect((body as { data: any }).data.is_completed).toBe(true)
  })

  it('step event logged to studio_onboarding_events table', async () => {
    const admin = createAdminClient()
    const { count } = await admin
      .from('studio_onboarding_events')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', STUDIO_A_ID)
    expect((count ?? 0) >= 1).toBe(true)
  })
})
