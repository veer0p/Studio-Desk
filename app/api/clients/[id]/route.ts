import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { updateClientSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Get client details and stats
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
 *         description: Client details with booking and lead stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Client'
 *                     - type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total_spend: { type: number }
 *                             booking_count: { type: integer }
 *                             lead_count: { type: integer }
 *                             last_booking_date: { type: string, format: date }
 *       404:
 *         description: Client not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        bookings:bookings(id, title, event_date, status, total_amount),
        leads:leads(id, status, created_at)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Aggregate stats
    const totalSpend = client.bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
    const lastBooking = client.bookings.length > 0 
    ? client.bookings.sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())[0].event_date 
    : null;

    return NextResponse.json({ 
      data: {
        ...client,
        stats: {
          total_spend: totalSpend,
          booking_count: client.bookings.length,
          lead_count: client.leads.length,
          last_booking_date: lastBooking
        }
      } 
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Update client details
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
 *           schema: { $ref: '#/components/schemas/Client' }
 *     responses:
 *       200:
 *         description: Client updated
 *       409:
 *         description: Phone number already in use by another client
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = updateClientSchema.parse(body);

    // If phone changed, re-verify uniqueness
    if (validated.phone) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('studio_id', member.studio_id)
        .eq('phone', validated.phone)
        .neq('id', params.id)
        .is('deleted_at', null)
        .single();
      
      if (existing) return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('clients')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Update client failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Soft-delete client
 *     description: Marks client as deleted. Clients with active bookings cannot be deleted.
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
 *         description: Client deleted
 *       422:
 *         description: Cannot delete client with active bookings
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // Check for active bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', params.id)
      .not('status', 'in', '("closed", "lost")');

    if (bookings && bookings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete client with active bookings', 
        active_booking_count: bookings.length 
      }, { status: 422 });
    }

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
