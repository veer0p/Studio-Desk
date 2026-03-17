import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { freelancerPaymentSchema } from '@/lib/validations/team';

/**
 * GET /api/assignments/[id]/payment
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase } = await requireOwner(req);
    const { data, error } = await supabase
      .from('freelancer_payments')
      .select('*')
      .eq('assignment_id', params.id)
      .maybeSingle();

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/assignments/[id]/payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();
    const validated = freelancerPaymentSchema.parse(body);

    const { data: assignment } = await supabase
        .from('shoot_assignments')
        .select('member_id, day_rate')
        .eq('id', params.id)
        .single();
    
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('freelancer_payments')
      .insert({
        studio_id: member.studio_id,
        assignment_id: params.id,
        member_id: assignment.member_id,
        status: 'paid',
        paid_at: validated.paid_at || new Date().toISOString(),
        ...validated
      })
      .select()
      .single();

    if (error) throw error;

    // Update assignment status
    await supabase.from('shoot_assignments').update({ payment_status: 'paid' }).eq('id', params.id);

    return NextResponse.json({ payment_id: data.id, status: 'paid' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
