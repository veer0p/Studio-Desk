import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract details
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
 *         description: Contract details with variables
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contract' }
 *       404:
 *         description: Contract not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        client:clients(*),
        booking:bookings(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/contracts/{id}:
 *   patch:
 *     summary: Update draft contract
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
 *           schema: { $ref: '#/components/schemas/Contract' }
 *     responses:
 *       200:
 *         description: Contract updated
 *       422:
 *         description: Only draft contracts can be updated
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();

    const { data: current } = await supabase.from('contracts').select('status').eq('id', params.id).single();
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (current.status !== 'draft') return NextResponse.json({ error: 'Only draft contracts can be updated' }, { status: 422 });

    const { data, error } = await supabase
      .from('contracts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
