import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'
import { verifyWebhookSignature, paiseToRupees } from '@/lib/razorpay/client'
import { paymentRepo } from '@/lib/repositories/payment.repo'

function moneyFromPaise(value: number) {
  return paiseToRupees(value).toFixed(2)
}

function mapRazorpayMethod(method: string) {
  if (method === 'card') return 'card'
  if (method === 'netbanking') return 'net_banking'
  if (method === 'wallet') return 'wallet'
  if (method === 'upi') return 'upi'
  return 'other'
}

async function findInvoice(admin: ReturnType<typeof createAdminClient>, orderId?: string, paymentLinkId?: string) {
  if (orderId) {
    const { data } = await (admin.from('invoices') as any)
      .select('id, studio_id, booking_id, invoice_type')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()
    if (data) return data
  }
  if (paymentLinkId) {
    const { data } = await (admin.from('invoices') as any)
      .select('id, studio_id, booking_id, invoice_type')
      .eq('razorpay_payment_link_id', paymentLinkId)
      .maybeSingle()
    if (data) return data
  }
  return null
}

export const PaymentService = {
  async getPayments(supabase: any, studioId: string, params: any) {
    return paymentRepo.getPayments(supabase, studioId, params)
  },

  async getPaymentById(supabase: any, paymentId: string, studioId: string) {
    const payment = await paymentRepo.getPaymentById(supabase, paymentId, studioId)
    if (!payment) throw Errors.notFound('Payment')
    return payment
  },

  async processRazorpayWebhook(rawBody: string, signature: string, eventPayload: any) {
    const admin = createAdminClient()
    const paymentEntity = eventPayload?.payload?.payment?.entity
    const refundEntity = eventPayload?.payload?.refund?.entity
    const baseKey = paymentEntity?.id ?? refundEntity?.id ?? `evt:${Date.now()}`
    const isValid = verifyWebhookSignature(rawBody, signature)
    const logId = await paymentRepo.logWebhook(admin, {
      direction: 'inbound',
      provider: 'razorpay',
      event_type: eventPayload?.event ?? 'unknown',
      payload: eventPayload,
      signature_valid: isValid,
      idempotency_key: baseKey,
      processing_status: 'received',
    })
    if (!isValid) {
      await paymentRepo.updateWebhookLog(admin, logId, {
        processing_status: 'failed',
        processing_error: 'Invalid signature',
        processed_at: new Date().toISOString(),
      })
      throw Errors.validation('Invalid webhook signature')
    }
    if (await paymentRepo.checkWebhookIdempotency(admin, baseKey)) {
      await paymentRepo.updateWebhookLog(admin, logId, {
        processing_status: 'duplicate',
        processed_at: new Date().toISOString(),
      })
      return 'duplicate'
    }
    switch (eventPayload?.event) {
      case 'payment.captured': {
        const payment = paymentEntity
        const invoice = await findInvoice(admin, payment?.order_id, payment?.payment_link_id)
        if (invoice && !(await paymentRepo.getPaymentByRazorpayId(admin, payment.id))) {
          // @ts-expect-error: residual strict constraint
          await paymentRepo.createPayment(admin, {
            studio_id: invoice.studio_id,
            invoice_id: invoice.id,
            booking_id: invoice.booking_id,
            amount: moneyFromPaise(payment.amount),
            currency: payment.currency ?? 'INR',
            method: mapRazorpayMethod(payment.method),
            status: 'captured',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id ?? null,
            captured_at: new Date((payment.created_at ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
          })
          (admin.from('booking_activity_feed') as any).insert({
            studio_id: invoice.studio_id,
            booking_id: invoice.booking_id,
            event_type: invoice.invoice_type === 'advance' ? 'advance_payment_received' : 'balance_payment_received',
            actor_type: 'system',
            metadata: { razorpay_payment_id: payment.id, amount: moneyFromPaise(payment.amount) },
          }).then(() => {}).catch(() => {})
        }
        break
      }
      case 'payment.failed': {
        const payment = paymentEntity
        const invoice = await findInvoice(admin, payment?.order_id, payment?.payment_link_id)
        if (invoice && !(await paymentRepo.getPaymentByRazorpayId(admin, payment.id))) {
          await paymentRepo.createPayment(admin, {
            studio_id: invoice.studio_id,
            invoice_id: invoice.id,
            booking_id: invoice.booking_id,
            amount: moneyFromPaise(payment.amount),
            currency: payment.currency ?? 'INR',
            method: mapRazorpayMethod(payment.method),
            status: 'failed',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id ?? null,
            failed_at: new Date().toISOString(),
            failure_reason: payment.error_description ?? 'Payment failed',
          })
        }
        break
      }
      case 'refund.processed': {
        const refund = refundEntity
        const payment = await paymentRepo.getPaymentByRazorpayId(admin, refund?.payment_id ?? '')
        if (payment) {
          await paymentRepo.createRefund(admin, {
            studio_id: payment.studio_id,
            payment_id: payment.id,
            booking_id: payment.booking_id,
            amount: moneyFromPaise(refund.amount),
            currency: refund.currency ?? 'INR',
            status: 'processed',
            reason: refund.notes?.reason ?? 'Razorpay refund',
            razorpay_refund_id: refund.id,
            initiated_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
          })
        }
        break
      }
      default:
        break
    }
    await paymentRepo.updateWebhookLog(admin, logId, {
      processing_status: 'processed',
      processed_at: new Date().toISOString(),
    })
    return 'ok'
  },
}
