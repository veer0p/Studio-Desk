import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { initiateRefundSchema } from '@/lib/validations/invoice';
import { razorpay, rupeesToPaise } from '@/lib/razorpay/client';
import { logError } from '@/lib/logger';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Initiate a Razorpay refund
 *     description: |
 *       Initiates a refund for a Razorpay payment.
 *       Amounts in INR. Conversion to paise handled internally.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, reason]
 *             properties:
 *               amount: { type: number, example: 5000 }
 *               reason: { type: string, example: 'Duplicate payment' }
 *     responses:
 *       200:
 *         description: Refund initiated
 *       422:
 *         description: Refund amount exceeds payment amount
 *       500:
 *         $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();
    const validated = initiateRefundSchema.parse(body);

    // 1. Fetch payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (!payment || !payment.razorpay_payment_id) {
      return NextResponse.json({ error: 'Razorpay payment not found' }, { status: 404 });
    }

    if (validated.amount > payment.amount) {
      return NextResponse.json({ error: 'Refund amount exceeds payment amount' }, { status: 422 });
    }

    // 2. Call Razorpay Refund API
    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: rupeesToPaise(validated.amount),
      notes: { reason: validated.reason, payment_id: payment.id }
    });

    // 3. Insert refund record
    const { data: refundRecord, error: refErr } = await supabase
      .from('refunds')
      .insert({
        studio_id: member.studio_id,
        payment_id: payment.id,
        booking_id: payment.booking_id,
        razorpay_refund_id: refund.id,
        amount: validated.amount,
        status: 'initiated',
        reason: validated.reason
      })
      .select()
      .single();

    if (refErr) throw refErr;

    // 4. Log gateway event
    const adminSupabase = createAdminClient();
    await adminSupabase.from('payment_gateway_logs').insert({
        studio_id: member.studio_id,
        operation: 'create_refund',
        request_payload: validated,
        response_payload: refund
    });

    return NextResponse.json({ data: refundRecord });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Initiate refund failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
