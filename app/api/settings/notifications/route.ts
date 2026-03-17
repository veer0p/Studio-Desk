import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     description: Returns the studio's global notification preferences.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved
 *   patch:
 *     summary: Update notification settings
 *     description: Updates global notification preferences (email/whatsapp) for different event types.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_prefs: { type: 'object' }
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: studio, error } = await supabase
      .from('studios')
      .select('settings->notification_prefs')
      .eq('id', member.studio_id)
      .single();

    if (error) throw error;
    return NextResponse.json(studio?.notification_prefs || {});
  } catch (error: any) {
    console.error('[SETTINGS_NOTIFICATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const body = await req.json();

    const validated = notificationPrefsSchema.parse(body.notification_prefs);

    // Fetch current settings first to merge
    const { data: current } = await supabase
      .from('studios')
      .select('settings')
      .eq('id', member.studio_id)
      .single();

    const updatedSettings = {
      ...(current?.settings || {}),
      notification_prefs: validated
    };

    const { data, error } = await supabase
      .from('studios')
      .update({ settings: updatedSettings })
      .eq('id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data?.settings?.notification_prefs || {});
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[SETTINGS_NOTIFICATIONS_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
