import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/dashboard/revenue:
 *   get:
 *     summary: Revenue chart data
 *     description: Returns daily/monthly revenue data from snapshots for charting. Owner only.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 12m]
 *           default: 30d
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Revenue chart data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueChartData'
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const studioId = member.studio_id;

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30d';
    const fromDateParam = url.searchParams.get('from_date');
    const toDateParam = url.searchParams.get('to_date');

    let fromDate: Date;
    if (fromDateParam) {
      fromDate = new Date(fromDateParam);
    } else {
      fromDate = new Date();
      if (period === '7d') fromDate.setDate(fromDate.getDate() - 7);
      else if (period === '90d') fromDate.setDate(fromDate.getDate() - 90);
      else if (period === '12m') fromDate.setFullYear(fromDate.getFullYear() - 1);
      else fromDate.setDate(fromDate.getDate() - 30); // Default 30d
    }

    const toDate = toDateParam ? new Date(toDateParam) : new Date();

    // 1. Fetch snapshots
    const { data: snapshots, error } = await supabase
      .from('revenue_snapshots')
      .select('snapshot_date, revenue_collected, revenue_pending')
      .eq('studio_id', studioId)
      .gte('snapshot_date', fromDate.toISOString().split('T')[0])
      .lte('snapshot_date', toDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw error;

    // 2. Format for chart (labels, collected, pending)
    const labels: string[] = [];
    const collected: number[] = [];
    const pending: number[] = [];
    let totalCollected = 0;
    let totalPending = 0;

    snapshots?.forEach(s => {
      const date = new Date(s.snapshot_date);
      const label = period === '12m' 
        ? date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      labels.push(label);
      collected.push(s.revenue_collected || 0);
      pending.push(s.revenue_pending || 0);
      totalCollected += (s.revenue_collected || 0);
      totalPending += (s.revenue_pending || 0);
    });

    // 3. Growth PCT logic (simplified comparison with previous period)
    const growthPct = 15.5; // Placeholder: In production, fetch previous period snapshots and compare

    return NextResponse.json({
      labels,
      collected,
      pending,
      total_collected: totalCollected,
      total_pending: totalPending,
      growth_pct: growthPct
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[DASHBOARD_REVENUE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
