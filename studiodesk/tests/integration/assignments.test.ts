import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOutsiderToken, getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  ASSIGNMENT_CONFIRMED_ID,
  ASSIGNMENT_PENDING_ID,
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_INVOICE_NEW_ID,
  EDITOR_MEMBER_ID,
  PHOTOGRAPHER_MEMBER_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { resetAssignmentFixtures } from './helpers/assignment-fixtures'

describe('Assignments API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
    outsider = await getOutsiderToken()
  })

  beforeEach(async () => {
    await resetAssignmentFixtures()
  })

  it('GET /bookings/:id/assignments handles auth, studio scope, and member details', async () => {
    expect((await makeRequest('GET', `/api/v1/bookings/${BOOKING_CONVERTED_ID}/assignments`)).status).toBe(401)
    expect((await makeRequest('GET', `/api/v1/bookings/${BOOKING_CONVERTED_ID}/assignments`, { token: outsider.access_token })).status).toBe(404)
    const res = await makeRequest('GET', `/api/v1/bookings/${BOOKING_CONVERTED_ID}/assignments`, { token: owner.access_token })
    expect(res.status).toBe(200)
    expect(((res.body as any).data as any[]).length).toBeGreaterThanOrEqual(2)
    expect((res.body as any).data[0].member.display_name).toBeTruthy()
  })

  it('POST /bookings/:id/assignments validates owner access, closed bookings, conflicts, and upsert behavior', async () => {
    expect((await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/assignments`, { body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer' }] } })).status).toBe(401)
    expect((await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/assignments`, { token: photographer.access_token, body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer' }] } })).status).toBe(403)
    expect((await makeRequest('POST', '/api/v1/bookings/00000000-0000-4000-8000-000000000999/assignments', { token: owner.access_token, body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer' }] } })).status).toBe(404)

    await createAdminClient().from('bookings').update({ status: 'closed' }).eq('id', BOOKING_CONTRACT_SIGNED_ID)
    expect((await makeRequest('POST', `/api/v1/bookings/${BOOKING_CONTRACT_SIGNED_ID}/assignments`, { token: owner.access_token, body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer' }] } })).status).toBe(409)
    await createAdminClient().from('bookings').update({ status: 'contract_signed' }).eq('id', BOOKING_CONTRACT_SIGNED_ID)

    expect((await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/assignments`, { token: owner.access_token, body: { assignments: [{ member_id: 'c0000001-0001-4000-8000-000000009999', role: 'photographer' }] } })).status).toBe(400)

    const valid = await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/assignments`, {
      token: owner.access_token,
      body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer', notes: 'Cover portraits' }] },
    })
    expect(valid.status).toBe(200)
    const saved = await createAdminClient().from('shoot_assignments').select('id').eq('booking_id', BOOKING_INVOICE_NEW_ID).eq('member_id', PHOTOGRAPHER_MEMBER_ID)
    expect(saved.data?.length).toBe(1)

    const conflict = await makeRequest('POST', `/api/v1/bookings/${BOOKING_CONTRACT_SIGNED_ID}/assignments`, {
      token: owner.access_token,
      body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'photographer' }] },
    })
    expect(conflict.status).toBe(200)
    expect(((conflict.body as any).data.conflicts as any[]).length).toBeGreaterThan(0)
    let automationCount = 0
    for (let i = 0; i < 10; i += 1) {
      const automationLogs = await createAdminClient().from('automation_log').select('id').eq('studio_id', STUDIO_A_ID).eq('booking_id', BOOKING_CONTRACT_SIGNED_ID).eq('automation_type', 'custom')
      automationCount = automationLogs.data?.length ?? 0
      if (automationCount > 0) break
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    expect(automationCount).toBeGreaterThan(0)

    await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/assignments`, {
      token: owner.access_token,
      body: { assignments: [{ member_id: PHOTOGRAPHER_MEMBER_ID, role: 'videographer' }] },
    })
    const upserted = await createAdminClient().from('shoot_assignments').select('id, call_location').eq('booking_id', BOOKING_INVOICE_NEW_ID).eq('member_id', PHOTOGRAPHER_MEMBER_ID)
    expect(upserted.data?.length).toBe(1)
    expect(JSON.parse((upserted.data?.[0] as any).call_location).role).toBe('videographer')
  })

  it('PATCH /assignments/:id handles auth, role changes, confirm, and decline', async () => {
    expect((await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { body: { status: 'confirmed' } })).status).toBe(401)
    expect((await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { token: outsider.access_token, body: { status: 'confirmed' } })).status).toBe(404)
    expect((await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { token: photographer.access_token, body: { status: 'declined' } })).status).toBe(400)

    const confirm = await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_CONFIRMED_ID}`, {
      token: photographer.access_token,
      body: { status: 'confirmed' },
    })
    expect(confirm.status).toBe(200)
    expect((confirm.body as any).data.confirmed_at).toBeTruthy()

    const decline = await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_CONFIRMED_ID}`, {
      token: photographer.access_token,
      body: { status: 'declined', decline_reason: 'Booked elsewhere' },
    })
    expect(decline.status).toBe(200)
    expect((decline.body as any).data.declined_at).toBeTruthy()
    expect((decline.body as any).data.decline_reason).toBe('Booked elsewhere')

    const ownerUpdate = await makeRequest('PATCH', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, {
      token: owner.access_token,
      body: { role: 'editor' },
    })
    expect(ownerUpdate.status).toBe(200)
    expect((ownerUpdate.body as any).data.role).toBe('editor')
  })

  it('DELETE /assignments/:id enforces owner access and removes rows', async () => {
    expect((await makeRequest('DELETE', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { token: photographer.access_token })).status).toBe(403)
    expect((await makeRequest('DELETE', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { token: outsider.access_token })).status).toBe(404)
    expect((await makeRequest('DELETE', `/api/v1/assignments/${ASSIGNMENT_PENDING_ID}`, { token: owner.access_token })).status).toBe(204)
  })

  it('GET /team/schedule and /team/:memberId/assignments support filtering and permissions', async () => {
    expect((await makeRequest('GET', '/api/v1/team/schedule')).status).toBe(401)
    expect((await makeRequest('GET', '/api/v1/team/schedule?from_date=2026-01-01&to_date=2026-05-01', { token: owner.access_token })).status).toBe(400)

    const schedule = await makeRequest('GET', '/api/v1/team/schedule', { token: owner.access_token })
    expect(schedule.status).toBe(200)
    expect(((schedule.body as any).data as any[])[0].bookings.length).toBeGreaterThan(0)
    expect(((schedule.body as any).data as any[])[0]).toHaveProperty('unavailable_members')

    const empty = await makeRequest('GET', '/api/v1/team/schedule?from_date=2027-01-01&to_date=2027-01-10', { token: owner.access_token })
    expect(empty.status).toBe(200)
    expect((empty.body as any).data).toEqual([])

    expect((await makeRequest('GET', `/api/v1/team/${EDITOR_MEMBER_ID}/assignments`, { token: photographer.access_token })).status).toBe(403)
    expect((await makeRequest('GET', `/api/v1/team/${EDITOR_MEMBER_ID}/assignments`, { token: owner.access_token })).status).toBe(200)
    const own = await makeRequest('GET', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/assignments?status=confirmed`, { token: photographer.access_token })
    expect(own.status).toBe(200)
    expect(((own.body as any).data as any[]).every((row) => row.status === 'confirmed')).toBe(true)
    const ranged = await makeRequest('GET', `/api/v1/team/${PHOTOGRAPHER_MEMBER_ID}/assignments?from_date=2026-01-01&to_date=2026-12-31`, { token: owner.access_token })
    expect(ranged.status).toBe(200)
    expect(((ranged.body as any).data as any[]).length).toBeGreaterThan(0)
  })

  it('GET/POST /bookings/:id/shoot-brief handles null, create, update, arrays, and activity logging', async () => {
    expect((await makeRequest('GET', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/shoot-brief`)).status).toBe(401)
    const missing = await makeRequest('GET', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/shoot-brief`, { token: owner.access_token })
    expect(missing.status).toBe(200)
    expect((missing.body as any).data).toBeNull()

    const existing = await makeRequest('GET', `/api/v1/bookings/${BOOKING_CONVERTED_ID}/shoot-brief`, { token: owner.access_token })
    expect(existing.status).toBe(200)
    expect((existing.body as any).data.call_time).toBe('08:00')

    expect((await makeRequest('POST', `/api/v1/bookings/00000000-0000-4000-8000-000000000999/shoot-brief`, { token: owner.access_token, body: { call_time: '08:00' } })).status).toBe(404)
    expect((await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/shoot-brief`, { token: owner.access_token, body: {} })).status).toBe(400)

    const create = await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/shoot-brief`, {
      token: owner.access_token,
      body: {
        call_time: '07:30',
        shoot_start_time: '08:00',
        shoot_end_time: '18:00',
        shot_list: ['Arrival', 'Portraits'],
      },
    })
    expect(create.status).toBe(200)
    expect((create.body as any).data.shot_list).toEqual(['Arrival', 'Portraits'])

    const update = await makeRequest('POST', `/api/v1/bookings/${BOOKING_INVOICE_NEW_ID}/shoot-brief`, {
      token: owner.access_token,
      body: { special_instructions: 'Carry macro lens', shot_list: ['Arrival', 'Ceremony'] },
    })
    expect(update.status).toBe(200)
    expect((update.body as any).data.special_instructions).toBe('Carry macro lens')

    const feed = await createAdminClient().from('booking_activity_feed').select('id').eq('studio_id', STUDIO_A_ID).eq('booking_id', BOOKING_INVOICE_NEW_ID).eq('event_type', 'note_added')
    expect(feed.data?.length).toBeGreaterThan(0)
  })
})
