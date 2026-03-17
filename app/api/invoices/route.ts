import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createInvoiceSchema } from '@/lib/validations/invoice';
import { detectGstType, calculateInvoiceTotals } from '@/lib/gst/calculator';
import { createInvoicePaymentLink } from '@/lib/razorpay/payment-link';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List invoices for current studio
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by invoice status (draft, sent, paid, overdue)
 *       - in: query
 *         name: booking_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by booking ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [advance, balance, full]
 *         description: Filter by invoice type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 count:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         $ref: '#/components/schemas/ApiError'
 *       500:
 *         $ref: '#/components/schemas/ApiError'
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status');
    const bookingId = searchParams.get('booking_id');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, email),
        booking:bookings(title, event_date)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (bookingId) query = query.eq('booking_id', bookingId);
    if (type) query = query.eq('invoice_type', type);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      count: count || 0,
      page,
      pageSize: limit,
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'List invoices failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create new invoice
 *     description: |
 *       Creates a GST-compliant invoice. 
 *       Intra-state: CGST 9% + SGST 9%. Inter-state: IGST 18%.
 *       Amounts in INR (rupees). Razorpay conversion to paise handled internally.
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProposalCreate'
 *     responses:
 *       201:
 *         description: Invoice created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Booking not found
 *       500:
 *         $ref: '#/components/schemas/ApiError'
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createInvoiceSchema.parse(body);

    // 1. Fetch booking and client details
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*, client:clients(*)')
      .eq('id', validated.booking_id)
      .eq('studio_id', member.studio_id)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Determine GST policy
    const { data: studio } = await supabase
      .from('studios')
      .select('state_code')
      .eq('id', member.studio_id)
      .single();

    const gstType = detectGstType(studio?.state_code || '', booking.client.state_code || '');
    const totals = calculateInvoiceTotals(validated.line_items, gstType);

    // 3. Create invoice record
    const { data: invoice, error: invoiceErr } = await supabase
      .from('invoices')
      .insert({
        studio_id: member.studio_id,
        booking_id: validated.booking_id,
        client_id: booking.client_id,
        invoice_type: validated.invoice_type,
        status: 'draft',
        due_date: validated.due_date,
        notes: validated.notes,
        gst_type: gstType,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst,
        sgst_amount: totals.sgst,
        igst_amount: totals.igst,
        total_amount: totals.grandTotal,
        access_token: generateSecureToken(),
      })
      .select()
      .single();

    if (invoiceErr || !invoice) throw invoiceErr;

    // 4. Insert line items
    const { error: itemsErr } = await supabase
      .from('invoice_line_items')
      .insert(validated.line_items.map(item => ({
        invoice_id: invoice.id,
        name: item.name,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        gst_rate: item.gst_rate || 18
      })));

    if (itemsErr) throw itemsErr;

    // 5. Generate Razorpay Payment Link
    try {
      const paymentLink = await createInvoicePaymentLink({
        amount_rupees: totals.grandTotal,
        invoice_number: invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`,
        due_date: validated.due_date,
        customer: {
          name: booking.client.name,
          email: booking.client.email || '',
          contact: booking.client.phone || '',
        }
      });

      // Update invoice with Razorpay link
      await supabase
        .from('invoices')
        .update({
          razorpay_payment_link_id: paymentLink.id,
          payment_link_url: paymentLink.short_url,
        })
        .eq('id', invoice.id);

      // Log gateway event
      const adminSupabase = createAdminClient();
      await adminSupabase.from('payment_gateway_logs').insert({
        studio_id: member.studio_id,
        invoice_id: invoice.id,
        operation: 'create_payment_link',
        response_payload: paymentLink,
      });

    } catch (pzError: any) {
      await logError({ 
        message: 'Razorpay link generation failed during invoice creation', 
        stack: pzError.stack,
        studioId: member.studio_id
      });
      // Continue without stopping - link can be regenerated later
    }

    // 6. Log booking activity
    await supabase.from('booking_activity_feed').insert({
      booking_id: validated.booking_id,
      studio_id: member.studio_id,
      activity_type: `${validated.invoice_type}_invoice_created`,
      metadata: { invoice_id: invoice.id, amount: totals.grandTotal }
    });

    return NextResponse.json({ data: invoice });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Create invoice failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
