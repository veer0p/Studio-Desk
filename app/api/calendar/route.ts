import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: Get studio shoot calendar
 *     description: Returns bookings grouped by date for the calendar UI, including assigned team members.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Calendar data
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireOwner(req);
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from_date') || new Date().toISOString();
    const to = searchParams.get('to_date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: assignments, error } = await supabase
      .from('shoot_assignments')
      .select(`
        id,
        call_time,
        role,
        is_confirmed,
        booking:bookings(id, title, event_type, venue_city, venue_name, event_date),
        member:studio_members(display_name)
      `)
      .eq('studio_id', member.studio_id)
      .gte('call_time', from)
      .lte('call_time', to)
      .order('call_time', { ascending: true });

    if (error) throw error;

    // Group by Date for Calendar UI
    const calendar: Record<string, any[]> = {};
    
    assignments?.forEach(a => {
        const date = (a.booking as any).event_date;
        if (!calendar[date]) calendar[date] = [];
        
        // Find existing booking on same date
        let b = calendar[date].find(x => x.id === (a.booking as any).id);
        if (!b) {
            b = {
                ...(a.booking as any),
                call_time: a.call_time,
                assigned_members: []
            };
            calendar[date].push(b);
        }

        b.assigned_members.push({
            name: (a.member as any).display_name,
            role: a.role,
            is_confirmed: a.is_confirmed
        });
    });

    const result = Object.entries(calendar).map(([date, bookings]) => ({
        date,
        bookings
    }));

    return NextResponse.json({ data: result });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
