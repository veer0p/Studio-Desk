import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { generateSecureToken } from '@/lib/crypto';
import { sendEmail } from '@/lib/resend/client';

/**
 * POST /api/team/invite/[token]/resend
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { supabase, member, studio } = await requireOwner(req);

    const { data: invite, error } = await supabase
      .from('studio_invitations')
      .select('*')
      .eq('token', params.token)
      .eq('studio_id', member.studio_id)
      .is('accepted_at', null)
      .single();

    if (error || !invite) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    if (invite.resent_count >= 3) return NextResponse.json({ error: 'Maximum resend limit reached' }, { status: 422 });

    const newToken = generateSecureToken(32);
    const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('studio_invitations')
      .update({
        token: newToken,
        expires_at: newExpiresAt,
        resent_count: invite.resent_count + 1,
        last_resent_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${newToken}`;
    await sendEmail({
        to: invite.email,
        subject: `Invitation Resent: Join ${studio.name} on StudioDesk`,
        html: `<p>Your invitation to join ${studio.name} has been resent.</p><p><a href="${inviteLink}">Click here to join</a></p>`,
        studioId: member.studio_id
    });

    return NextResponse.json({ 
        resent: true, 
        resent_count: invite.resent_count + 1 
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
