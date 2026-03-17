import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { ProposalDocument } from '@/lib/pdf/proposal-generator';
import { pdf } from '@react-pdf/renderer';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';
import { logError } from '@/lib/logger';
import React from 'react';

/**
 * @swagger
 * /api/proposals/{id}/send:
 *   post:
 *     summary: Generate and send proposal PDF
 *     description: |
 *       Generates a proposal PDF, uploads to storage, and sends via Email and WhatsApp.
 *       Updates lead status to 'proposal_sent'.
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
 *         description: Proposal sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 pdf_url: { type: string, format: uri }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Fetch details
    const { data: proposal, error: fErr } = await supabase
      .from('proposals')
      .select(`
        *,
        studio:studios(*),
        client:clients(*),
        line_items:proposal_line_items(*),
        booking:bookings(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fErr || !proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Generate PDF
    const pdfStream = await pdf(
        React.createElement(ProposalDocument, { proposal })
    ).toBuffer();

    // 3. Upload
    const storagePath = `proposals/${member.studio_id}/${proposal.id}-v${proposal.version}.pdf`;
    await supabase.storage
      .from('documents')
      .upload(storagePath, pdfStream, { contentType: 'application/pdf', upsert: true });

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath);

    // 4. Update
    await supabase.from('proposals').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        pdf_url: publicUrl
    }).eq('id', proposal.id);

    await supabase.from('leads').update({ status: 'proposal_sent' }).eq('booking_id', proposal.booking_id);

    // 5. Dispatch
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/proposals/p/${proposal.access_token}`;
    
    await Promise.allSettled([
        sendEmail({
            to: proposal.client.email,
            subject: `Proposal for ${proposal.booking.title}`,
            html: `<p>Please review our proposal here: <a href="${shareUrl}">${shareUrl}</a></p>`,
            studioId: member.studio_id
        }),
        sendTemplate({
            to: proposal.client.phone,
            templateName: 'proposal_sent',
            variables: [proposal.client.name, proposal.studio.name, shareUrl],
            studioId: member.studio_id
        })
    ]);

    await supabase.from('booking_activity_feed').insert({
        booking_id: proposal.booking_id,
        studio_id: member.studio_id,
        activity_type: 'proposal_sent',
        metadata: { proposal_id: proposal.id }
    });

    return NextResponse.json({ success: true, pdf_url: publicUrl });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Send proposal failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
