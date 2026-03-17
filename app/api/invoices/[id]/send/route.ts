import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';
import { InvoiceDocument } from '@/lib/pdf/invoice-generator';
import { pdf } from '@react-pdf/renderer';
import { logError } from '@/lib/logger';
import React from 'react';

/**
 * @swagger
 * /api/invoices/{id}/send:
 *   post:
 *     summary: Send invoice to client via Email and WhatsApp
 *     description: |
 *       Generates invoice PDF, uploads to storage, and dispatches communications.
 *       Triggers 'invoice_sent' WhatsApp template.
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoice sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pdf_url:
 *                   type: string
 *       404:
 *         description: Invoice not found
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Fetch deep invoice details
    const { data: invoice, error: fetchErr } = await supabase
      .from('invoices')
      .select(`
        *,
        studio:studios(*),
        client:clients(*),
        line_items:invoice_line_items(*),
        booking:bookings(title)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 2. Generate PDF Buffer
    const pdfStream = await pdf(
        React.createElement(InvoiceDocument, {
            invoice,
            studio: invoice.studio,
            client: invoice.client,
            lineItems: invoice.line_items
        })
    ).toBuffer();

    // 3. Upload to Supabase Storage
    const storagePath = `invoices/${member.studio_id}/${invoice.id}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, pdfStream, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    // 4. Update Invoice status
    await supabase
      .from('invoices')
      .update({
        status: invoice.status === 'draft' ? 'sent' : invoice.status,
        sent_at: new Date().toISOString(),
        pdf_url: publicUrl
      })
      .eq('id', invoice.id);

    // 5. Dispatch Communications
    const emailPromise = sendEmail({
      to: invoice.client.email,
      subject: `Invoice #${invoice.invoice_number} from ${invoice.studio.name}`,
      html: `<p>Hello ${invoice.client.name},</p><p>Please find your invoice for <b>${invoice.booking.title}</b> attached.</p><p><a href="${invoice.payment_link_url}">Pay Now</a></p>`,
      studioId: member.studio_id,
      automationType: 'invoice_send'
    });

    const whatsappPromise = sendTemplate({
      to: invoice.client.phone,
      templateName: 'invoice_sent',
      variables: [
        invoice.client.name,
        invoice.invoice_number,
        invoice.total_amount.toString(),
        invoice.payment_link_url
      ],
      studioId: member.studio_id
    });

    await Promise.allSettled([emailPromise, whatsappPromise]);

    // 6. Log activity
    await supabase.from('booking_activity_feed').insert({
      booking_id: invoice.booking_id,
      studio_id: member.studio_id,
      activity_type: `${invoice.invoice_type}_invoice_sent`,
      metadata: { invoice_id: invoice.id }
    });

    return NextResponse.json({ success: true, pdf_url: publicUrl });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Send invoice failed', stack: error.stack, studioId: params.id });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
