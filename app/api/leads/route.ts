import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createLeadSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: List and search leads
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *       - in: query
 *         name: assigned_to
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by client name or phone
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Lead' } }
 *                 count: { type: integer }
 *                 page: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('leads')
      .select(`
        *,
        client:clients(full_name, phone, email),
        assigned_member:studio_members(id, user_id)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    
    if (search) {
      query = query.or(`client.full_name.ilike.%${search}%,client.phone.ilike.%${search}%`);
    }

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
    await logError({ message: 'List leads failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Manual lead creation
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LeadCreate' }
 *     responses:
 *       201:
 *         description: Lead created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lead' }
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createLeadSchema.parse(body);

    // 1. Client Dedup (phone)
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('studio_id', member.studio_id)
      .eq('phone', validated.phone)
      .single();

    if (!client) {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          studio_id: member.studio_id,
          full_name: validated.full_name,
          email: validated.email,
          phone: validated.phone,
        })
        .select()
        .single();
      if (clientErr) throw clientErr;
      client = newClient;
    }

    // 2. Create Lead
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({
        studio_id: member.studio_id,
        client_id: client!.id,
        source: validated.source || 'phone',
        event_type: validated.event_type,
        event_date_approx: validated.event_date,
        venue: validated.venue,
        budget_min: validated.budget_min,
        budget_max: validated.budget_max,
        notes: validated.notes,
        status: 'new_lead'
      })
      .select()
      .single();

    if (leadErr) throw leadErr;

    return NextResponse.json({ data: lead });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Manual lead creation failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
