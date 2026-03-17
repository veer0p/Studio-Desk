import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createProposalSchema } from '@/lib/validations/leads';
import { detectGstType, calculateInvoiceTotals } from '@/lib/gst/calculator';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';

/**
 * @swagger
 * /api/proposals:
 *   get:
 *     summary: List and search proposals
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: booking_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, sent, accepted, rejected, expired] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of proposals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Proposal' } }
 *                 count: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('proposals')
      .select(`
        *,
        client:clients(full_name),
        booking:bookings(title)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .order('created_at', { ascending: false });

    if (bookingId) query = query.eq('booking_id', bookingId);
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
        data,
        count: count || 0,
        page,
        pageSize: limit
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proposals:
 *   post:
 *     summary: Create new proposal
 *     description: |
 *       Creates a new versioned proposal for a booking. 
 *       Calculates GST based on studio and client states.
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProposalCreate' }
 *     responses:
 *       201:
 *         description: Proposal created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Proposal' }
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createProposalSchema.parse(body);

    // 1. Fetch Booking and Studio Details
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*, client:clients(*), studio:studios(*)')
      .eq('id', validated.booking_id)
      .eq('studio_id', member.studio_id)
      .single();

    if (bErr || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // 2. GST Calculation
    const gstType = detectGstType(booking.studio.state, booking.client.state);
    const totals = calculateInvoiceTotals(validated.line_items, gstType);

    // 3. Versioning
    const { data: latest } = await supabase
        .from('proposals')
        .select('version')
        .eq('booking_id', booking.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();
    
    const version = (latest?.version || 0) + 1;

    // 4. Create Proposal
    const { data: proposal, error: pErr } = await supabase
      .from('proposals')
      .insert({
        studio_id: member.studio_id,
        booking_id: booking.id,
        client_id: booking.client_id,
        package_id: validated.package_id,
        version,
        status: 'draft',
        gst_type: gstType,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst,
        sgst_amount: totals.sgst,
        igst_amount: totals.igst,
        total_amount: totals.grandTotal,
        valid_until: validated.valid_until,
        notes: validated.notes,
        access_token: generateSecureToken()
      })
      .select()
      .single();

    if (pErr) throw pErr;

    // 5. Insert Line Items
    await supabase.from('proposal_line_items').insert(
        validated.line_items.map(item => ({
            proposal_id: proposal.id,
            ...item,
            total_price: (item.quantity * item.unit_price)
        }))
    );

    return NextResponse.json({ data: proposal });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Create proposal failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
