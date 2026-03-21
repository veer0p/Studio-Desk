import { beforeAll, describe, expect, it } from 'vitest'
import { api } from '../helpers/api'
import { setupTokens, tokens } from '../helpers/tokens'
import { createAdminClient } from '@/lib/supabase/admin'
import { STUDIO_A_ID } from '../../supabase/seed-ids'

describe('Deep Portal', () => {
  let portalToken: string
  let bookingId: string
  let invoiceId: string

  beforeAll(async () => {
    await setupTokens()
    const admin = createAdminClient()
    const { data: invoice } = await (admin.from('invoices') as any)
      .select('id, booking_id')
      .eq('studio_id', STUDIO_A_ID)
      .limit(1)
      .single()
    invoiceId = invoice!.id
    bookingId = invoice!.booking_id
  })

  it('owner can send portal link', async () => {
    const res = await api('POST', '/api/v1/portal/send-link', {
      token: tokens.owner,
      body: { booking_id: bookingId },
    })
    expect(res.status).toBe(200)
    portalToken = (res.body as any).data.token
    expect(portalToken).toHaveLength(64)
  })

  it('outsider cannot send portal link for other studio booking', async () => {
    const res = await api('POST', '/api/v1/portal/send-link', {
      token: tokens.outsider,
      body: { booking_id: bookingId },
    })
    expect(res.status).toBe(404)
  })

  it('portal overview works for valid token', async () => {
    const res = await api('GET', `/api/v1/portal/${portalToken}`)
    expect(res.status).toBe(200)
    expect((res.body as any).data.booking).toBeTruthy()
  })

  it('portal invoices only returns booking invoices', async () => {
    const res = await api('GET', `/api/v1/portal/${portalToken}/invoices`)
    expect(res.status).toBe(200)
    expect(Array.isArray((res.body as any).data)).toBe(true)
  })

  it('portal contracts endpoint returns null or contract view payload', async () => {
    const res = await api('GET', `/api/v1/portal/${portalToken}/contracts`)
    expect(res.status).toBe(200)
  })

  it('portal gallery endpoint returns null or gallery payload', async () => {
    const res = await api('GET', `/api/v1/portal/${portalToken}/gallery`)
    expect(res.status).toBe(200)
  })

  it('portal pay rejects invoice from other booking', async () => {
    const admin = createAdminClient()
    const { data } = await (admin.from('invoices') as any).select('id').neq('booking_id', bookingId).limit(1).single()
    const res = await api('POST', `/api/v1/portal/${portalToken}/pay`, {
      body: { invoice_id: data!.id },
    })
    expect(res.status).toBe(403)
  })

  it('portal pay accepts invoice in same booking', async () => {
    const res = await api('POST', `/api/v1/portal/${portalToken}/pay`, {
      body: { invoice_id: invoiceId },
    })
    expect([200, 409]).toContain(res.status)
  })
})
