import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/settings/sessions:
 *   get:
 *     summary: List active portal sessions
 *     description: Returns all active client portal sessions for the studio.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of portal sessions
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: sessions, error } = await supabase
      .from('client_portal_sessions')
      .select(`
        id,
        client:client_id (full_name, email),
        booking:booking_id (event_name, event_date),
        created_at,
        token_expires_at,
        session_expires_at,
        is_used,
        is_revoked,
        used_at
      `)
      .eq('studio_id', member.studio_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('[SETTINGS_SESSIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/settings/sessions/{id}/revoke:
 *   post:
 *     summary: Revoke portal session
 *     description: Immediately invalidates a client portal session. Owner only.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Session revoked
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { member, supabase } = await requireOwner(req);

    const { error } = await supabase
      .from('client_portal_sessions')
      .update({ is_revoked: true })
      .eq('id', params.id)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ revoked: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_SESSIONS_REVOKE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
