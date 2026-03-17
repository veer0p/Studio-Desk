import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { updateMemberSchema } from '@/lib/validations/team';
import { logError } from '@/lib/logger';

/**
 * GET /api/team/[memberId]
 */
/**
 * @swagger
 * /api/team/{memberId}:
 *   get:
 *     summary: Get team member details
 *     description: Retrieves profile, role, and upcoming shoot assignments for a specific member.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Member details and assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/TeamMember' }
 *                 assignments: { type: array, items: { $ref: '#/components/schemas/ShootAssignment' } }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('studio_members')
      .select(`
        *,
        auth:auth_user_id(email, last_sign_in_at)
      `)
      .eq('id', params.memberId)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    // Fetch assignments separately
    const { data: assignments } = await supabase
        .from('shoot_assignments')
        .select('*, booking:bookings(title, event_date)')
        .eq('member_id', params.memberId)
        .gte('call_time', new Date().toISOString())
        .order('call_time', { ascending: true })
        .limit(10);

    return NextResponse.json({ data, assignments });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/team/{memberId}:
 *   patch:
 *     summary: Update team member
 *     description: Update role, status, or details. Deactivation blocked if future assignments exist.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TeamUpdate' }
 *     responses:
 *       200:
 *         description: Member updated
 *       422:
 *         description: Cannot deactivate with upcoming assignments
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();
    const validated = updateMemberSchema.parse(body);

    const { data: target } = await supabase.from('studio_members').select('role').eq('id', params.memberId).single();
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 1. Prevent removing last owner
    if (target.role === 'owner' && validated.role && validated.role !== 'owner') {
        const { count } = await supabase.from('studio_members').select('*', { count: 'exact', head: true }).eq('studio_id', member.studio_id).eq('role', 'owner');
        if (count && count <= 1) return NextResponse.json({ error: 'Cannot demote the only owner' }, { status: 422 });
    }

    // 2. Check assignments before deactivating
    if (validated.is_active === false) {
        const { count } = await supabase.from('shoot_assignments').select('*', { count: 'exact', head: true }).eq('member_id', params.memberId).gte('call_time', new Date().toISOString());
        if (count && count > 0) {
            return NextResponse.json({ 
                error: 'Cannot deactivate member with upcoming assignments', 
                upcoming_assignments: count 
            }, { status: 422 });
        }
    }

    const { data, error } = await supabase
      .from('studio_members')
      .update(validated)
      .eq('id', params.memberId)
      .eq('studio_id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/team/{memberId}:
 *   delete:
 *     summary: Soft-delete team member
 *     description: Marks member as inactive and set deleted_at. Blocked if future assignments exist.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Member soft-deleted
 *       422:
 *         description: Member has future assignments
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);

    // Hard block if future assignments exist
    const { count } = await supabase.from('shoot_assignments').select('*', { count: 'exact', head: true }).eq('member_id', params.memberId).gte('call_time', new Date().toISOString());
    if (count && count > 0) {
        return NextResponse.json({ 
            error: 'Member has future assignments. Reassign them first.', 
            upcoming_assignments: count 
        }, { status: 422 });
    }

    const { error } = await supabase
      .from('studio_members')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', params.memberId)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
