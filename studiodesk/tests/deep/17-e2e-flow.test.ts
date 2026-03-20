import { beforeAll, describe, expect, it } from 'vitest'
import { api } from '../helpers/api'
import { setupTokens, tokens } from '../helpers/tokens'

describe('Deep E2E lifecycle smoke', () => {
  beforeAll(async () => {
    await setupTokens()
  })

  it(
    'inquiry -> lead list -> convert -> booking activity',
    async () => {
    const phone = `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`.slice(0, 10)
    const inquiry = await api('POST', '/api/v1/inquiry?studio=xyz-photography', {
      body: { full_name: 'Deep Flow User', phone, event_type: 'wedding' },
      headers: { 'x-forwarded-for': '198.51.100.250' },
    })
    expect(inquiry.status).toBe(201)
    const leadId = (inquiry.body as any).data.lead_id

    const lead = await api('GET', `/api/v1/leads/${leadId}`, { token: tokens.owner })
    expect(lead.status).toBe(200)

    const updateLead = await api('PATCH', `/api/v1/leads/${leadId}`, {
      token: tokens.owner,
      body: { status: 'contacted' },
    })
    expect(updateLead.status).toBe(200)

    const convert = await api('POST', `/api/v1/leads/${leadId}/convert`, {
      token: tokens.owner,
      body: { event_date: '2026-12-12', total_amount: '85000' },
    })
    expect(convert.status).toBe(201)
    const bookingId = (convert.body as any).data.booking_id

    const activity = await api('GET', `/api/v1/bookings/${bookingId}/activity`, {
      token: tokens.owner,
    })
    expect(activity.status).toBe(200)
    expect(Array.isArray((activity.body as any).data)).toBe(true)
    },
    30000
  )
})
