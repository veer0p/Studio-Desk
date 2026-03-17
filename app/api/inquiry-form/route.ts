import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/inquiry-form:
 *   get:
 *     summary: Get dashboard inquiry form configuration
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Form configuration settings
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/InquiryFormConfig' }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('inquiry_form_configs')
      .select('*')
      .eq('studio_id', member.studio_id)
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/inquiry-form:
 *   patch:
 *     summary: Update inquiry form appearance and fields
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InquiryFormConfig' }
 *     responses:
 *       200:
 *         description: Configuration updated
 *       400:
 *         description: Invalid input (e.g. invalid hex color)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    // Simple hex validation
    const isHex = (str: string) => /^#[0-9A-F]{6}$/i.test(str);
    if (body.button_color && !isHex(body.button_color)) return NextResponse.json({ error: 'Invalid color' }, { status: 400 });

    const { data, error } = await supabase
      .from('inquiry_form_configs')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('studio_id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Update inquiry config failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
