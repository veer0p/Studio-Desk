import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { updateAssignmentSchema } from '@/lib/validations/team';
import { sendTemplate } from '@/lib/whatsapp/client';
import { logError } from '@/lib/logger';

/**
 * GET /api/assignments/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('shoot_assignments')
      .select(`
        *,
        booking:bookings(*, client:clients(*)),
        member:studio_members(*),
        brief:shoot_briefs(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/assignments/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();
    const validated = updateAssignmentSchema.parse(body);

    const { data: assignment, error: fErr } = await supabase
        .from('shoot_assignments')
        .select('*, member:studio_members(phone)')
        .eq('id', params.id)
        .single();
    
    if (fErr || !assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('shoot_assignments')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Resend notification if time changed
    if (validated.call_time && validated.call_time !== assignment.call_time) {
        await sendTemplate({
            to: (assignment.member as any).phone,
            templateName: 'assignment_updated',
            variables: [assignment.booking_id, validated.call_time],
            studioId: member.studio_id
        });
        await supabase.from('shoot_assignments').update({ notified_at: new Date().toISOString() }).eq('id', params.id);
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/assignments/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: assignment } = await supabase
        .from('shoot_assignments')
        .select('*, member:studio_members(phone)')
        .eq('id', params.id)
        .single();
    
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Lock deletion within 24h to owners
    const diffMs = new Date(assignment.call_time).getTime() - Date.now();
    if (diffMs < 24 * 60 * 60 * 1000 && member.role !== 'owner') {
        return NextResponse.json({ error: 'Only owners can cancel assignments within 24 hours of the shoot' }, { status: 403 });
    }

    await supabase.from('shoot_assignments').delete().eq('id', params.id);

    // Notify member
    await sendTemplate({
        to: (assignment.member as any).phone,
        templateName: 'assignment_cancelled',
        variables: [assignment.booking_id],
        studioId: member.studio_id
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
