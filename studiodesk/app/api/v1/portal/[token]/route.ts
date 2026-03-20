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

    await admin.from('client_portal_sessions').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', session.id)

    const [{ data: booking }, { data: client }, { data: studio }] = await Promise.all([
      admin.from('bookings').select('id,title,event_date,event_type,status,total_amount,amount_paid').eq('id', session.booking_id).maybeSingle(),
      admin.from('clients').select('id,full_name,email,phone').eq('id', session.client_id).maybeSingle(),
      admin.from('studios').select('id,name,slug,logo_url,brand_color').eq('id', session.studio_id).maybeSingle(),
    ])

    return withNoStore(
      Response.ok({
        booking,
        client,
        studio,
        status_summary: { booking_status: booking?.status ?? null },
      })
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
