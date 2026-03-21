import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  CLIENT_MEERA_ID,
  CLIENT_PRIYA_ID,
  EDITOR_MEMBER_ID,
  PHOTOGRAPHER_MEMBER_ID,
  STUDIO_A_ID,
} from '../../supabase/seed-ids'

const TODAY_BOOKING_A_ID = '6a000001-0001-4000-8000-000000000001'
const TODAY_BOOKING_B_ID = '6a000001-0001-4000-8000-000000000002'
const TODAY_ASSIGNMENT_A_ID = '6a000001-0001-4000-8000-000000000003'
const TODAY_ASSIGNMENT_B_ID = '6a000001-0001-4000-8000-000000000004'
const TODAY_BRIEF_ID = '6a000001-0001-4000-8000-000000000005'

function ymd(date: Date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function buildRevenueSnapshots() {
  const today = new Date()
  return Array.from({ length: 90 }, (_, index) => {
    const day = addDays(today, index - 89)
    return {
      studio_id: STUDIO_A_ID,
      snapshot_date: ymd(day),
      total_bookings: 8 + (index % 8),
      new_leads: index % 4,
      invoices_sent: 4 + (index % 5),
      revenue_collected: 3000 + (index * 137) % 12001,
      photos_delivered: 1 + (index % 6),
      storage_used_gb: Number((2.5 + index * 0.03).toFixed(4)),
    }
  })
}

async function resetDashboardFixtures() {
  const admin = createAdminClient()
  const today = ymd(new Date())
  const { data: studioClients } = await (admin.from('clients') as any).select('id').eq('studio_id', STUDIO_A_ID).limit(2)
  const clientAId = studioClients?.[0]?.id ?? CLIENT_PRIYA_ID
  const clientBId = studioClients?.[1]?.id ?? studioClients?.[0]?.id ?? CLIENT_MEERA_ID

  await (admin.from('revenue_snapshots') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('revenue_snapshots') as any).insert(buildRevenueSnapshots())

  await (admin.from('shoot_assignments') as any).delete().in('id', [TODAY_ASSIGNMENT_A_ID, TODAY_ASSIGNMENT_B_ID])
  await (admin.from('shoot_briefs') as any).delete().eq('id', TODAY_BRIEF_ID)
  await (admin.from('bookings') as any).delete().in('id', [TODAY_BOOKING_A_ID, TODAY_BOOKING_B_ID])

  await (admin.from('bookings') as any).insert([
    {
      id: TODAY_BOOKING_A_ID,
      studio_id: STUDIO_A_ID,
      client_id: clientAId,
      title: 'Priya Sharma - Wedding Today',
      event_type: 'wedding',
      event_date: today,
      venue_name: 'Hotel Grand, Surat',
      total_amount: 85000,
      advance_amount: 25500,
      amount_paid: 25500,
      gst_type: 'cgst_sgst',
      status: 'shoot_scheduled',
    },
    {
      id: TODAY_BOOKING_B_ID,
      studio_id: STUDIO_A_ID,
      client_id: clientBId,
      title: 'Meera Patel - Portrait Today',
      event_type: 'portrait',
      event_date: today,
      venue_name: 'Studio One, Surat',
      total_amount: 18000,
      advance_amount: 5000,
      amount_paid: 0,
      gst_type: 'cgst_sgst',
      status: 'shoot_scheduled',
    },
  ])

  await (admin.from('shoot_assignments') as any).upsert(
    [
      {
        id: TODAY_ASSIGNMENT_A_ID,
        studio_id: STUDIO_A_ID,
        booking_id: TODAY_BOOKING_A_ID,
        member_id: PHOTOGRAPHER_MEMBER_ID,
        role: 'photographer',
        call_time: `${today}T08:00:00.000Z`,
        call_location: JSON.stringify({ role: 'photographer', status: 'confirmed' }),
        is_confirmed: true,
        confirmed_at: `${today}T06:00:00.000Z`,
      },
      {
        id: TODAY_ASSIGNMENT_B_ID,
        studio_id: STUDIO_A_ID,
        booking_id: TODAY_BOOKING_B_ID,
        member_id: EDITOR_MEMBER_ID,
        role: 'editor',
        call_time: `${today}T10:00:00.000Z`,
        call_location: JSON.stringify({ role: 'editor', status: 'pending' }),
        is_confirmed: false,
        confirmed_at: null,
      },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('shoot_briefs') as any).upsert(
    {
      id: TODAY_BRIEF_ID,
      studio_id: STUDIO_A_ID,
      booking_id: TODAY_BOOKING_A_ID,
      venue_access_notes: 'Hotel Grand, Ring Road, Surat',
      contact_on_day: 'Priya Sharma',
      contact_phone: '9876543210',
      key_shots: ['Ceremony'],
      people_to_capture: {
        call_time: '08:00',
        shoot_start_time: '09:00',
        shoot_end_time: '20:00',
        venue_map_link: 'https://maps.google.com/example',
      },
    },
    { onConflict: 'booking_id' }
  )
}

async function cleanupDashboardFixtures() {
  const admin = createAdminClient()
  await (admin.from('shoot_assignments') as any).delete().in('id', [TODAY_ASSIGNMENT_A_ID, TODAY_ASSIGNMENT_B_ID])
  await (admin.from('shoot_briefs') as any).delete().eq('id', TODAY_BRIEF_ID)
  await (admin.from('bookings') as any).delete().in('id', [TODAY_BOOKING_A_ID, TODAY_BOOKING_B_ID])
}

describe('Dashboard API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  beforeEach(async () => {
    process.env.CRON_SECRET = 'dashboard-secret'
    await resetDashboardFixtures()
  })

  afterEach(async () => {
    await cleanupDashboardFixtures()
  })

  it('GET /dashboard/overview enforces auth and returns overview payload', async () => {
    expect((await makeRequest('GET', '/api/v1/dashboard/overview')).status).toBe(401)

    const res = await makeRequest('GET', '/api/v1/dashboard/overview', { token: photographer.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data.attention_items).toBeInstanceOf(Array)
    expect((res.body as any).data.this_month).toHaveProperty('revenue_collected')
    expect((res.body as any).data.upcoming_week.days).toHaveLength(7)
    expect(res.headers.get('cache-control')).toContain('max-age=120')
  })

  it('GET /dashboard/today applies role filtering and no-store cache', async () => {
    expect((await makeRequest('GET', '/api/v1/dashboard/today')).status).toBe(401)

    const ownerRes = await makeRequest('GET', '/api/v1/dashboard/today', { token: owner.access_token })
    expect(ownerRes.status).toBe(200)
    expect((ownerRes.body as any).data.shoot_count).toBeGreaterThanOrEqual(0)

    const photographerRes = await makeRequest('GET', '/api/v1/dashboard/today', { token: photographer.access_token })
    expect(photographerRes.status).toBe(200)
    expect((photographerRes.body as any).data.shoot_count).toBeLessThanOrEqual((ownerRes.body as any).data.shoot_count)
    expect(photographerRes.headers.get('cache-control')).toBe('no-store')

    await createAdminClient().from('bookings').update({ event_date: ymd(addDays(new Date(), 2)) }).in('id', [TODAY_BOOKING_A_ID, TODAY_BOOKING_B_ID])
    const emptyRes = await makeRequest('GET', '/api/v1/dashboard/today', { token: owner.access_token })
    expect(emptyRes.status).toBe(200)
    expect((emptyRes.body as any).data.has_shoots).toBe(false)
  })

  it('GET /analytics/revenue is owner-only and validates months', async () => {
    expect((await makeRequest('GET', '/api/v1/analytics/revenue')).status).toBe(401)
    expect((await makeRequest('GET', '/api/v1/analytics/revenue', { token: photographer.access_token })).status).toBe(403)
    expect((await makeRequest('GET', '/api/v1/analytics/revenue?months=7', { token: owner.access_token })).status).toBe(400)

    const res = await makeRequest('GET', '/api/v1/analytics/revenue?months=12', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect(Array.isArray((res.body as any).data.chart_data)).toBe(true)
    expect((res.body as any).data.chart_data[0]).toHaveProperty('month')
    expect((res.body as any).data.chart_data[0]).toHaveProperty('collected')
    expect(res.headers.get('cache-control')).toContain('max-age=600')
  })

  it('GET /analytics/bookings returns funnel analytics', async () => {
    expect((await makeRequest('GET', '/api/v1/analytics/bookings', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/analytics/bookings?period=last_month', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data).toHaveProperty('funnel')
    expect((res.body as any).data).toHaveProperty('by_source')
    expect((res.body as any).data).toHaveProperty('by_event_type')
    expect((res.body as any).data).toHaveProperty('conversion_rate_pct')
    expect((res.body as any).data.period).toBe('last_month')
  })

  it('GET /analytics/performance returns gallery and team metrics', async () => {
    expect((await makeRequest('GET', '/api/v1/analytics/performance', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/analytics/performance', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data).toHaveProperty('gallery')
    expect((res.body as any).data).toHaveProperty('team')
    expect((res.body as any).data.team[0]).toHaveProperty('confirmation_rate_pct')
    expect((res.body as any).data.gallery).toHaveProperty('avg_delivery_days')
  })

  it('POST /cron/snapshot requires cron secret and upserts today snapshots', async () => {
    expect((await makeRequest('POST', '/api/v1/cron/snapshot')).status).toBe(401)

    const res = await makeRequest('POST', '/api/v1/cron/snapshot', {
      headers: { Authorization: 'Bearer dashboard-secret' },
    })
    expect(res.status).toBe(200)

    const admin = createAdminClient()
    const activeStudios = await (admin.from('studios') as any).select('id').eq('is_active', true).eq('subscription_status', 'active')
    const todayRows = await (admin.from('revenue_snapshots') as any).select('studio_id').eq('snapshot_date', ymd(new Date()))
    expect(todayRows.data?.length).toBeGreaterThanOrEqual(activeStudios.data?.length ?? 0)
  })
})

function resolvedIds(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).sort()
}
