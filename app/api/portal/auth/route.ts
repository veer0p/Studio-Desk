import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { sendMagicLinkSchema } from '@/lib/validations/portal';
import { generateSecureToken } from '@/lib/crypto';
import { resend } from '@/lib/resend/client';
import { env } from '@/lib/env';

/**
 * @swagger
 * /api/portal/auth:
 *   post:
 *     summary: Send magic link to client
 *     description: Triggers a magic link email to the client for portal access. Requires studio authentication.
 *     tags: [Client Portal]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_id]
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               booking_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Magic link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sent: { type: 'boolean' }
 *                 expires_at: { type: 'string', format: 'date-time' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         description: Client has no email or validation failed
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);

    const body = await req.json();
    const validated = sendMagicLinkSchema.parse(body);

    // 1. Fetch client and studio details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('full_name, email')
      .eq('id', validated.client_id)
      .eq('studio_id', member.studio_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client has no email address' }, { status: 422 });
    }

    const { data: studio } = await supabase
      .from('studios')
      .select('name')
      .eq('id', member.studio_id)
      .single();

    // 2. Generate magic token
    const magicToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 hours

    // 3. Insert into client_portal_sessions
    const { error: sessionError } = await supabase
      .from('client_portal_sessions')
      .insert({
        studio_id: member.studio_id,
        client_id: validated.client_id,
        booking_id: validated.booking_id,
        magic_token: magicToken,
        token_expires_at: expiresAt,
        is_used: false
      });

    if (sessionError) throw sessionError;

    // 4. Send email
    const portalUrl = `${env.NEXT_PUBLIC_APP_URL}/portal?token=${magicToken}`;
    
    await resend.emails.send({
      from: 'StudioDesk <no-reply@studiodesk.in>',
      to: client.email,
      subject: `Access your photos and documents — ${studio?.name || 'Your Studio'}`,
      html: `
        <h1>Welcome to your Client Portal</h1>
        <p>Hello ${client.full_name},</p>
        <p>You can access your photos, contracts, and invoices using the link below:</p>
        <p><a href="${portalUrl}">${portalUrl}</a></p>
        <p>This link will expire in 72 hours.</p>
        <p>Regards,<br/>${studio?.name || 'StudioDesk Team'}</p>
      `
    });

    return NextResponse.json({ sent: true, expires_at: expiresAt });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PORTAL_AUTH_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
