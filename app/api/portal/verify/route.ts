import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyMagicTokenSchema } from '@/lib/validations/portal';
import { generateSecureToken } from '@/lib/crypto';

/**
 * @swagger
 * /api/portal/verify:
 *   post:
 *     summary: Verify magic token and create session
 *     description: Exchanges a one-time magic token for a session token. No authentication required.
 *     tags: [Client Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token verified, session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session_token: { type: 'string' }
 *                 client_id: { type: 'string', format: 'uuid' }
 *                 booking_id: { type: 'string', format: 'uuid' }
 *                 studio_id: { type: 'string', format: 'uuid' }
 *       410:
 *         description: Token expired
 *       404:
 *         description: Token not found or already used
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { token } = verifyMagicTokenSchema.parse(body);

    const now = new Date().toISOString();

    // 1. Find the token
    const { data: session, error } = await supabase
      .from('client_portal_sessions')
      .select('*')
      .eq('magic_token', token)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Magic link invalid or not found' }, { status: 404 });
    }

    if (session.is_used) {
      return NextResponse.json({ error: 'Magic link already used' }, { status: 404 });
    }

    if (session.token_expires_at && session.token_expires_at < now) {
      return NextResponse.json({ error: 'Magic link expired' }, { status: 410 });
    }

    // 2. Create session token
    const sessionToken = generateSecureToken();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // 3. Mark magic token as used and set session info
    const { error: updateError } = await supabase
      .from('client_portal_sessions')
      .update({
        is_used: true,
        used_at: now,
        session_token: sessionToken,
        session_expires_at: sessionExpiresAt
      })
      .eq('id', session.id);

    if (updateError) throw updateError;

    const response = NextResponse.json({
      session_token: sessionToken,
      client_id: session.client_id,
      booking_id: session.booking_id,
      studio_id: session.studio_id
    });

    // Also set a secure cookie for the portal
    response.cookies.set('portal_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(sessionExpiresAt)
    });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PORTAL_VERIFY_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
