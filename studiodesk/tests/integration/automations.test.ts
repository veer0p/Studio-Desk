import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_GALLERY_B_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { resetAutomationFixtures } from './helpers/automation-fixtures'

async function waitForCount(query: () => Promise<number>, expectedMin = 1) {
  for (let i = 0; i < 10; i += 1) {
    const count = await query()
    if (count >= expectedMin) return count
    await new Promise((resolve) => setTimeout(resolve, 75))
  }
  return query()
}

describe('Automations API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  beforeEach(async () => {
    await resetAutomationFixtures()
  })

  it('GET /automations/settings returns seeded settings and reseeds when empty', async () => {
    expect((await makeRequest('GET', '/api/v1/automations/settings')).status).toBe(401)
    expect((await makeRequest('GET', '/api/v1/automations/settings', { token: photographer.access_token })).status).toBe(403)

    const seeded = await makeRequest('GET', '/api/v1/automations/settings', { token: owner.access_token })
    expect(seeded.status).toBe(200)
    expect((seeded.body as any).data.length).toBe(15)
    expect((seeded.body as any).data.every((row: any) => row.label && row.description && row.trigger)).toBe(true)
    expect((seeded.body as any).data.find((row: any) => row.automation_type === 'shoot_reminder')?.delay_days).toBe(1)

    const admin = createAdminClient()
    await admin.from('automation_settings').delete().eq('studio_id', STUDIO_A_ID)
    const reseeded = await makeRequest('GET', '/api/v1/automations/settings', { token: owner.access_token })
    expect(reseeded.status).toBe(200)
    expect((reseeded.body as any).data.length).toBe(15)
  })

  it('PATCH /automations/settings validates input and persists updates', async () => {
    expect(
      (
        await makeRequest('PATCH', '/api/v1/automations/settings', {
          token: photographer.access_token,
          body: { settings: [{ automation_type: 'lead_acknowledgment', is_enabled: false }] },
        })
      ).status
    ).toBe(403)

    expect(
      (
        await makeRequest('PATCH', '/api/v1/automations/settings', {
          token: owner.access_token,
          body: { settings: [{ automation_type: 'lead_follow_up', delay_days: 31 }] },
        })
      ).status
    ).toBe(400)

    expect(
      (
        await makeRequest('PATCH', '/api/v1/automations/settings', {
          token: owner.access_token,
          body: { settings: [{ automation_type: 'lead_follow_up', send_time: '9am' }] },
        })
      ).status
    ).toBe(400)

    const res = await makeRequest('PATCH', '/api/v1/automations/settings', {
      token: owner.access_token,
      body: {
        settings: [
          { automation_type: 'lead_follow_up', is_enabled: false },
          { automation_type: 'shoot_reminder', delay_days: 1 },
        ],
      },
    })
    expect(res.status).toBe(200)
    const updated = (res.body as any).data
    expect(updated.find((row: any) => row.automation_type === 'lead_follow_up')?.is_enabled).toBe(false)
    expect(updated.find((row: any) => row.automation_type === 'shoot_reminder')?.delay_days).toBe(1)
  })

  it('GET /automations/log supports paging, filters, and studio isolation', async () => {
    expect((await makeRequest('GET', '/api/v1/automations/log', { token: photographer.access_token })).status).toBe(403)

    const page = await makeRequest('GET', '/api/v1/automations/log?page=0&pageSize=2', {
      token: owner.access_token,
    })
    expect(page.status).toBe(200)
    expect((page.body as any).meta.pageSize).toBe(2)
    expect((page.body as any).data.length).toBeLessThanOrEqual(2)

    const typeFiltered = await makeRequest('GET', '/api/v1/automations/log?automation_type=gallery_ready', {
      token: owner.access_token,
    })
    expect(typeFiltered.status).toBe(200)
    expect(((typeFiltered.body as any).data as any[]).every((row) => row.automation_type === 'gallery_ready')).toBe(true)

    const statusFiltered = await makeRequest('GET', '/api/v1/automations/log?status=sent', {
      token: owner.access_token,
    })
    expect(statusFiltered.status).toBe(200)
    expect(((statusFiltered.body as any).data as any[]).every((row) => row.status === 'sent')).toBe(true)

    const bookingFiltered = await makeRequest('GET', `/api/v1/automations/log?booking_id=${BOOKING_CONVERTED_ID}`, {
      token: owner.access_token,
    })
    expect(bookingFiltered.status).toBe(200)
    expect(((bookingFiltered.body as any).data as any[]).every((row) => row.booking_id === BOOKING_CONVERTED_ID)).toBe(true)
    expect(((bookingFiltered.body as any).data as any[]).some((row) => row.recipient_name === 'Studio B Owner')).toBe(false)
  })

  it('POST /automations/trigger validates scope and creates a log entry', async () => {
    expect(
      (
        await makeRequest('POST', '/api/v1/automations/trigger', {
          token: photographer.access_token,
          body: { automation_type: 'shoot_reminder', booking_id: BOOKING_CONVERTED_ID },
        })
      ).status
    ).toBe(403)

    expect(
      (
        await makeRequest('POST', '/api/v1/automations/trigger', {
          token: owner.access_token,
          body: { automation_type: 'shoot_reminder' },
        })
      ).status
    ).toBe(400)

    expect(
      (
        await makeRequest('POST', '/api/v1/automations/trigger', {
          token: owner.access_token,
          body: { automation_type: 'shoot_reminder', booking_id: BOOKING_GALLERY_B_ID },
        })
      ).status
    ).toBe(404)

    const admin = createAdminClient()
    const before = await admin
      .from('automation_log')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', STUDIO_A_ID)
      .eq('booking_id', BOOKING_CONVERTED_ID)

    const res = await makeRequest('POST', '/api/v1/automations/trigger', {
      token: owner.access_token,
      body: { automation_type: 'shoot_reminder', booking_id: BOOKING_CONVERTED_ID },
    })
    expect(res.status).toBe(200)
    expect((res.body as any).data.message).toContain('triggered')

    const after = await waitForCount(async () => {
      const rows = await admin
        .from('automation_log')
        .select('id')
        .eq('studio_id', STUDIO_A_ID)
        .eq('booking_id', BOOKING_CONVERTED_ID)
      return rows.data?.length ?? 0
    }, (before.count ?? 0) + 1)
    expect(after).toBeGreaterThan(before.count ?? 0)
  })

  it('GET /automations/templates returns built-in templates and seeded custom templates', async () => {
    expect((await makeRequest('GET', '/api/v1/automations/templates', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/automations/templates', { token: owner.access_token })
    expect(res.status).toBe(200)
    const data = (res.body as any).data as Array<any>
    expect(data.filter((row) => row.type === 'built_in').length).toBe(15)
    expect(data.some((row) => row.type === 'custom')).toBe(true)
    expect(data.every((row) => Array.isArray(row.variables))).toBe(true)
  })

  it('POST /automations/test validates phone and returns success', async () => {
    expect(
      (
        await makeRequest('POST', '/api/v1/automations/test', {
          token: photographer.access_token,
          body: { automation_type: 'lead_acknowledgment', phone: '9876543210' },
        })
      ).status
    ).toBe(403)

    expect(
      (
        await makeRequest('POST', '/api/v1/automations/test', {
          token: owner.access_token,
          body: { automation_type: 'lead_acknowledgment', phone: '123' },
        })
      ).status
    ).toBe(400)

    const res = await makeRequest('POST', '/api/v1/automations/test', {
      token: owner.access_token,
      body: { automation_type: 'lead_acknowledgment', phone: '9876543210', channel: 'whatsapp' },
    })
    expect(res.status).toBe(200)
    expect((res.body as any).data.message).toContain('+91')
  })

  it('GET /automations/stats returns summary metrics and cache headers', async () => {
    expect((await makeRequest('GET', '/api/v1/automations/stats', { token: photographer.access_token })).status).toBe(403)

    const res = await makeRequest('GET', '/api/v1/automations/stats?period=this_month', {
      token: owner.access_token,
    })
    expect(res.status).toBe(200)
    expect((res.body as any).data.total_sent).toBeGreaterThan(0)
    expect((res.body as any).data.delivery_rate_pct).toBeDefined()
    expect((res.body as any).data.by_channel).toHaveProperty('whatsapp')
    expect((res.body as any).data.by_type).toHaveProperty('lead_acknowledgment')
    expect(res.headers.get('cache-control')).toContain('max-age=300')
  })
})
