import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, getEditorToken, getOutsiderToken, type AuthToken } from '../helpers/auth'
import {
  STUDIO_A_ID,
  OWNER_MEMBER_ID,
  PHOTOGRAPHER_MEMBER_ID,
  EDITOR_MEMBER_ID,
  OUTSIDER_MEMBER_ID,
  INVITE_PENDING_ID,
  INVITE_EXPIRED_ID,
} from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSecureToken } from '@/lib/crypto'

describe('GET /api/v1/team', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('GET', '/api/v1/team')
    expect(status).toBe(401)
  })

  it('200 returns active members (seed: 3+)', async () => {
    const { status, body } = await makeRequest('GET', '/api/v1/team', { token: owner.access_token })
    expect(status).toBe(200)
    expect((body as { data: any }).data.length).toBeGreaterThanOrEqual(3)
  })

  it('each member has id, role, display_name, is_active', async () => {
    const { body } = await makeRequest('GET', '/api/v1/team', { token: owner.access_token })
    for (const m of (body as { data: any }).data) {
      expect(m).toMatchObject({
        id: expect.any(String),
        role: expect.any(String),
        display_name: expect.anything(),
        is_active: true,
      })
    }
  })

  it('does NOT include Studio B members (RLS isolation)', async () => {
    const { body } = await makeRequest('GET', '/api/v1/team', { token: owner.access_token })
    const ids = ((body as { data: any }).data as { id: string }[]).map((x) => x.id)
    expect(ids).not.toContain(OUTSIDER_MEMBER_ID)
  })
})

describe('POST /api/v1/team/invite', () => {
  let owner: AuthToken
  let photographer: AuthToken
  let outsider: AuthToken

  beforeEach(async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any)
      .update({ role: 'owner', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', OWNER_MEMBER_ID)
    await (admin.from('studio_members') as any)
      .update({ role: 'photographer', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', PHOTOGRAPHER_MEMBER_ID)
    await (admin.from('studio_members') as any)
      .update({ role: 'editor', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', EDITOR_MEMBER_ID)

    const now = new Date()
    const pendingExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    const expiredExpiresAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()

    await (admin.from('studio_members') as any)
      .delete()
      .eq('studio_id', STUDIO_A_ID)
      .neq('id', OWNER_MEMBER_ID)
      .neq('id', PHOTOGRAPHER_MEMBER_ID)
      .neq('id', EDITOR_MEMBER_ID)

    await (admin.from('studio_invitations') as any)
      .delete()
      .eq('studio_id', STUDIO_A_ID)
      .neq('id', INVITE_PENDING_ID)
      .neq('id', INVITE_EXPIRED_ID)

    await (admin.from('studio_invitations') as any).upsert(
      [
        {
          id: INVITE_PENDING_ID,
          studio_id: STUDIO_A_ID,
          invited_by: OWNER_MEMBER_ID,
          email: 'pending@test.com',
          role: 'videographer',
          token: generateSecureToken(32),
          expires_at: pendingExpiresAt,
          accepted_at: null,
          resent_count: 0,
          last_resent_at: null,
        },
        {
          id: INVITE_EXPIRED_ID,
          studio_id: STUDIO_A_ID,
          invited_by: OWNER_MEMBER_ID,
          email: 'expired@test.com',
          role: 'assistant',
          token: generateSecureToken(32),
          expires_at: expiredExpiresAt,
          accepted_at: null,
          resent_count: 1,
          last_resent_at: null,
        },
      ],
      { onConflict: 'id' }
    )
  })

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
    outsider = await getOutsiderToken()
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      body: { email: 'x@test.com', role: 'editor' },
    })
    expect(status).toBe(401)
  })

  it('403 photographer cannot invite', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      token: photographer.access_token,
      body: { email: 'nobody@test.com', role: 'editor' },
    })
    expect(status).toBe(403)
  })

  it('400 invalid email format', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email: 'not-an-email', role: 'editor' },
    })
    expect(status).toBe(400)
  })

  it("400 role = 'owner' not allowed", async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email: 'ownerinvite@test.com', role: 'owner' as any },
    })
    expect(status).toBe(400)
  })

  it('422 studio plan limit reached (starter plan: Studio B)', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      token: outsider.access_token,
      body: { email: `quota-${Date.now()}@test.com`, role: 'editor' },
    })
    expect(status).toBe(422)
  })

  it('409 email already active member', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email: 'photographer@test.com', role: 'editor' },
    })
    expect(status).toBe(409)
  })

  it('201 valid invite → creates studio_invitations record', async () => {
    const email = `newinvite-${Date.now()}@test.com`
    const { status, body } = await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email, role: 'assistant' },
    })
    expect(status).toBe(201)
    const invId = (body as { data: any }).data.invitation_id
    expect(invId).toBeTruthy()
    const admin = createAdminClient()
    const { data } = await (admin.from('studio_invitations') as any).select('id').eq('id', invId).single()
    expect(data).toBeTruthy()
  })

  it('201 resend existing pending invite → resent: true', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email: 'pending@test.com', role: 'videographer' },
    })
    expect(status).toBe(201)
    expect((body as { data: any }).data.resent).toBe(true)
  })

  it('invitation email logged to automation_log', async () => {
    const admin = createAdminClient()
    const { data } = await (admin.from('automation_log') as any)
      .select('id')
      .eq('studio_id', STUDIO_A_ID)
      .eq('channel', 'email')
      .order('created_at', { ascending: false })
      .limit(1)
    expect(data?.length).toBeGreaterThan(0)
  })

  it('expired invite → creates new token, resets expiry', async () => {
    const admin = createAdminClient()
    const { data: before } = await (admin.from('studio_invitations') as any)
      .select('token, expires_at')
      .eq('id', INVITE_EXPIRED_ID)
      .single()
    const oldTok = (before as { token: string }).token
    await makeRequest('POST', '/api/v1/team/invite', {
      token: owner.access_token,
      body: { email: 'expired@test.com', role: 'assistant' },
    })
    const { data: after } = await (admin.from('studio_invitations') as any)
      .select('token, expires_at')
      .eq('email', 'expired@test.com')
      .eq('studio_id', STUDIO_A_ID)
      .single()
    expect((after as { token: string }).token).not.toBe(oldTok)
    expect(new Date((after as { expires_at: string }).expires_at).getTime()).toBeGreaterThan(Date.now() - 1000)
  })
})

describe('POST /api/v1/team/accept/:token', () => {
  it('400 token not 64 chars', async () => {
    const { status } = await makeRequest('POST', '/api/v1/team/accept/' + 'a'.repeat(10))
    expect(status).toBe(400)
  })

  it('400 token with non-hex characters', async () => {
    const tok = 'g'.repeat(64)
    const { status } = await makeRequest('POST', `/api/v1/team/accept/${tok}`)
    expect(status).toBe(400)
  })

  it('404 token not found in DB', async () => {
    const tok = 'c'.repeat(64)
    const { status } = await makeRequest('POST', `/api/v1/team/accept/${tok}`, {
      headers: { 'x-forwarded-for': '198.51.100.10' },
    })
    expect(status).toBe(404)
  })

  it('409 token already accepted', async () => {
    const admin = createAdminClient()
    const tok = generateSecureToken(32)
    const { data: inv } = await (admin.from('studio_invitations') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        invited_by: OWNER_MEMBER_ID,
        email: `accepted-${Date.now()}@test.com`,
        role: 'assistant',
        token: tok,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        accepted_at: new Date().toISOString(),
      })
      .select('token')
      .single()
    const { status } = await makeRequest('POST', `/api/v1/team/accept/${(inv as { token: string }).token}`, {
      headers: { 'x-forwarded-for': '198.51.100.11' },
    })
    expect(status).toBe(409)
  })

  it('400 token expired (use expired invite from seed)', async () => {
    // Use a dedicated expired invite so this test is independent of "expired invite → creates new token" which replaces the seed token
    const admin = createAdminClient()
    const expiredToken = generateSecureToken(32)
    await (admin.from('studio_invitations') as any).insert({
      studio_id: STUDIO_A_ID,
      invited_by: OWNER_MEMBER_ID,
      email: `expired-accept-${Date.now()}@test.com`,
      role: 'assistant',
      token: expiredToken,
      expires_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    })
    const { status } = await makeRequest('POST', `/api/v1/team/accept/${expiredToken}`, {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })
    expect(status).toBe(400)
  })

  it('200 valid token → creates studio_member', async () => {
    const admin = createAdminClient()
    const email = `accepter-${Date.now()}@test.com`
    const tok = generateSecureToken(32)
    await (admin.from('studio_invitations') as any).insert({
      studio_id: STUDIO_A_ID,
      invited_by: OWNER_MEMBER_ID,
      email,
      role: 'assistant',
      token: tok,
      expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    })
    const { status } = await makeRequest('POST', `/api/v1/team/accept/${tok}`, {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    })
    expect(status).toBe(200)
    const { data: user } = await admin.auth.admin.listUsers({ perPage: 300 })
    const u = user?.users?.find((x) => x.email === email)
    expect(u).toBeTruthy()
    const { data: mem } = await (admin.from('studio_members') as any)
      .select('id')
      .eq('studio_id', STUDIO_A_ID)
      .eq('user_id', u!.id)
      .maybeSingle()
    expect(mem).toBeTruthy()
  })

  it('200 valid token → marks invitation accepted_at', async () => {
    const admin = createAdminClient()
    const email = `accepter2-${Date.now()}@test.com`
    const tok = generateSecureToken(32)
    const { data: row } = await (admin.from('studio_invitations') as any)
      .insert({
        studio_id: STUDIO_A_ID,
        invited_by: OWNER_MEMBER_ID,
        email,
        role: 'assistant',
        token: tok,
        expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
      })
      .select('id')
      .single()
    await makeRequest('POST', `/api/v1/team/accept/${tok}`, {
      headers: { 'x-forwarded-for': '10.0.0.3' },
    })
    const { data: inv } = await (admin.from('studio_invitations') as any).select('accepted_at').eq('id', (row as any).id).single()
    expect((inv as { accepted_at: string | null }).accepted_at).toBeTruthy()
  })

  it('200 new user created in auth.users if not exists', async () => {
    const admin = createAdminClient()
    const email = `brandnew-${Date.now()}@test.com`
    const tok = generateSecureToken(32)
    await (admin.from('studio_invitations') as any).insert({
      studio_id: STUDIO_A_ID,
      invited_by: OWNER_MEMBER_ID,
      email,
      role: 'assistant',
      token: tok,
      expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    })
    const { data: before } = await admin.auth.admin.listUsers({ perPage: 400 })
    const nBefore = before?.users?.filter((u) => u.email === email).length ?? 0
    expect(nBefore).toBe(0)
    await makeRequest('POST', `/api/v1/team/accept/${tok}`, {
      headers: { 'x-forwarded-for': '10.0.0.4' },
    })
    const { data: after } = await admin.auth.admin.listUsers({ perPage: 400 })
    const hit = after?.users?.find((u) => u.email === email)
    expect(hit).toBeTruthy()
  })
})

describe('PATCH /api/v1/team/:memberId/role', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  beforeEach(async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any)
      .update({ role: 'owner', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', OWNER_MEMBER_ID)
    await (admin.from('studio_members') as any)
      .update({ role: 'photographer', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', PHOTOGRAPHER_MEMBER_ID)
    await (admin.from('studio_members') as any)
      .update({ role: 'editor', is_active: true, studio_id: STUDIO_A_ID })
      .eq('id', EDITOR_MEMBER_ID)
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      body: { role: 'editor' },
    })
    expect(status).toBe(401)
  })

  it('403 not owner', async () => {
    const editor = await getEditorToken()
    const { status } = await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      token: editor.access_token,
      body: { role: 'editor' },
    })
    expect(status).toBe(403)
  })

  it("400 role = 'owner' not allowed", async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'owner' as any },
    })
    expect(status).toBe(400)
  })

  it('400 changing own role', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/team/${OWNER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'editor' },
    })
    expect(status).toBe(400)
  })

  it('400 changing another owner role (target has owner role)', async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any).update({ role: 'owner' }).eq('id', PHOTOGRAPHER_MEMBER_ID)
    const { status } = await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'editor' },
    })
    expect(status).toBe(400)
    await (admin.from('studio_members') as any).update({ role: 'photographer' }).eq('id', PHOTOGRAPHER_MEMBER_ID)
  })

  it('404 member from Studio B (RLS — not found)', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/team/${OUTSIDER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'editor' },
    })
    expect(status).toBe(404)
  })

  it('200 valid role change', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'videographer' },
    })
    expect(status).toBe(200)
    await makeRequest('PATCH', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/role`, {
      token: owner.access_token,
      body: { role: 'photographer' },
    })
    expect(true).toBe(true)
  })
})

describe('DELETE /api/v1/team/:memberId', () => {
  let owner: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
  })

  afterAll(async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any)
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', EDITOR_MEMBER_ID)
  })

  it('401 no token', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/team/${EDITOR_MEMBER_ID}`)
    expect(status).toBe(401)
  })

  it('403 not owner', async () => {
    const photographer = await getPhotographerToken()
    const { status } = await makeRequest('DELETE', `/api/v1/team/${EDITOR_MEMBER_ID}`, {
      token: photographer.access_token,
    })
    expect(status).toBe(403)
  })

  it('400 removing yourself', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/team/${OWNER_MEMBER_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(400)
  })

  it('400 removing studio owner', async () => {
    const admin = createAdminClient()
    await (admin.from('studio_members') as any).update({ role: 'owner' }).eq('id', EDITOR_MEMBER_ID)
    const { status } = await makeRequest('DELETE', `/api/v1/team/${EDITOR_MEMBER_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(400)
    await (admin.from('studio_members') as any).update({ role: 'editor' }).eq('id', EDITOR_MEMBER_ID)
  })

  it('404 Studio B member (RLS)', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/team/${OUTSIDER_MEMBER_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(404)
  })

  it('204 valid removal → is_active = FALSE in DB', async () => {
    const { status } = await makeRequest('DELETE', `/api/v1/team/${EDITOR_MEMBER_ID}`, {
      token: owner.access_token,
    })
    expect(status).toBe(204)
    const admin = createAdminClient()
    const { data } = await (admin.from('studio_members') as any).select('is_active').eq('id', EDITOR_MEMBER_ID).single()
    expect((data as { is_active: boolean }).is_active).toBe(false)
  })
})
