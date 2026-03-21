import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaymentService } from '@/lib/services/payment.service'
import { paymentRepo } from '@/lib/repositories/payment.repo'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/repositories/payment.repo', () => ({
  paymentRepo: {
    getPayments: vi.fn(),
    getPaymentById: vi.fn(),
    getPaymentByRazorpayId: vi.fn(),
    createPayment: vi.fn(),
    createRefund: vi.fn(),
    logWebhook: vi.fn(),
    updateWebhookLog: vi.fn(),
    checkWebhookIdempotency: vi.fn(),
  },
}))
vi.mock('@/lib/razorpay/client', () => ({
  verifyWebhookSignature: vi.fn(),
  paiseToRupees: (value: number) => value / 100,
}))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { verifyWebhookSignature } = await import('@/lib/razorpay/client')

function adminClient(invoice: any = null) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'invoices') {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: invoice })) })) })) }
      }
      return { insert: vi.fn(() => Promise.resolve({ error: null })) }
    }),
  } as any
}

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(paymentRepo.logWebhook).mockResolvedValue('log-1')
  })

  it('invalid signature logs and throws validation', async () => {
    vi.mocked(createAdminClient).mockReturnValue(adminClient())
    vi.mocked(verifyWebhookSignature).mockReturnValue(false)
    await expect(PaymentService.processRazorpayWebhook('body', 'bad', { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1' } } } })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(paymentRepo.logWebhook).toHaveBeenCalled()
    expect(paymentRepo.updateWebhookLog).toHaveBeenCalledWith(expect.anything(), 'log-1', expect.objectContaining({ processing_status: 'failed' }))
  })

  it('duplicate idempotency returns early', async () => {
    vi.mocked(createAdminClient).mockReturnValue(adminClient())
    vi.mocked(verifyWebhookSignature).mockReturnValue(true)
    vi.mocked(paymentRepo.checkWebhookIdempotency).mockResolvedValue(true)
    await expect(PaymentService.processRazorpayWebhook('body', 'sig', { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1' } } } })).resolves.toBe('duplicate')
  })

  it('payment.captured creates payment by order_id', async () => {
    vi.mocked(createAdminClient).mockReturnValue(adminClient({ id: 'i1', studio_id: 's1', booking_id: 'b1', invoice_type: 'advance' }))
    vi.mocked(verifyWebhookSignature).mockReturnValue(true)
    vi.mocked(paymentRepo.checkWebhookIdempotency).mockResolvedValue(false)
    vi.mocked(paymentRepo.getPaymentByRazorpayId).mockResolvedValue(null)
    await expect(
      PaymentService.processRazorpayWebhook('body', 'sig', {
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_1', amount: 2550000, order_id: 'order_1', currency: 'INR', method: 'upi', created_at: 1710000000 } } },
      })
    ).resolves.toBe('ok')
    expect(paymentRepo.createPayment).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ amount: '25500.00', method: 'upi', status: 'captured' }))
  })

  it('payment.failed creates failed payment record', async () => {
    vi.mocked(createAdminClient).mockReturnValue(adminClient({ id: 'i1', studio_id: 's1', booking_id: 'b1', invoice_type: 'balance' }))
    vi.mocked(verifyWebhookSignature).mockReturnValue(true)
    vi.mocked(paymentRepo.checkWebhookIdempotency).mockResolvedValue(false)
    vi.mocked(paymentRepo.getPaymentByRazorpayId).mockResolvedValue(null)
    await PaymentService.processRazorpayWebhook('body', 'sig', {
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_2', amount: 100000, order_id: 'order_1', currency: 'INR', method: 'card', error_description: 'Declined' } } },
    })
    expect(paymentRepo.createPayment).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: 'failed', failure_reason: 'Declined' }))
  })

  it('unknown events still log and finish silently', async () => {
    vi.mocked(createAdminClient).mockReturnValue(adminClient())
    vi.mocked(verifyWebhookSignature).mockReturnValue(true)
    vi.mocked(paymentRepo.checkWebhookIdempotency).mockResolvedValue(false)
    await expect(PaymentService.processRazorpayWebhook('body', 'sig', { event: 'unknown', payload: {} })).resolves.toBe('ok')
    expect(paymentRepo.logWebhook).toHaveBeenCalled()
  })
})
