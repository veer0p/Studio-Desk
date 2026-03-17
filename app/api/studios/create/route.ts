import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/studios/create:
 *   post:
 *     summary: Create initial studio after auth signup
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studio_name, owner_name]
 *             properties:
 *               studio_name: { type: string }
 *               owner_name: { type: string }
 *     responses:
 *       200:
 *         description: Studio created successfully
 */
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(req);
    const { studio_name, owner_name } = await req.json();

    if (!studio_name || !owner_name) {
      return NextResponse.json({ error: 'Studio name and owner name are required' }, { status: 400 });
    }

    // Generate slug
    const slug = studio_name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s\-_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 1. Create Studio
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .insert({
        name: studio_name,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        onboarding_completed: false,
        settings: {
          notification_prefs: {
            email_new_lead: true,
            whatsapp_new_lead: true,
            email_payment_received: true,
            whatsapp_payment_received: true
          }
        }
      })
      .select()
      .single();

    if (studioError) throw studioError;

    // 2. Create Member (Owner)
    const { error: memberError } = await supabase
      .from('studio_members')
      .insert({
        studio_id: studio.id,
        user_id: user.id,
        role: 'owner',
        full_name: owner_name
      });

    if (memberError) throw memberError;

    // 3. Seed Default Automations
    const defaultAutomations = [
      { name: 'New Inquiry Auto-Reply', event_type: 'lead_created', provider: 'whatsapp' },
      { name: 'Proposal Viewed Alert', event_type: 'proposal_viewed', provider: 'whatsapp' },
      { name: 'Contract Signed Thank You', event_type: 'contract_signed', provider: 'whatsapp' },
      { name: 'Payment Confirmation', event_type: 'payment_received', provider: 'whatsapp' }
    ];

    await supabase.from('automation_settings').insert(
      defaultAutomations.map(a => ({
        studio_id: studio.id,
        ...a,
        is_active: true
      }))
    );

    // 4. Seed Default Form Config
    await supabase.from('inquiry_form_configs').insert({
      studio_id: studio.id,
      form_name: 'Default Inquiry Form',
      is_active: true
    });

    return NextResponse.json({ studio_id: studio.id, slug: studio.slug });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[STUDIO_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
