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
    const { data, error } = await admin
      .from('contracts')
      .select('id,status,sent_at,signed_at,access_token')
      .eq('booking_id', session.booking_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data) return withNoStore(Response.ok(null))
    return withNoStore(Response.ok({ id: data.id, status: data.status, sent_at: data.sent_at, signed_at: data.signed_at, view_url: `/api/v1/contracts/view/${data.access_token}` }))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
