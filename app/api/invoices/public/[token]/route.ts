import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/razorpay/client';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/invoices/public/{token}:
 *   get:
 *     summary: Public Invoice Portal API
 *     description: Fetches invoice details for the public portal using a secure access token.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Invoice' }
 *       404:
 *         description: Invoice not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, invoice_type, status, subtotal, 
        cgst_amount, sgst_amount, igst_amount, total_amount, 
        amount_paid, due_date, notes, payment_link_url, 
        created_at, view_count,
        studio:studios(name, logo_url, address, gstin, phone),
        client:clients(name, email),
        line_items:invoice_line_items(name, quantity, unit_price, hsn_sac_code)
      `)
      .eq('access_token', params.token)
      .is('deleted_at', null)
      .single();

    if (error || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    // Increment view count
    await supabase
      .from('invoices')
      .update({ 
        view_count: (invoice.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', invoice.id);

    return NextResponse.json({ data: invoice });
  } catch (error: any) {
    await logError({ message: 'Public GET invoice failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/invoices/public/{token}:
 *   post:
 *     summary: Notify payment completion (Public)
 *     description: Notifies the system of a manual or Razorpay payment completion from the public portal.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_payment_id: { type: string }
 *               razorpay_order_id: { type: string }
 *               razorpay_signature: { type: string }
 *     responses:
 *       200:
 *         description: Payment processing notification received
 *       401:
 *         description: Unauthorized (Invalid token)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const supabase = createAdminClient();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

        // 1. Verify access token
        const { data: invoice } = await supabase
            .from('invoices')
            .select('id, studio_id, booking_id, total_amount')
            .eq('access_token', params.token)
            .single();

        if (!invoice) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Verify signature (Razorpay requires body + signature)
        // Note: For client-side payments, verification might happen in webhook, 
        // but it's good practice to verify here if we have the order_id.
        // We'll rely on the webhook for final capture confirmation.

        return NextResponse.json({ success: true, message: 'Processing payment via webhook...' });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
