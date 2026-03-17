import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: Get package details
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
 *         description: Package details with addons
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ServicePackage' }
 *       404:
 *         description: Package not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('service_packages')
      .select('*, addons:package_addons(*)')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/packages/{id}:
 *   patch:
 *     summary: Update package details
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
 *           schema: { $ref: '#/components/schemas/ServicePackage' }
 *     responses:
 *       200:
 *         description: Package updated
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from('service_packages')
      .update(body)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/packages/{id}:
 *   delete:
 *     summary: Deactivate package
 *     description: Marks package as inactive. Packages used in active proposals cannot be deactivated.
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
 *         description: Package deactivated
 *       422:
 *         description: Package in use by active proposals
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);

    // Check active proposals
    const { data: count } = await supabase
      .from('proposals')
      .select('id', { count: 'exact' })
      .eq('package_id', params.id)
      .eq('status', 'draft');

    if (count && count.length > 0) {
      return NextResponse.json({ error: 'Package is used in active proposals and cannot be deactivated' }, { status: 422 });
    }

    const { error } = await supabase
      .from('service_packages')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
