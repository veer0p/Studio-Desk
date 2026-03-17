import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { updateProposalSchema } from '@/lib/validations/leads';
import { calculateInvoiceTotals } from '@/lib/gst/calculator';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/proposals/{id}:
 *   get:
 *     summary: Get proposal details
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Proposal details with line items
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Proposal' }
 *       404:
 *         description: Proposal not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(*),
        line_items:proposal_line_items(*),
        booking:bookings(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proposals/{id}:
 *   patch:
 *     summary: Update draft proposal
 *     tags: [Pipeline]
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
 *           schema: { $ref: '#/components/schemas/ProposalUpdate' }
 *     responses:
 *       200:
 *         description: Proposal updated
 *       422:
 *         description: Only draft proposals can be updated
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = updateProposalSchema.parse(body);

    const { data: current, error: fErr } = await supabase
      .from('proposals')
      .select('status, gst_type')
      .eq('id', params.id)
      .single();

    if (fErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (current.status !== 'draft') return NextResponse.json({ error: 'Only draft proposals can be updated' }, { status: 422 });

    let updates: any = {
        valid_until: validated.valid_until,
        notes: validated.notes
    };

    if (validated.line_items) {
        const totals = calculateInvoiceTotals(validated.line_items, current.gst_type);
        updates = {
            ...updates,
            subtotal: totals.subtotal,
            cgst_amount: totals.cgst,
            sgst_amount: totals.sgst,
            igst_amount: totals.igst,
            total_amount: totals.grandTotal
        };

        // Sync items
        await supabase.from('proposal_line_items').delete().eq('proposal_id', params.id);
        await supabase.from('proposal_line_items').insert(
            validated.line_items.map(item => ({
                proposal_id: params.id,
                ...item,
                total_price: (item.quantity * item.unit_price)
            }))
        );
    }

    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Update proposal failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proposals/{id}:
 *   delete:
 *     summary: Reject/Cancel proposal
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Proposal marked as rejected
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { error } = await supabase
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('id', params.id)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
