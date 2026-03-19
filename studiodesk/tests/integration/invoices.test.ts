import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  BOOKING_INVOICE_DUP_ID,
  BOOKING_INVOICE_NEW_ID,
  INVOICE_DRAFT_ID,
  INVOICE_LINK_ID,
  INVOICE_LINK_TOKEN,
  INVOICE_OVERDUE_ID,
  INVOICE_PAID_ID,
  INVOICE_SENT_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { resetInvoiceFixtures } from './helpers/invoice-fixtures'

describe('Invoices API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
  })

  beforeEach(async () => {
    await resetInvoiceFixtures()
  })

  it('GET /invoices handles auth, filters, pagination, and auto overdue marking', async () => {
    expect((await makeRequest('GET', '/api/v1/invoices')).status).toBe(401)
    const admin = createAdminClient()
    await admin.from('invoices').update({ status: 'sent', due_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) }).eq('id', INVOICE_SENT_ID)
    const res = await makeRequest('GET', '/api/v1/invoices?page=0&pageSize=2&invoice_type=advance', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data.length).toBeLessThanOrEqual(2)
    let status: string | null = null
    for (let i = 0; i < 10; i += 1) {
      const overdue = await admin.from('invoices').select('status').eq('id', INVOICE_SENT_ID).single()
      status = (overdue.data as any)?.status ?? null
      if (status === 'overdue') {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    expect(status).toBe('overdue')
  })

  it('POST /invoices validates access, duplicate advance, and creates invoice with GST + line items', async () => {
    expect((await makeRequest('POST', '/api/v1/invoices', { token: photographer.access_token, body: { booking_id: BOOKING_INVOICE_NEW_ID, invoice_type: 'advance', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '100.00' }] } })).status).toBe(403)
    expect((await makeRequest('POST', '/api/v1/invoices', { token: owner.access_token, body: { booking_id: '00000000-0000-0000-0000-000000000000', invoice_type: 'advance', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '100.00' }] } })).status).toBe(404)
    expect((await makeRequest('POST', '/api/v1/invoices', { token: owner.access_token, body: { booking_id: BOOKING_INVOICE_NEW_ID, invoice_type: 'advance', line_items: [] } })).status).toBe(400)
    expect((await makeRequest('POST', '/api/v1/invoices', { token: owner.access_token, body: { booking_id: BOOKING_INVOICE_DUP_ID, invoice_type: 'advance', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '100.00' }] } })).status).toBe(409)

    const created = await makeRequest('POST', '/api/v1/invoices', {
      token: owner.access_token,
      body: {
        booking_id: BOOKING_INVOICE_NEW_ID,
        invoice_type: 'advance',
        gst_type: 'cgst_sgst',
        line_items: [{ name: 'Wedding Photography - Full Day', quantity: '1', unit_price: '85000.00' }],
      },
    })
    expect(created.status).toBe(201)
    expect((created.body as any).data.invoice_number).toMatch(/^XYZ-FY\d{4}-0001$/)
    expect((created.body as any).data.cgst_amount).toBe('7650.00')
    expect((created.body as any).data.sgst_amount).toBe('7650.00')
    const lineItems = await createAdminClient().from('invoice_line_items').select('studio_id').eq('invoice_id', (created.body as any).data.id)
    expect(lineItems.data?.every((row: any) => row.studio_id === STUDIO_A_ID)).toBe(true)
  })

  it('PATCH /invoices/:id updates allowed fields and rejects amount changes', async () => {
    const notes = await makeRequest('PATCH', `/api/v1/invoices/${INVOICE_DRAFT_ID}`, {
      token: owner.access_token,
      body: { notes: 'Updated notes' },
    })
    expect(notes.status).toBe(200)
    expect((notes.body as any).data.notes).toBe('Updated notes')
    expect((await makeRequest('PATCH', `/api/v1/invoices/${INVOICE_DRAFT_ID}`, { token: owner.access_token, body: { due_date: '2026-04-01' } })).status).toBe(200)
    expect((await makeRequest('PATCH', `/api/v1/invoices/${INVOICE_DRAFT_ID}`, { token: owner.access_token, body: { total_amount: '1.00' } })).status).toBe(400)
    expect((await makeRequest('PATCH', `/api/v1/invoices/${INVOICE_DRAFT_ID}`, { token: owner.access_token, body: { gst_type: 'igst' } })).status).toBe(400)
  })

  it('send, payment-link, record-payment, and credit-note flows work', async () => {
    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_PAID_ID}/send`, { token: owner.access_token })).status).toBe(409)
    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_DRAFT_ID}/send`, { token: owner.access_token })).status).toBe(200)

    const beforeAutomation = await createAdminClient().from('automation_log').select('id')
      .eq('studio_id', STUDIO_A_ID).eq('automation_type', 'advance_payment_reminder')
    expect(beforeAutomation.data).toBeTruthy()

    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_PAID_ID}/payment-link`, { token: owner.access_token })).status).toBe(409)
    const generated = await makeRequest('POST', `/api/v1/invoices/${INVOICE_SENT_ID}/payment-link`, { token: owner.access_token })
    expect(generated.status).toBe(200)
    expect((generated.body as any).data.payment_link_url).toContain('https://rzp.io/i/test-')
    const reused = await makeRequest('POST', `/api/v1/invoices/${INVOICE_SENT_ID}/payment-link`, { token: owner.access_token })
    expect((reused.body as any).data.payment_link_url).toBe((generated.body as any).data.payment_link_url)
    const gatewayLogs = await createAdminClient().from('payment_gateway_logs').select('id').eq('studio_id', STUDIO_A_ID).eq('operation', 'create_payment_link')
    expect(gatewayLogs.data?.length).toBeGreaterThan(0)

    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_PAID_ID}/record-payment`, { token: owner.access_token, body: { amount: '1.00', method: 'cash' } })).status).toBe(409)
    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_SENT_ID}/record-payment`, { token: owner.access_token, body: { amount: '30000.00', method: 'cash' } })).status).toBe(400)
    const paid = await makeRequest('POST', `/api/v1/invoices/${INVOICE_SENT_ID}/record-payment`, {
      token: owner.access_token,
      body: { amount: '25500.00', method: 'cash', reference_number: 'CASH-001' },
    })
    expect(paid.status).toBe(201)
    const invoice = await createAdminClient().from('invoices').select('amount_paid,status').eq('id', INVOICE_SENT_ID).single()
    const booking = await createAdminClient().from('bookings').select('amount_paid').eq('id', BOOKING_INVOICE_DUP_ID).single()
    expect((invoice.data as any).amount_paid).toBe(25500)
    expect((invoice.data as any).status).toBe('paid')
    expect((booking.data as any).amount_paid).toBe(25500)

    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_LINK_ID}/credit-note`, { token: owner.access_token, body: { amount: '10.00', reason: 'Invoice not paid yet' } })).status).toBe(409)
    expect((await makeRequest('POST', `/api/v1/invoices/${INVOICE_PAID_ID}/credit-note`, { token: owner.access_token, body: { amount: '26000.00', reason: 'Excess credit note amount' } })).status).toBe(400)
    const credit = await makeRequest('POST', `/api/v1/invoices/${INVOICE_PAID_ID}/credit-note`, {
      token: owner.access_token,
      body: { amount: '5000.00', reason: 'Client discount adjustment approved' },
    })
    expect(credit.status).toBe(201)
    expect((credit.body as any).data.credit_note_for).toBe(INVOICE_PAID_ID)
  })

  it('public invoice view and finance endpoints return safe data', async () => {
    expect((await makeRequest('GET', '/api/v1/invoices/view/not-a-token')).status).toBe(400)
    expect((await makeRequest('GET', `/api/v1/invoices/view/${'a'.repeat(64)}`)).status).toBe(404)
    const res = await makeRequest('GET', `/api/v1/invoices/view/${INVOICE_LINK_TOKEN}`)
    expect(res.status).toBe(200)
    expect((res.body as any).data).not.toHaveProperty('internal_notes')
    expect((res.body as any).data.studio).not.toHaveProperty('bank_account_number')
    const viewed = await createAdminClient().from('invoices').select('viewed_at').eq('id', INVOICE_LINK_ID).single()
    expect((viewed.data as any).viewed_at).toBeTruthy()

    expect((await makeRequest('GET', '/api/v1/finance/summary', { token: photographer.access_token })).status).toBe(403)
    expect((await makeRequest('GET', '/api/v1/finance/summary', { token: owner.access_token })).status).toBe(200)
    expect((await makeRequest('GET', '/api/v1/finance/outstanding')).status).toBe(401)
    const outstanding = await makeRequest('GET', '/api/v1/finance/outstanding', { token: owner.access_token })
    expect(outstanding.status).toBe(200)
    expect(((outstanding.body as any).data as any[]).some((row) => row.id === INVOICE_OVERDUE_ID)).toBe(true)
  })
})
