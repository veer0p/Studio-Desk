import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { acceptInviteSchema } from '@/lib/validations/team';
import { logError } from '@/lib/logger';

/**
 * GET /api/team/invite/[token]
 * Validate invitation token
 */
/**
 * @swagger
 * /api/team/invite/{token}:
 *   get:
 *     summary: Validate invitation token
 *     description: Retrieves invitation details for the accept-invite page. Publicly accessible.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studio_name: { type: string }
 *                 studio_logo: { type: string }
 *                 role: { type: string }
 *                 invited_by_name: { type: string }
 *       404:
 *         description: Token not found
 *       410:
 *         description: Token expired
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data: invite, error } = await supabase
      .from('studio_invitations')
      .select(`
        *,
        studio:studios(name, logo_url),
        inviter:studio_members(display_name)
      `)
      .eq('token', params.token)
      .single();

    if (error || !invite) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    if (invite.accepted_at) return NextResponse.json({ error: 'Invitation already accepted' }, { status: 409 });
    if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invitation expired' }, { status: 410 });

    return NextResponse.json({
        studio_name: invite.studio.name,
        studio_logo: invite.studio.logo_url,
        role: invite.role,
        invited_by_name: invite.inviter?.display_name || 'The Owner'
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/team/invite/{token}:
 *   post:
 *     summary: Accept invitation
 *     description: |
 *       Accepts the invitation for the authenticated user and creates a studio membership. 
 *       Triggers owner notification.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TeamAccept' }
 *     responses:
 *       200:
 *         description: Membership created
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { user_id } = acceptInviteSchema.parse(body);

    if (!user_id) return NextResponse.json({ needs_signup: true }, { status: 200 });

    // 1. Fetch invite again
    const { data: invite } = await supabase
        .from('studio_invitations')
        .select('*')
        .eq('token', params.token)
        .is('accepted_at', null)
        .single();
    
    if (!invite) return NextResponse.json({ error: 'Invite not found or already accepted' }, { status: 404 });
    if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 410 });

    // 2. Create membership
    const { data: member, error: mErr } = await supabase
      .from('studio_members')
      .insert({
        studio_id: invite.studio_id,
        auth_user_id: user_id,
        email_at_invite: invite.email,
        role: invite.role,
        is_active: true,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (mErr) throw mErr;

    // 3. Close invite
    await supabase.from('studio_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);

    // 4. Notifications
    await supabase.from('notifications').insert({
        user_id: invite.invited_by_user_id, // Owner/Inviter
        studio_id: invite.studio_id,
        type: 'team_member_joined',
        title: 'New Member Joined',
        body: `${invite.email} has accepted the invitation as ${invite.role}.`,
        link: `/team/${member.id}`
    });

    return NextResponse.json({ 
        studio_id: invite.studio_id, 
        member_id: member.id, 
        role: member.role 
    });

  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Accept invite failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
