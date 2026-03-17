import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getStudioContext } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Fetch user notifications
 *     description: Retrieves recent notifications for the authenticated user within the studio context.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema: { type: boolean }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: List of notifications
 */
export async function GET(req: NextRequest) {
  try {
    const { studioId, memberId } = await getStudioContext();
    const supabase = createServerClient();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // In StudioDesk, user notifications are linked to the auth.user through studio_members
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('studio_id', studioId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    logger.error('Failed to fetch notifications:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: err.status || 500 }
    );
  }
}

/**
 * @swagger
 * /api/notifications:
 *   patch:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds: { type: array, items: { type: string, format: uuid } }
 *               all: { type: boolean }
 *     responses:
 *       200:
 *         description: Notifications updated
 */
export async function PATCH(req: NextRequest) {
  try {
    const { studioId } = await getStudioContext();
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await req.json();
    const { notificationIds, all = false } = body;

    let query = supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('studio_id', studioId)
      .eq('user_id', user.id);

    if (!all && Array.isArray(notificationIds)) {
      query = query.in('id', notificationIds);
    } else if (!all) {
      return NextResponse.json({ error: 'Missing notificationIds' }, { status: 400 });
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to update notifications:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: err.status || 500 }
    );
  }
}
