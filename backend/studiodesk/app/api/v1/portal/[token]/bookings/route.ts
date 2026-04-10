import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalSession } from '@/lib/services/portal.service'
import { handleRouteError, resolveTokenParam, withNoStore } from '@/lib/api/route-helpers'

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await resolveTokenParam(context, req, 'portal token')
    const session = await getPortalSession(token)
    const admin = createAdminClient()

    const { data: bookings } = await (admin as any)
      .from('bookings')
      .select(`
        id,
        title,
        event_date,
        event_type,
        status,
        total_amount,
        amount_paid,
        venue_name,
        venue_city,
        notes,
        created_at
      `)
      .eq('client_id', session.client_id)
      .eq('studio_id', session.studio_id)
      .order('event_date', { ascending: false })

    return withNoStore(
      Response.ok({
        data: (bookings || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          date: b.event_date ? new Date(b.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
          event_type: b.event_type,
          status: b.status,
          total_amount: b.total_amount,
          amount_paid: b.amount_paid,
          venue: b.venue_name || b.venue_city || 'TBD',
          notes: b.notes,
          created_at: b.created_at,
        })),
      })
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
