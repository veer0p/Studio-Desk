import { NextRequest, NextResponse } from 'next/server';
import { requirePortalSession } from '@/lib/portal/auth';
import { portalPayInvoiceSchema } from '@/lib/validations/portal';
import { razorpay } from '@/lib/razorpay/client';
import { decrypt } from '@/lib/crypto';
import crypto from 'crypto';

/**
 * @swagger
 * /api/portal/{sessionToken}/invoice/{invoiceId}/pay:
 *   post:
 *     summary: client pays invoice from portal
 *     description: Verifies Razorpay payment and updates invoice status. Scoped to portal session.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_payment_id, razorpay_order_id, razorpay_signature]
 *             properties:
 *               razorpay_payment_id: { type: string }
 *               razorpay_order_id: { type: string }
 *               razorpay_signature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paid: { type: boolean }
 *                 receipt_url: { type: string, format: uri }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionToken: string, invoiceId: string } }
) {
  try {
    const { bookingId, studioId, supabase } = await requirePortalSession(req);

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = portalPayInvoiceSchema.parse(body);

    // 1. Fetch Invoice and Studio Razorpay Keys
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, studio:studios(*)')
      .eq('id', params.invoiceId)
      .eq('booking_id', bookingId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found or unauthorized' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 422 });
    }

    // 2. Verify Razorpay Signature
    // We need the studio's razorpay secret
    if (!invoice.studio.razorpay_key_secret) {
      return NextResponse.json({ error: 'Studio payment integration not configured' }, { status: 422 });
    }

    const secret = decrypt(invoice.studio.razorpay_key_secret);
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 422 });
    }

    // 3. Record Payment
    const { data: payment, error: pError } = await supabase
      .from('payments')
      .insert({
        studio_id: studioId,
        invoice_id: invoice.id,
        booking_id: bookingId,
        amount: invoice.balance_amount,
        payment_method: 'razorpay',
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        status: 'captured',
        captured_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pError) throw pError;

    // 4. Update Invoice Status
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_amount: invoice.total_amount,
        balance_amount: 0,
        paid_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    // 5. Update Booking Status if advance paid
    if (invoice.invoice_type === 'advance') {
      await supabase.from('bookings').update({ status: 'advance_paid' }).eq('id', bookingId);
      await supabase.from('leads').update({ status: 'advance_paid' }).eq('booking_id', bookingId);
    }

    // 6. Activity Feed
    await supabase.from('booking_activity_feed').insert({
      booking_id: bookingId,
      studio_id: studioId,
      activity_type: 'payment_captured',
      metadata: { invoice_id: invoice.id, amount: invoice.total_amount, payment_id: payment.id }
    });

    return NextResponse.json({ paid: true, receipt_url: payment.receipt_url });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PORTAL_PAYMENT_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
