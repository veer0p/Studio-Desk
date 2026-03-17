import { NextRequest, NextResponse } from 'next/server';
import { requirePortalSession } from '@/lib/portal/auth';
import { portalSignContractSchema } from '@/lib/validations/portal';
import { logSecurityEvent } from '@/lib/logger';
import { resend } from '@/lib/resend/client';

/**
 * @swagger
 * /api/portal/{sessionToken}/contract/sign:
 *   post:
 *     summary: Client signs contract from portal
 *     description: Records client signature and updates contract status. Scoped to portal session.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractSign'
 *     responses:
 *       200:
 *         description: Contract signed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signed: { type: 'boolean' }
 *                 pdf_url: { type: 'string', format: 'uri' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, studioId, clientId, supabase } = await requirePortalSession(req);

    const body = await req.json();
    const validated = portalSignContractSchema.parse(body);

    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';

    // 1. Fetch contract for this booking
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*, client:clients(*), studio:studios(*)')
      .eq('booking_id', bookingId)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contract not found for this booking' }, { status: 404 });
    }

    if (contract.status === 'signed') {
      return NextResponse.json({ error: 'Contract is already signed' }, { status: 422 });
    }

    // 2. Update Contract
    const { data: updated, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: validated.signature_data,
        signed_ip: ip,
        signed_user_agent: ua
      })
      .eq('id', contract.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Status Updates
    await supabase.from('leads').update({ status: 'contract_signed' }).eq('booking_id', bookingId);
    await supabase.from('bookings').update({ status: 'contract_signed' }).eq('id', bookingId);

    // 4. Activity & Security Logs
    await supabase.from('booking_activity_feed').insert({
      booking_id: bookingId,
      studio_id: studioId,
      activity_type: 'contract_signed',
      metadata: { contract_id: contract.id, source: 'portal' }
    });

    await logSecurityEvent({
      eventType: 'contract_signed_portal',
      req,
      context: { contract_id: contract.id, client_id: clientId, booking_id: bookingId }
    });

    // 5. Notify parties (reuse resend or email client)
    const studioName = contract.studio.name;
    const clientEmail = contract.client.email;

    if (clientEmail) {
      await resend.emails.send({
        from: 'StudioDesk <contracts@studiodesk.in>',
        to: clientEmail,
        subject: `Contract Signed - ${studioName}`,
        html: `<p>Hello,</p><p>Thank you for signing the contract for "${contract.booking?.event_name || 'your event'}". You can view your signed documents in the portal.</p>`
      });
    }

    return NextResponse.json({ signed: true, pdf_url: updated.signed_pdf_url });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PORTAL_CONTRACT_SIGN_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
