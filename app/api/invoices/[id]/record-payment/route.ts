import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { recordPaymentSchema } from '@/lib/validations/invoice';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';
import { formatINR } from '@/lib/formatters';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/invoices/{id}/record-payment:
 *   post:
 *     summary: Record a manual (offline) payment
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: Payment recorded
 *       422:
 *         description: Amount exceeds balance due
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = recordPaymentSchema.parse(body);

    // 1. Fetch invoice and client
    const { data: invoice, error: fetchErr } = await supabase
      .from('invoices')
      .select('*, client:clients(*), studio:studios(name)')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    
    const amountDue = invoice.total_amount - (invoice.amount_paid || 0);
    if (validated.amount > amountDue) {
      return NextResponse.json({ error: `Amount exceeds balance due (${formatINR(amountDue)})` }, { status: 422 });
    }

    // 2. Insert payment record
    const { data: payment, error: pyErr } = await supabase
      .from('payments')
      .insert({
        studio_id: member.studio_id,
        invoice_id: invoice.id,
        booking_id: invoice.booking_id,
        amount: validated.amount,
        method: validated.method,
        reference_number: validated.reference_number,
        payment_date: validated.payment_date,
        status: 'captured',
        notes: validated.notes
      })
      .select()
      .single();

    if (pyErr) throw pyErr;

    // 3. Dispatch receipt communications
    const commsPromise = Promise.allSettled([
      sendEmail({
        to: invoice.client.email,
        subject: `Payment Received - ${invoice.studio.name}`,
        html: `<p>Dear ${invoice.client.name}, we have received your payment of ${formatINR(validated.amount)} for Invoice #${invoice.invoice_number}.</p>`,
        studioId: member.studio_id
      }),
      sendTemplate({
        to: invoice.client.phone,
        templateName: 'payment_received',
        variables: [
            invoice.client.name,
            formatINR(validated.amount),
            invoice.invoice_number
        ],
        studioId: member.studio_id
      })
    ]);

    await commsPromise;

    // 4. Activity feed
    await supabase.from('booking_activity_feed').insert({
      booking_id: invoice.booking_id,
      studio_id: member.studio_id,
      activity_type: `${invoice.invoice_type}_payment_received`,
      metadata: { payment_id: payment.id, amount: validated.amount }
    });

    return NextResponse.json({ data: payment });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Record manual payment failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
