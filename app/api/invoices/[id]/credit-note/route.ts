import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';

/**
 * @swagger
 * /api/invoices/{id}/credit-note:
 *   post:
 *     summary: Create a credit note for an invoice
 *     description: Creates a credit note (reversal) for an existing invoice for accounting purposes.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, example: 'Booking cancelled by client' }
 *               amount: { type: number, description: 'Optional partial reversal amount' }
 *     responses:
 *       200:
 *         description: Credit note created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Invoice' }
 *       404:
 *         description: Original invoice not found
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const { reason, amount } = await req.json();

    // 1. Fetch original invoice
    const { data: original, error: fetchErr } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !original) return NextResponse.json({ error: 'Original invoice not found' }, { status: 404 });

    const refundAmount = amount || original.total_amount;

    // 2. Create the Credit Note record
    // Type credit_note effectively reverses a charge in accounting
    const { data: creditNote, error: cnErr } = await supabase
      .from('invoices')
      .insert({
        studio_id: member.studio_id,
        booking_id: original.booking_id,
        client_id: original.client_id,
        invoice_type: 'credit_note',
        credit_note_for: original.id,
        status: 'sent', // credit notes are sent immediately
        subtotal: -original.subtotal, // Negative for accounting
        cgst_amount: -original.cgst_amount,
        sgst_amount: -original.sgst_amount,
        igst_amount: -original.igst_amount,
        total_amount: -refundAmount,
        notes: `Credit Note for Invoice #${original.invoice_number}. Reason: ${reason || 'N/A'}`,
        access_token: generateSecureToken(),
      })
      .select()
      .single();

    if (cnErr) throw cnErr;

    // 3. Activity feed
    await supabase.from('booking_activity_feed').insert({
      booking_id: original.booking_id,
      studio_id: member.studio_id,
      activity_type: 'credit_note_created',
      metadata: { credit_note_id: creditNote.id, amount: refundAmount }
    });

    return NextResponse.json({ data: creditNote });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Create credit note failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
