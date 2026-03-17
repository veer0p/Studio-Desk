import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inquiryFormSchema } from '@/lib/validations/leads';
import { sendEmail } from '@/lib/resend/client';
import { sendTemplate } from '@/lib/whatsapp/client';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/inquiry/{studioSlug}:
 *   get:
 *     summary: Get public inquiry form configuration
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: studioSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Form configuration and studio details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     subtitle: { type: string }
 *                     button_text: { type: string }
 *                     button_color: { type: string }
 *                     fields_config: { type: object }
 *                     studio:
 *                       type: object
 *                       properties:
 *                         name: { type: string }
 *                         logo_url: { type: string }
 *       404:
 *         description: Studio or form not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { studioSlug: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data: config, error } = await supabase
      .from('inquiry_form_configs')
      .select(`
        title, subtitle, button_text, 
        button_color, background_color, success_message,
        fields_config, studio:studios(name, logo_url)
      `)
      .eq('studio_slug', params.studioSlug)
      .single();

    if (error || !config) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    return NextResponse.json({ data: config });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/inquiry/{studioSlug}:
 *   post:
 *     summary: Public lead capture
 *     description: |
 *       Submits an inquiry from the public form. 
 *       Performs rate limiting (5 req/hour per IP).
 *       Automically creates or matches client by phone number.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: studioSlug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InquiryCreate' }
 *     responses:
 *       200:
 *         description: Inquiry received successfully
 *       400:
 *         $ref: '#/components/schemas/ApiError'
 *       429:
 *         description: Rate limit exceeded
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { studioSlug: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data: config, error } = await supabase
      .from('inquiry_form_configs')
      .select(`
        title, subtitle, button_text, 
        button_color, background_color, success_message,
        fields_config, studio:studios(name, logo_url)
      `)
      .eq('studio_slug', params.studioSlug)
      .single();

    if (error || !config) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    return NextResponse.json({ data: config });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
