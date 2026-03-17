import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createContractSchema } from '@/lib/validations/leads';
import { renderTemplate } from '@/lib/contracts/template-renderer';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';
import { formatINR, formatIndianDate } from '@/lib/formatters';

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: List and search contracts
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: booking_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, sent, signed, cancelled] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of contracts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Contract' } }
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
      .from('contracts')
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
 * /api/contracts:
 *   post:
 *     summary: Create or generate contract
 *     description: |
 *       Creates a contract. If template_id is provided, automatically renders variables.
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ContractCreate' }
 *     responses:
 *       201:
 *         description: Contract created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contract' }
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createContractSchema.parse(body);

    // 1. Fetch Booking and Studio
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select(`
        *,
        studio:studios(*),
        client:clients(*),
        package:service_packages(*)
      `)
      .eq('id', validated.booking_id)
      .eq('studio_id', member.studio_id)
      .single();

    if (bErr || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    let finalHtml = validated.custom_content_html || '';

    // 2. Fetch and Render Template if ID provided
    if (validated.template_id) {
        const { data: template } = await supabase
            .from('contract_templates')
            .select('*')
            .eq('id', validated.template_id)
            .single();
        
        if (template) {
            finalHtml = renderTemplate(template.content_html, {
                client_name: booking.client.full_name,
                client_email: booking.client.email || '',
                client_phone: booking.client.phone,
                studio_name: booking.studio.name,
                studio_address: `${booking.studio.business_address}, ${booking.studio.city}, ${booking.studio.state}`,
                studio_gstin: booking.studio.gstin || '',
                event_type: booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1),
                event_date: formatIndianDate(booking.event_date),
                venue: `${booking.venue_name}, ${booking.venue_city}`,
                total_amount: formatINR(booking.total_amount),
                advance_amount: formatINR(booking.advance_amount),
                balance_amount: formatINR(booking.balance_amount),
                deliverables: booking.package?.deliverables?.join('\n') || '',
                turnaround_days: `${booking.package?.turnaround_days || 0} working days`,
                payment_schedule: `${(booking.advance_amount / booking.total_amount * 100).toFixed(0)}% Advance (${formatINR(booking.advance_amount)})`,
                today_date: formatIndianDate(new Date())
            });
        }
    }

    // 3. Create Contract
    const { data: contract, error: cErr } = await supabase
      .from('contracts')
      .insert({
        studio_id: member.studio_id,
        booking_id: booking.id,
        client_id: booking.client_id,
        template_id: validated.template_id,
        content_html: finalHtml,
        status: 'draft',
        access_token: generateSecureToken()
      })
      .select()
      .single();

    if (cErr) throw cErr;

    return NextResponse.json({ data: contract });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Create contract failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
