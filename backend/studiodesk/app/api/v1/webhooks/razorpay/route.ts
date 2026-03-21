import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { PaymentService } from '@/lib/services/payment.service'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  let rawBody = ''
  try {
    rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    const payload = JSON.parse(rawBody)
    const status = await PaymentService.processRazorpayWebhook(rawBody, signature, payload)
    return Response.ok({ status })
  } catch (err) {
    if (!rawBody) return Response.error('Invalid webhook payload', 'VALIDATION_ERROR', 400)
    await logError({ message: String(err), severity: 'critical', requestUrl: req.url })
    return Response.ok({ status: 'error' })
  }
}
