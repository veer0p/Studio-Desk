import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';

/**
 * POST /api/contracts/[id]/send
 */
/**
 * @swagger
 * /api/contracts/{id}/send:
 *   post:
 *     summary: Send contract for signature
 *     description: |
 *       Updates contract status to 'sent' and notifies client via Email and WhatsApp with signing link.
 *       Schedules a 48h reminder in automation logs.
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Contract sent successfully
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

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/contracts/s/${contract.access_token}`;

    // Update Status
    await supabase.from('contracts').update({
        status: 'sent',
        sent_at: new Date().toISOString()
    }).eq('id', contract.id);

    // Dispatch
    await Promise.allSettled([
        sendEmail({
            to: contract.client.email,
            subject: `Contract for Signature - ${contract.booking.title}`,
            html: `<p>Please sign your contract here: <a href="${signingUrl}">${signingUrl}</a></p>`,
            studioId: member.studio_id
        }),
        sendTemplate({
            to: contract.client.phone,
            templateName: 'contract_sent',
            variables: [contract.client.full_name, contract.studio.name, signingUrl],
            studioId: member.studio_id
        })
    ]);

    // Schedule 48h reminder
    await supabase.from('automation_log').insert({
        studio_id: member.studio_id,
        booking_id: contract.booking_id,
        automation_type: 'contract_reminder',
        scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        metadata: { contract_id: contract.id }
    });

    await supabase.from('booking_activity_feed').insert({
        booking_id: contract.booking_id,
        studio_id: member.studio_id,
        activity_type: 'contract_sent',
        metadata: { contract_id: contract.id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Send contract failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
