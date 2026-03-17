import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { unavailabilitySchema } from '@/lib/validations/team';
import { logError } from '@/lib/logger';

/**
 * GET /api/team/[memberId]/availability
 */
/**
 * @swagger
 * /api/team/{memberId}/availability:
 *   get:
 *     summary: Get member availability calendar
 *     description: |
 *       Retrieves marked unavailability dates and existing booked shoot assignments. 
 *       Used to prevent double booking.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Availability data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unavailable_dates: { type: array, items: { $ref: '#/components/schemas/MemberUnavailability' } }
 *                 booked_dates: { type: array, items: { $ref: '#/components/schemas/ShootAssignment' } }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from_date') || new Date().toISOString();
    const to = searchParams.get('to_date') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const [unavailRes, assignRes] = await Promise.all([
        supabase.from('member_unavailability').select('*').eq('member_id', params.memberId).gte('unavailable_date', from).lte('unavailable_date', to),
        supabase.from('shoot_assignments').select('call_time, booking:bookings(title)').eq('member_id', params.memberId).gte('call_time', from).lte('call_time', to)
    ]);

    return NextResponse.json({
        unavailable_dates: unavailRes.data || [],
        booked_dates: assignRes.data || []
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/team/{memberId}/availability:
 *   post:
 *     summary: Mark date as unavailable
 *     description: Blocks a date for the member (leave/personal). Pre-assignment conflicts are checked.
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
 *           schema: { $ref: '#/components/schemas/UnavailabilityCreate' }
 *     responses:
 *       201:
 *         description: Unavailability marked
 *       422:
 *         description: Conflict with existing shoot assignment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = unavailabilitySchema.parse(body);

    // Permission: Member marks own, owner marks any
    if (member.id !== params.memberId && member.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Check Conflicts
    const { data: conflict } = await supabase
        .from('shoot_assignments')
        .select('id, call_time, booking:bookings(title)')
        .eq('member_id', params.memberId)
        .ilike('call_time', `${validated.unavailable_date}%`)
        .maybeSingle();

    if (conflict) {
        return NextResponse.json({ 
            error: 'Conflict with existing assignment', 
            assignment: conflict 
        }, { status: 422 });
    }

    // 2. Insert
    const { data, error } = await supabase
      .from('member_unavailability')
      .insert({
        studio_id: member.studio_id,
        member_id: params.memberId,
        ...validated
      })
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
 * /api/team/{memberId}/availability/{id}:
 *   delete:
 *     summary: Remove unavailability
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Unavailability removed
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { memberId: string, id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    
    // Permission: Member marks own, owner marks any
    if (member.id !== params.memberId && member.role !== 'owner') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('member_unavailability')
      .delete()
      .eq('id', params.id)
      .eq('member_id', params.memberId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
