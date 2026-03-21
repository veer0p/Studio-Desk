import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOutsiderToken, type AuthToken } from '../helpers/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  STUDIO_B_ID,
  LEAD_1_ID,
  CLIENT_PRIYA_ID,
  PACKAGE_WEDDING_ID,
  OUTSIDER_MEMBER_ID,
  OWNER_MEMBER_ID,
} from '../../supabase/seed'

describe('RLS isolation (Studio B outsider)', () => {
  let outsider: AuthToken

  beforeAll(async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any)
      .update({ studio_id: STUDIO_B_ID, role: 'owner', is_active: true })
      .eq('id', OUTSIDER_MEMBER_ID)
    await (admin.from('service_packages') as any).delete().eq('studio_id', STUDIO_B_ID)
    outsider = await getOutsiderToken()
  })

  it('GET /studio/profile → returns Studio B data, not A', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/studio/profile', { token: outsider.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data.id).toBe(STUDIO_B_ID)
  })

  it('GET /team → returns Studio B members only', async () => {
    const { body } = await makeRequest('GET', '/api/v1/team', { token: outsider.access_token })
    expect((body as { data: any }).data).toHaveLength(1)
    expect((body as { data: any }).data[0].id).toBe(OUTSIDER_MEMBER_ID)
  })

  it('GET /packages → returns Studio B packages (empty)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/packages', { token: outsider.access_token })
    expect((body as { data: any }).data).toHaveLength(0)
  })

  it('GET /leads → returns Studio B leads only', async () => {
    const { body } = await makeRequest('GET', '/api/v1/leads', { token: outsider.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((l) => l.id)
    expect(ids).not.toContain(LEAD_1_ID)
  })

  it('PATCH /leads/[studioA_lead_id] → 404 not found', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/leads/${LEAD_1_ID}`, {
      token: outsider.access_token,
      body: { notes: 'x' },
    })
    expect(status).toBe(404)
  })

  it('GET /clients → returns Studio B clients only', async () => {
    const { body } = await makeRequest('GET', '/api/v1/clients', { token: outsider.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((c) => c.id)
    expect(ids).not.toContain(CLIENT_PRIYA_ID)
  })

  it('GET /clients/[studioA_client_id] → 404 not found', async () => {
    const { status } = await makeRequest('GET', `/api/v1/clients/${CLIENT_PRIYA_ID}`, {
      token: outsider.access_token,
    })
    expect(status).toBe(404)
  })

  it('PATCH /clients/[studioA_client_id] → 404 not found', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/clients/${CLIENT_PRIYA_ID}`, {
      token: outsider.access_token,
      body: { city: 'X' },
    })
    expect(status).toBe(404)
  })

  it('DELETE /team/[studioA_member_id] → 404 not found', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/team/${OWNER_MEMBER_ID}`, {
      token: outsider.access_token,
    })
    expect(status).toBe(404)
  })

  it('PATCH /packages/[studioA_package_id] → not found / validation (no access)', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/packages/${PACKAGE_WEDDING_ID}`, {
      token: outsider.access_token,
      body: { description: 'RLS isolation patch attempt' },
    })
    expect([400, 404]).toContain(status)
  })
})
