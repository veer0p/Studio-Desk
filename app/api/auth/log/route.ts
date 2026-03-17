import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { event, metadata } = await req.json();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('security_events_log').insert({
      user_id: user?.id,
      event_type: event,
      metadata: metadata,
      ip_address: req.headers.get('x-forwarded-for') || '0.0.0.0',
      user_agent: req.headers.get('user-agent')
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTH_LOG_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
