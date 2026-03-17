import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * GET /api/automations/templates/email
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .or(`studio_id.eq.${member.studio_id},studio_id.is.null`)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/automations/templates/email
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        studio_id: member.studio_id,
        is_default: false,
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
