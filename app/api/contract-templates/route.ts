import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * GET /api/contract-templates
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('studio_id', member.studio_id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/contract-templates
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    if (body.is_default) {
        // Unset existing default for same event type
        await supabase
            .from('contract_templates')
            .update({ is_default: false })
            .eq('studio_id', member.studio_id)
            .eq('event_type', body.event_type || 'other');
    }

    const { data, error } = await supabase
      .from('contract_templates')
      .insert({
        studio_id: member.studio_id,
        ...body
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Create template failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
