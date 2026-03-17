import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * requirePortalSession
 * 
 * Middleware helper for client portal routes.
 * Reads session_token from Authorization header or cookie.
 * Validates against client_portal_sessions.
 */
export async function requirePortalSession(req: NextRequest) {
  const supabase = createClient();
  
  // Get token from Authorization header or cookie
  const authHeader = req.headers.get('Authorization');
  let sessionToken = '';
  
  if (authHeader?.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  } else {
    sessionToken = req.cookies.get('portal_session')?.value || '';
  }

  if (!sessionToken) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Portal session required', code: 'UNAUTHORIZED', requires_magic_link: true }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const now = new Date().toISOString();

  const { data: session, error } = await supabase
    .from('client_portal_sessions')
    .select('client_id, booking_id, studio_id, session_expires_at, is_revoked')
    .eq('session_token', sessionToken)
    .single();

  if (error || !session) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Invalid portal session', code: 'INVALID_SESSION', requires_magic_link: true }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (session.is_revoked) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Session revoked', code: 'SESSION_REVOKED', requires_magic_link: true }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (session.session_expires_at && session.session_expires_at < now) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Session expired', code: 'SESSION_EXPIRED', requires_magic_link: true }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Optional: check booking_id mismatch if requested in URL (redundant but safe)
  // For now we trust the session token as it is scoped to a specific booking/client.

  return {
    clientId: session.client_id,
    studioId: session.studio_id,
    bookingId: session.booking_id,
    session,
    supabase
  };
}
