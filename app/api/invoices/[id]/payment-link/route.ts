import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createInvoicePaymentLink } from '@/lib/razorpay/payment-link';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/invoices/{id}/payment-link:
 *   post:
 *     summary: Regenerate Razorpay payment link
 *     description: |
 *       Regenerates an expired or missing Razorpay payment link for an invoice.
 *       Amounts in INR. Conversion to paise handled internally.
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: New payment link generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     url: { type: string }
 *       422:
 *         description: Invoice already paid
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: invoice, error: fetchErr } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 422 });
    }

    // 1. Create new Link
    const paymentLink = await createInvoicePaymentLink({
      amount_rupees: invoice.total_amount,
      invoice_number: invoice.invoice_number,
      due_date: invoice.due_date,
      customer: {
        name: invoice.client.name,
        email: invoice.client.email || '',
        contact: invoice.client.phone || '',
      }
    });

    // 2. Update DB
    await supabase
      .from('invoices')
      .update({
        razorpay_payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.short_url,
      })
      .eq('id', invoice.id);

    // 3. Log gateway event
    const adminSupabase = createAdminClient();
    await adminSupabase.from('payment_gateway_logs').insert({
      studio_id: member.studio_id,
      invoice_id: invoice.id,
      operation: 'regenerate_payment_link',
      response_payload: paymentLink,
    });

    return NextResponse.json({
      data: {
        id: paymentLink.id,
        url: paymentLink.short_url
      }
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ 
      message: 'Regenerate payment link failed', 
      stack: error.stack,
      studioId: params.id 
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
