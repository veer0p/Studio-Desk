import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Home dashboard summary stats
 *     description: Returns aggregated stats for the home dashboard, including revenue, pending actions, upcoming shoots, and recent activity.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const studioId = member.studio_id;

    // 1. Current Month Aggregates (using snapshots)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const { data: snapshot } = await supabase
      .from('revenue_snapshots')
      .select('*')
      .eq('studio_id', studioId)
      .gte('snapshot_date', currentMonthStart.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    // 2. Real-time Pending Action Counts
    const [
      { count: unsignedContracts },
      { count: overdueInvoices },
      { count: unreadMessages },
      { count: unconfirmedAssignments }
    ] = await Promise.all([
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'sent'),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'sent').lt('due_date', new Date().toISOString()),
      supabase.from('client_messages').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('sender_type', 'client').eq('is_read', false),
      supabase.from('shoot_assignments').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('is_confirmed', false)
    ]);

    // 3. Upcoming Shoots (next 7 days)
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const { data: upcomingShoots } = await supabase
      .from('bookings')
      .select(`
        id,
        event_name,
        event_date,
        event_type,
        venue_city,
        client:client_id (full_name),
        shoot_assignments (count)
      `)
      .eq('studio_id', studioId)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .lte('event_date', next7Days.toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    // 4. Storage Usage
    const { data: subscription } = await supabase
      .from('studios')
      .select('storage_used_gb, plan_tier')
      .eq('id', studioId)
      .single();

    const storageLimit = subscription?.plan_tier === 'pro' ? 100 : subscription?.plan_tier === 'starter' ? 20 : 5;

    // 5. Recent Activity
    const { data: recentActivity } = await supabase
      .from('booking_activity_feed')
      .select(`
        id,
        activity_type,
        created_at,
        metadata,
        booking:booking_id (event_name)
      `)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })
      .limit(10);

    const result = {
      bookings_this_month: snapshot?.total_bookings || 0,
      revenue_this_month: snapshot?.revenue_collected || 0,
      new_leads_this_month: 0, // Would need a separate count or snapshot field
      photos_delivered_this_month: snapshot?.photos_delivered || 0,
      pending: {
        unsigned_contracts: unsignedContracts || 0,
        overdue_invoices: overdueInvoices || 0,
        advance_due_invoices: 0, // Add logic if needed
        unread_messages: unreadMessages || 0,
        unconfirmed_assignments: unconfirmedAssignments || 0,
      },
      upcoming_shoots: upcomingShoots?.map(b => ({
        booking_id: b.id,
        title: b.event_name,
        event_date: b.event_date,
        event_type: b.event_type,
        venue_city: b.venue_city,
        client_name: (b.client as any)?.full_name,
        assigned_count: (b.shoot_assignments as any)[0]?.count || 0
      })) || [],
      storage: {
        used_gb: subscription?.storage_used_gb || 0,
        limit_gb: storageLimit,
        usage_pct: Math.round(((subscription?.storage_used_gb || 0) / storageLimit) * 100)
      },
      recent_activity: recentActivity?.map(a => ({
        id: a.id,
        event_type: a.activity_type,
        booking_title: (a.booking as any)?.event_name,
        actor_name: 'System', // Expand logic if actor info is stored
        actor_type: 'studio',
        metadata: a.metadata,
        created_at: a.created_at
      })) || []
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[DASHBOARD_SUMMARY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
