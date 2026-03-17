import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * POST /api/assignments/[id]/confirm
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: assignment, error: fErr } = await supabase
      .from('shoot_assignments')
      .select('*, booking:bookings(title, studio_id)')
      .eq('id', params.id)
      .eq('member_id', member.id) // Security: check member_id
      .single();

    if (fErr || !assignment) return NextResponse.json({ error: 'Assignment not found or unauthorized' }, { status: 404 });

    const { error } = await supabase
      .from('shoot_assignments')
      .update({
        is_confirmed: true,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (error) throw error;

    // Notify Owner
    const { data: owner } = await supabase.from('studio_members').select('auth_user_id').eq('studio_id', assignment.studio_id).eq('role', 'owner').single();
    
    if (owner) {
        await supabase.from('notifications').insert({
            user_id: owner.auth_user_id,
            studio_id: assignment.studio_id,
            type: 'assignment_confirmed',
            title: 'Assignment Confirmed',
            body: `${member.display_name} has confirmed for ${assignment.booking.title}.`,
            link: `/assignments/${params.id}`
        });
    }

    return NextResponse.json({ confirmed: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
