import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signContractSchema } from '@/lib/validations/leads';
import { logError, logSecurityEvent } from '@/lib/logger';
import { sendEmail } from '@/lib/resend/client';

/**
 * @swagger
 * /api/contracts/public/{token}:
 *   get:
 *     summary: Public contract portal view
 *     description: Retrieves contract details for public signing. Marks as viewed on access.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contract details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contract' }
 *       404:
 *         description: Not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data: contract, error } = await supabase
      .from('contracts')
      .select(`
        *,
        studio:studios(*),
        client:clients(*),
        booking:bookings(*)
      `)
      .eq('access_token', params.token)
      .single();

    if (error || !contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    if (!contract.viewed_at) {
        await supabase.from('contracts').update({ viewed_at: new Date().toISOString() }).eq('id', contract.id);
    }

    return NextResponse.json({ data: contract });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/contracts/public/{token}:
 *   post:
 *     summary: Sign contract
 *     description: |
 *       Records client signature (base64 data), IP address, and user agent.
 *       Updates lead and booking status to 'contract_signed'.
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
 *           schema: { $ref: '#/components/schemas/ContractSign' }
 *     responses:
 *       200:
 *         description: Contract signed successfully
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                   success: { type: boolean }
 *                   pdf_url: { type: string, format: uri }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const validated = signContractSchema.parse(body);

    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';

    // 1. Fetch
    const { data: contract } = await supabase
      .from('contracts')
      .select('*, client:clients(*), studio:studios(*)')
      .eq('access_token', params.token)
      .single();

    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Update Contract
    const { data: updated, error: uErr } = await supabase
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

    if (uErr) throw uErr;

    // 3. Status Updates
    await supabase.from('leads').update({ status: 'contract_signed' }).eq('booking_id', contract.booking_id);
    await supabase.from('bookings').update({ status: 'contract_signed' }).eq('id', contract.booking_id);

    // 4. Activity & Security Logs
    await supabase.from('booking_activity_feed').insert({
        booking_id: contract.booking_id,
        studio_id: contract.studio_id,
        activity_type: 'contract_signed',
        metadata: { contract_id: contract.id }
    });

    await logSecurityEvent({
        eventType: 'contract_signed',
        req,
        context: { contract_id: contract.id, client_id: contract.client_id }
    });

    // 5. Notify both parties
    await sendEmail({
        to: contract.client.email,
        subject: `Your Contract is Signed - ${contract.studio.name}`,
        html: `<p>Thank you for signing. We look forward to working with you.</p>`,
        studioId: contract.studio_id
    });

    return NextResponse.json({ success: true, pdf_url: updated.signed_pdf_url });

  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Public signing failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
