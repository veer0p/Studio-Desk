import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { updateAutomationSettingsSchema } from '@/lib/validations/team';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/automations/settings:
 *   get:
 *     summary: Get studio automation settings
 *     description: Retrieves configured triggers and templates for studio-wide automations.
 *     tags: [Automations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Automation settings
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    
    const { data: settings, error } = await supabase
      .from('automation_settings')
      .select(`
        *,
        email_template:email_templates(*),
        whatsapp_template:whatsapp_templates(*)
      `)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/automations/settings:
 *   patch:
 *     summary: Update automation settings
 *     description: Upserts automation configurations (triggers, templates, active status).
 *     tags: [Automations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AutomationSettingsUpdate' }
 *     responses:
 *       200:
 *         description: Settings updated
 */
export async function PATCH(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();
    const { automations } = updateAutomationSettingsSchema.parse(body);

    const upserts = automations.map(a => ({
        studio_id: member.studio_id,
        ...a
    }));

    const { data, error } = await supabase
      .from('automation_settings')
      .upsert(upserts, { onConflict: 'studio_id, automation_type' })
      .select();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Update automation settings failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
