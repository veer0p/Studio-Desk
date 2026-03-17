import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getStudioContext } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/automations/logs:
 *   get:
 *     summary: List automation history
 *     description: Retrieves logs of executed and pending automation actions (emails, WhatsApp, tasks).
 *     tags: [Automations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, sent, failed, cancelled] }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Automation logs
 */
export async function GET(req: NextRequest) {
  try {
    const { studioId } = await getStudioContext();
    const supabase = createServerClient();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let query = supabase
      .from('automation_log')
      .select('*, booking:bookings(event_name), lead:leads(full_name)', { count: 'exact' })
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('automation_type', type);

    const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      count,
      page,
      pageSize,
    });
  } catch (err: any) {
    logger.error('Failed to fetch automation logs:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: err.status || 500 }
    );
  }
}
