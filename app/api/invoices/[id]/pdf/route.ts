import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { InvoiceDocument } from '@/lib/pdf/invoice-generator';
import { pdf } from '@react-pdf/renderer';
import { logError } from '@/lib/logger';
import React from 'react';

/**
 * @swagger
 * /api/invoices/{id}/pdf:
 *   get:
 *     summary: Get invoice PDF signed URL
 *     description: Returns a signed URL for the invoice PDF. Generates the PDF if it does not exist.
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
 *         description: Signed URL for the PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, format: uri }
 *       404:
 *         description: Invoice not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Fetch invoice to see if PDF exists
    const { data: invoice, error: fetchErr } = await supabase
      .from('invoices')
      .select(`
        *,
        studio:studios(*),
        client:clients(*),
        line_items:invoice_line_items(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (fetchErr || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const storagePath = `invoices/${member.studio_id}/${invoice.id}.pdf`;

    // 2. If no PDF, generate and upload
    if (!invoice.pdf_url) {
      const pdfStream = await pdf(
        React.createElement(InvoiceDocument, {
            invoice,
            studio: invoice.studio,
            client: invoice.client,
            lineItems: invoice.line_items
        })
      ).toBuffer();

      await supabase.storage
        .from('documents')
        .upload(storagePath, pdfStream, {
            contentType: 'application/pdf',
            upsert: true
        });

      await supabase
        .from('invoices')
        .update({ pdf_url: storagePath }) // Update with path, not full URL
        .eq('id', invoice.id);
    }

    // 3. Create signed URL (60 mins expiry)
    // Re-check path from updated record if needed, but we know storagePath
    const { data, error: signErr } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600);

    if (signErr) throw signErr;

    return NextResponse.json({ url: data.signedUrl });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Get invoice PDF failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
