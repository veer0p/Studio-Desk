import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { updateStudioSettingsSchema } from '@/lib/validations/portal';



/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     summary: Get studio profile
 *     description: Returns the studio's branding and business details.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Studio profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudioProfile'
 *   patch:
 *     summary: Update studio profile
 *     description: Updates studio branding, address, and GST/PAN details. Owner only.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudioProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: studio, error } = await (supabase
      .from('studios')
      .select('name, logo_url, branding_colors, contact_email, contact_phone, address, settings')
      .eq('id', member.studio_id)
      .single() as any);



    if (error) throw error;
    return NextResponse.json(studio);

  } catch (error: any) {
    console.error('[SETTINGS_PROFILE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const body = await req.json();
    
    const validated = updateStudioSettingsSchema.parse(body);

    const { data, error } = await ((supabase as any)
      .from('studios')
      .update({
        ...(validated.studio as any),
        ...(validated.settings ? { settings: validated.settings } : {})
      })
      .eq('id', member.studio_id)
      .select()
      .single() as any);


    if (error) throw error;
    return NextResponse.json(data as any);

  } catch (error: any) {

    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[SETTINGS_PROFILE_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


