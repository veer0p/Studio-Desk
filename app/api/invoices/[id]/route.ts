import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { updateInvoiceSchema } from '@/lib/validations/invoice';
import { calculateInvoiceTotals } from '@/lib/gst/calculator';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice details
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
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        booking:bookings(*),
        line_items:invoice_line_items(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .is('deleted_at', null)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ data: invoice });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Get invoice failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   patch:
 *     summary: Update draft invoice
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
 *             $ref: '#/components/schemas/ProposalCreate'
 *     responses:
 *       200:
 *         description: Invoice updated
 *       422:
 *         description: Only draft invoices can be modified
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = updateInvoiceSchema.parse(body);

    const { data: current, error: fetchErr } = await supabase
      .from('invoices')
      .select('status, gst_type')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (current.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft invoices can be modified' }, { status: 422 });
    }

    let updates: any = {
      notes: validated.notes,
      due_date: validated.due_date,
    };

    if (validated.line_items) {
      const totals = calculateInvoiceTotals(validated.line_items, current.gst_type);
      updates = {
        ...updates,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst,
        sgst_amount: totals.sgst,
        igst_amount: totals.igst,
        total_amount: totals.grandTotal,
      };

      // Atomic update for line items: Delete and insert
      await supabase.from('invoice_line_items').delete().eq('invoice_id', params.id);
      await supabase.from('invoice_line_items').insert(
        validated.line_items.map(item => ({
          invoice_id: params.id,
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      );
    }

    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Update invoice failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Soft-delete (cancel) invoice
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
 *         description: Invoice cancelled
 *       422:
 *         description: Cannot cancel invoice with existing payments
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: invoice } = await supabase
      .from('invoices')
      .select('status, amount_paid')
      .eq('id', params.id)
      .single();

    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (invoice.amount_paid > 0 || ['paid', 'partially_paid'].includes(invoice.status)) {
      return NextResponse.json({ 
        error: 'Cannot cancel invoice with existing payments' 
      }, { status: 422 });
    }

    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'cancelled', 
        deleted_at: new Date().toISOString() 
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Delete invoice failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
