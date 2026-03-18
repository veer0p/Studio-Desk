import Razorpay from 'razorpay'
import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

export function paiseToRupees(paise: number): number {
  return paise / 100
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

interface CreatePaymentLinkParams {
  amount_rupees: number
  currency: string
  description: string
  customer: {
    name: string
    email?: string
    contact?: string
  }
  expire_by?: number
  notify: {
    email: boolean
    sms: boolean
  }
}

export async function createPaymentLink(params: CreatePaymentLinkParams) {
  try {
    const response = await razorpay.paymentLink.create({
      amount: rupeesToPaise(params.amount_rupees),
      currency: params.currency,
      accept_partial: false,
      description: params.description,
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        contact: params.customer.contact,
      },
      notify: {
        sms: params.notify.sms,
        email: params.notify.email,
      },
      reminder_enable: true,
      expire_by: params.expire_by,
    })

    return {
      id: response.id,
      short_url: response.short_url,
      payment_link_id: response.id,
    }
  } catch (error) {
    console.error('Razorpay Payment Link Error:', error)
    throw Errors.external('Razorpay')
  }
}
