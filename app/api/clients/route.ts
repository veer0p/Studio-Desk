import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createClientSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';

/**
 * GET /api/clients
 * List and search clients.
 */
/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: List and search clients
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, phone, or email
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Client' } }
 *                 count: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('clients')
      .select(`
        *,
        booking_count:bookings(count)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .is('deleted_at', null)
      .order('full_name', { ascending: true });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    // Transform count from nested join if needed, but for count: 'exact' count is in variable
    return NextResponse.json({
        data,
        count: count || 0,
        page,
        pageSize: limit
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'List clients failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/clients
 * Manual client creation with dedup check.
 */
/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Manual client creation
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Client' }
 *     responses:
 *       201:
 *         description: Client created
 *       409:
 *         description: Phone number already registered
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createClientSchema.parse(body);

    // 1. Dedup check
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('studio_id', member.studio_id)
      .eq('phone', validated.phone)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'Phone number already registered for this studio', 
        client_id: existing.id 
      }, { status: 409 });
    }

    // 2. Create
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        studio_id: member.studio_id,
        ...validated
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: client });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Manual client creation failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
