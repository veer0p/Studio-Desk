import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { inviteMemberSchema } from '@/lib/validations/team';
import { generateSecureToken } from '@/lib/crypto';
import { sendEmail } from '@/lib/resend/client';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: List studio team members
 *     description: |
 *       Retrieves all members of the studio, including their roles and active status. 
 *       Also returns a list of pending invitations.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [owner, admin, photographer, assistant, editor, manager] }
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of team members and invitations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/TeamMember' } }
 *                 pending_invitations: { type: array, items: { $ref: '#/components/schemas/TeamInvitation' } }
 *                 count: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const role = searchParams.get('role');
    const isActive = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('studio_members')
      .select(`
        *,
        user:auth_user_id(email, last_sign_in_at)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .order('is_active', { ascending: false })
      .order('display_name', { ascending: true });

    if (role) query = query.eq('role', role);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: members, count, error } = await query;
    if (error) throw error;

    // Fetch invites separately
    const { data: invites } = await supabase
        .from('studio_invitations')
        .select('*')
        .eq('studio_id', member.studio_id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

    return NextResponse.json({
        data: members,
        pending_invitations: invites || [],
        count: count || 0,
        page,
        pageSize: limit
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Invite new member
 *     description: |
 *       Sends an invitation email to a new team member with a 48h token. 
 *       Only owners can invite other admins/members.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TeamInvite' }
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       409:
 *         description: Member already exists or invite already pending
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member, studio } = await requireOwner(req);
    const body = await req.json();
    const validated = inviteMemberSchema.parse(body);

    if (validated.role === 'owner') return NextResponse.json({ error: 'Only one owner allowed' }, { status: 422 });

    // 1. Check existing membership
    const { data: existing } = await supabase
        .from('studio_members')
        .select('id')
        .eq('studio_id', member.studio_id)
        .eq('email_at_invite', validated.email)
        .maybeSingle();
    
    if (existing) return NextResponse.json({ error: 'Email already has active membership' }, { status: 409 });

    // 2. Check existing invitation
    const { data: pending } = await supabase
        .from('studio_invitations')
        .select('id, expires_at')
        .eq('studio_id', member.studio_id)
        .eq('email', validated.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (pending) {
        return NextResponse.json({ 
            error: 'Invitation already sent', 
            invitation_id: pending.id 
        }, { status: 409 });
    }

    // 3. Create invitation
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: invite, error: iErr } = await supabase
      .from('studio_invitations')
      .insert({
        studio_id: member.studio_id,
        email: validated.email,
        role: validated.role,
        token,
        expires_at: expiresAt,
        invited_by: member.id
      })
      .select()
      .single();

    if (iErr) throw iErr;

    // 4. Send Email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`;
    await sendEmail({
        to: validated.email,
        subject: `You've been invited to join ${studio.name} on StudioDesk`,
        html: `
            <p>Hi,</p>
            <p>You've been invited to join <strong>${studio.name}</strong> as a <strong>${validated.role}</strong>.</p>
            <p><a href="${inviteLink}">Click here to accept the invitation</a></p>
            <p>This link expires in 48 hours.</p>
        `,
        studioId: member.studio_id
    });

    return NextResponse.json({ 
        invitation_id: invite.id, 
        email: invite.email, 
        role: invite.role, 
        expires_at: invite.expires_at 
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Invite member failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
