import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     summary: Global activity feed
 *     description: Returns a paginated list of all activities across all studio bookings.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, description: 'Filter by activity type' }
 *     responses:
 *       200:
 *         description: Paginated activity feed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ActivityFeedItem' }
 *                 total: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const studioId = member.studio_id;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('booking_activity_feed')
      .select(`
        id,
        activity_type,
        created_at,
        metadata,
        booking:booking_id (id, event_name)
      `, { count: 'exact' })
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (type) {
      query = query.eq('activity_type', type);
    }

    const { data: activities, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      activities: activities?.map(a => ({
        id: a.id,
        event_type: a.activity_type,
        booking_title: (a.booking as any)?.event_name,
        actor_name: 'Studio Member', // Would require joining with studio_members if needed
        actor_type: 'studio',
        metadata: a.metadata,
        created_at: a.created_at
      })) || [],
      total: count || 0
    });
  } catch (error: any) {
    console.error('[DASHBOARD_ACTIVITY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
