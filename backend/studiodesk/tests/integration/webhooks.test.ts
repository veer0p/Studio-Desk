import crypto from 'crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'
import { makeRequest } from '../helpers/request'
import { INVOICE_LINK_ID, STUDIO_A_ID } from '../../supabase/seed'
import { resetInvoiceFixtures } from './helpers/invoice-fixtures'

function sign(body: string) {
  return crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex')
}

describe('Razorpay Webhooks Integration', () => {
  beforeEach(async () => {
    await resetInvoiceFixtures()
  })

  it('always returns 200, logs invalid signatures, and creates no payment', async () => {
    const payload = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_invalid_1', amount: 4000000, payment_link_id: 'plink_seed_001', currency: 'INR', method: 'upi', created_at: 1710000000 } } } }
    const res = await makeRequest('POST', '/api/v1/webhooks/razorpay', {
      body: payload,
      headers: { 'x-razorpay-signature': 'bad-signature' },
    })
    expect(res.status).toBe(200)
    const payments = await createAdminClient().from('payments').select('id').eq('razorpay_payment_id', 'pay_invalid_1')
    const logs = await createAdminClient().from('webhook_logs').select('signature_valid, processing_status').eq('provider', 'razorpay').order('created_at', { ascending: false }).limit(1)
    expect(payments.data?.length).toBe(0)
    expect((logs.data?.[0] as any).signature_valid).toBe(false)
  })

  it('processes payment.captured, enforces idempotency, and logs every request', async () => {
    const payload = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_webhook_1', amount: 4000000, payment_link_id: 'plink_seed_001', currency: 'INR', method: 'upi', created_at: 1710000000 } } } }
    const raw = JSON.stringify(payload)
    const headers = { 'x-razorpay-signature': sign(raw) }
    const first = await makeRequest('POST', '/api/v1/webhooks/razorpay', { body: payload, headers })
    const second = await makeRequest('POST', '/api/v1/webhooks/razorpay', { body: payload, headers })
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    const payment = await createAdminClient().from('payments').select('id').eq('razorpay_payment_id', 'pay_webhook_1')
    const invoice = await createAdminClient().from('invoices').select('status').eq('id', INVOICE_LINK_ID).single()
    const logs = await createAdminClient().from('webhook_logs').select('id').eq('provider', 'razorpay')
    expect(payment.data?.length).toBe(1)
    expect((invoice.data as any).status).toBe('paid')
    expect(logs.data?.length).toBeGreaterThanOrEqual(2)
  })

  it('processes payment.failed and stores failed payment row', async () => {
    const payload = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_failed_1', amount: 100000, payment_link_id: 'plink_seed_001', currency: 'INR', method: 'card', error_description: 'Declined', created_at: 1710000000 } } } }
    const raw = JSON.stringify(payload)
    const res = await makeRequest('POST', '/api/v1/webhooks/razorpay', {
      body: payload,
      headers: { 'x-razorpay-signature': sign(raw) },
    })
    expect(res.status).toBe(200)
    const payment = await createAdminClient().from('payments').select('status, failure_reason, studio_id').eq('razorpay_payment_id', 'pay_failed_1').single()
    expect((payment.data as any).status).toBe('failed')
    expect((payment.data as any).failure_reason).toBe('Declined')
    expect((payment.data as any).studio_id).toBe(STUDIO_A_ID)
  })
})
