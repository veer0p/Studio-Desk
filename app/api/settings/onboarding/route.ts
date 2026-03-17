import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/settings/onboarding:
 *   get:
 *     summary: Get onboarding checklist status
 *     description: Returns the completion status of various setup steps (profile, team, payments).
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const studioId = member.studio_id;

    // Fetch studio setup data
    const [
      { data: studio },
      { count: teamCount },
      { count: bookingCount }
    ] = await Promise.all([
      supabase.from('studios').select('razorpay_key_id, brand_color, logo_url').eq('id', studioId).single(),
      supabase.from('studio_members').select('*', { count: 'exact', head: true }).eq('studio_id', studioId),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('studio_id', studioId)
    ]);

    const result = {
      profile_completed: !!(studio?.brand_color && studio?.logo_url),
      payments_connected: !!studio?.razorpay_key_id,
      team_invited: (teamCount || 0) > 1, // At least one besides owner
      first_booking_created: (bookingCount || 0) > 0,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[SETTINGS_ONBOARDING_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
