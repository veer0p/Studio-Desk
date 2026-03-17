import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/dashboard/bookings/stats:
 *   get:
 *     summary: Booking pipeline stats
 *     description: Returns stage counts, event type breakdown, and conversion rates for the booking pipeline.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Booking pipeline stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingPipelineStats'
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const studioId = member.studio_id;

    // 1. Pipeline Stage Counts
    const { data: stageStats, error: stageError } = await supabase
      .from('leads')
      .select('status')
      .eq('studio_id', studioId);

    if (stageError) throw stageError;

    const stages = {
      new_lead: 0,
      contacted: 0,
      proposal_sent: 0,
      contract_signed: 0,
      advance_paid: 0,
      shoot_scheduled: 0,
      delivered: 0,
      closed: 0
    };

    stageStats?.forEach(lead => {
      if (lead.status in stages) {
        stages[lead.status as keyof typeof stages]++;
      }
    });

    // 2. Event Type Breakdown
    const { data: typeStats } = await supabase
      .from('bookings')
      .select('event_type')
      .eq('studio_id', studioId);

    const event_types: Record<string, number> = {};
    typeStats?.forEach(b => {
      if (b.event_type) {
        event_types[b.event_type] = (event_types[b.event_type] || 0) + 1;
      }
    });

    // 3. Conversion Rate (closed / total leads)
    const totalLeads = stageStats?.length || 0;
    const closedBookings = stages.closed;
    const conversion_rate = totalLeads > 0 ? (closedBookings / totalLeads) : 0;

    return NextResponse.json({
      stages,
      event_types,
      conversion_rate
    });
  } catch (error: any) {
    console.error('[DASHBOARD_BOOKING_STATS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
