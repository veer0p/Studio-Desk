import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';

/**
 * POST /api/contracts/[id]/remind
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*, studio:studios(*), client:clients(*), booking:bookings(*)')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (contract.status !== 'sent') return NextResponse.json({ error: 'Can only remind for sent, unsigned contracts' }, { status: 422 });

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/contracts/s/${contract.access_token}`;

    await Promise.allSettled([
        sendEmail({
            to: contract.client.email,
            subject: `Reminder: Contract for Signature - ${contract.booking.title}`,
            html: `<p>A reminder to sign your contract: <a href="${signingUrl}">${signingUrl}</a></p>`,
            studioId: member.studio_id
        }),
        sendTemplate({
            to: contract.client.phone,
            templateName: 'contract_reminder',
            variables: [contract.client.full_name, signingUrl],
            studioId: member.studio_id
        })
    ]);

    await supabase.from('contracts').update({ reminder_sent_at: new Date().toISOString() }).eq('id', contract.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
