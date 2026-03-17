import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';

/**
 * GET /api/assignments/[id]/brief
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    
    // Check permission: owner or assigned member
    const { data: assignment } = await supabase.from('shoot_assignments').select('*').eq('id', params.id).single();
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (member.role !== 'owner' && assignment.member_id !== member.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase
      .from('shoot_briefs')
      .select('*')
      .eq('assignment_id', params.id)
      .maybeSingle();

    return NextResponse.json({ data: data || { assignment_id: params.id } });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/assignments/[id]/brief
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    const { data: assignment } = await supabase.from('shoot_assignments').select('booking_id').eq('id', params.id).single();
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('shoot_briefs')
      .upsert({
        assignment_id: params.id,
        booking_id: assignment.booking_id,
        studio_id: member.studio_id,
        ...body
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
