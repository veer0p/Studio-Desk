import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError, logSecurityEvent } from '@/lib/logger';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';
import { formatINR } from '@/lib/formatters';

/**
 * @swagger
 * /api/webhooks/razorpay:
 *   post:
 *     summary: Razorpay Webhook Handler
 *     description: |
 *       Handles inbound Razorpay events: payment.captured, payment.failed, refund.processed, dispute.created.
 *       No security header required (Signature verified via x-razorpay-signature).
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RazorpayWebhookEvent' }
 *     responses:
 *       200:
 *         description: Event processed or already handled
 *       400:
 *         description: Invalid signature or payload
 */
export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const signature = req.headers.get('x-razorpay-signature');
  const rawBody = await req.text();

  try {
    // 1. Verify Signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      await logSecurityEvent({ eventType: 'invalid_webhook_signature', req });
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id;

    // 2. Check Idempotency
    const { data: existing } = await supabase
      .from('webhook_logs')
      .select('id, processing_status')
      .eq('idempotency_key', eventId)
      .single();

    if (existing) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // 3. Log initial receipt
    const { data: logEntry } = await supabase
      .from('webhook_logs')
      .insert({
        idempotency_key: eventId,
        provider: 'razorpay',
        event_type: event.event,
        payload: event,
        processing_status: 'received'
      })
      .select()
      .single();

    // 4. Process Events
    try {
      switch (event.event) {
        case 'payment.captured': {
          const payment = event.payload.payment.entity;
          const orderId = payment.order_id || payment.notes?.order_id;
          
          // Find invoice by order_id or payment_link_id
          const { data: invoice } = await supabase
            .from('invoices')
            .select('*, client:clients(*), studio:studios(*)')
            .or(`razorpay_order_id.eq.${orderId},razorpay_payment_link_id.eq.${payment.payment_link_id}`)
            .single();

          if (invoice) {
            // Insert payment record
            // DB triggers handle the rest (invoice status, booking totals, gallery lock)
            await supabase.from('payments').insert({
              studio_id: invoice.studio_id,
              invoice_id: invoice.id,
              booking_id: invoice.booking_id,
              amount: payment.amount / 100,
              method: payment.method,
              razorpay_payment_id: payment.id,
              status: 'captured',
              captured_at: new Date().toISOString()
            });

            // Send receipts
            await Promise.allSettled([
              sendEmail({
                to: invoice.client.email,
                subject: `Payment Successful - ${invoice.studio.name}`,
                html: `<p>Payment of ${formatINR(payment.amount / 100)} received for Invoice #${invoice.invoice_number}.</p>`,
                studioId: invoice.studio_id
              }),
              sendTemplate({
                to: invoice.client.phone,
                templateName: 'payment_received',
                variables: [invoice.client.name, formatINR(payment.amount / 100), invoice.invoice_number],
                studioId: invoice.studio_id
              })
            ]);
          }
          break;
        }

        case 'payment.failed': {
            const payment = event.payload.payment.entity;
            await supabase.from('payment_gateway_logs').insert({
                operation: 'payment_failed_webhook',
                response_payload: event
            });
            break;
        }

        case 'refund.processed': {
            const refund = event.payload.refund.entity;
            await supabase
                .from('refunds')
                .update({ status: 'processed' })
                .eq('razorpay_refund_id', refund.id);
            break;
        }

        case 'payment.dispute.created': {
            const dispute = event.payload.dispute.entity;
            await supabase.from('payment_disputes').insert({
                razorpay_dispute_id: dispute.id,
                amount: dispute.amount / 100,
                status: 'created',
                reason: dispute.reason
            });
            await logSecurityEvent({ eventType: 'payment_dispute_created', req, context: dispute });
            break;
        }
      }

      // Update log to processed
      await supabase
        .from('webhook_logs')
        .update({ processing_status: 'processed' })
        .eq('id', logEntry?.id);

    } catch (procErr: any) {
      await logError({ message: 'Webhook processing failed', stack: procErr.stack });
      await supabase
        .from('webhook_logs')
        .update({ processing_status: 'failed' })
        .eq('id', logEntry?.id);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (err: any) {
    await logError({ message: 'Webhook handler crash', stack: err.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
