import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: List service packages
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event_type
 *         schema: { type: string }
 *       - in: query
 *         name: include_inactive
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: List of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/ServicePackage' } }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const eventType = searchParams.get('event_type');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('service_packages')
      .select(`
        *,
        addons:package_addons(*)
      `)
      .eq('studio_id', member.studio_id)
      .order('name', { ascending: true });

    if (!includeInactive) query = query.eq('is_active', true);
    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Create new service package
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServicePackage' }
 *     responses:
 *       201:
 *         description: Package created
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Owner only)
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    if (!body.name || (body.base_price || 0) <= 0) {
      return NextResponse.json({ error: 'Invalid name or price' }, { status: 400 });
    }

    const { data: pkg, error } = await supabase
      .from('service_packages')
      .insert({
        studio_id: member.studio_id,
        name: body.name,
        event_type: body.event_type,
        base_price: body.base_price,
        description: body.description,
        deliverables: body.deliverables,
        turnaround_days: body.turnaround_days,
        line_items: body.line_items,
        is_gst_applicable: body.is_gst_applicable ?? true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: pkg });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Create package failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
