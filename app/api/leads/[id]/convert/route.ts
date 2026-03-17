import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { convertLeadSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';

/**
 * @swagger
 * /api/leads/{id}/convert:
 *   post:
 *     summary: Convert lead to booking
 *     description: |
 *       Transforms a signed lead into an official Booking and generates an Advance Invoice.
 *       Lead must be in 'contract_signed' status.
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
 *           schema: { $ref: '#/components/schemas/LeadConvert' }
 *     responses:
 *       200:
 *         description: Lead converted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking_id: { type: string, format: uuid }
 *                 advance_invoice_id: { type: string, format: uuid }
 *       422:
 *         description: Lead not in contract_signed stage
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = convertLeadSchema.parse(body);

    // 1. Validate Lead State
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('*, client:clients(*)')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (leadErr || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    if (lead.status !== 'contract_signed') {
        return NextResponse.json({ error: 'Lead must be in contract_signed stage to convert' }, { status: 422 });
    }

    // 2. Create Booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        studio_id: member.studio_id,
        client_id: lead.client_id,
        package_id: validated.package_id,
        event_type: lead.event_type || 'other',
        event_date: validated.event_date,
        venue_name: validated.venue_name,
        venue_address: validated.venue_address,
        venue_city: validated.venue_city,
        venue_state: validated.venue_state,
        total_amount: validated.total_amount,
        advance_amount: validated.advance_amount,
        balance_amount: validated.total_amount - validated.advance_amount,
        status: 'contract_signed',
        notes: validated.notes
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    // 3. Update Lead
    await supabase.from('leads').update({
        booking_id: booking.id,
        converted_to_booking: true,
        status: 'advance_paid' // Next logical stage
    }).eq('id', lead.id);

    // 4. Create Draft Advance Invoice
    const { data: invoice, error: invErr } = await supabase.from('invoices').insert({
        studio_id: member.studio_id,
        booking_id: booking.id,
        client_id: lead.client_id,
        invoice_type: 'advance',
        status: 'draft',
        total_amount: validated.advance_amount,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        access_token: generateSecureToken()
    }).select().single();

    if (invErr) throw invErr;

    // 5. Activity log
    await supabase.from('booking_activity_feed').insert({
        booking_id: booking.id,
        studio_id: member.studio_id,
        activity_type: 'lead_converted',
        metadata: { lead_id: lead.id, invoice_id: invoice.id }
    });

    return NextResponse.json({ 
        booking_id: booking.id, 
        advance_invoice_id: invoice.id 
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Lead conversion failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
