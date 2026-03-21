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
      .from('galleries')
      .select('id,slug,status,share_link_url')
      .eq('booking_id', session.booking_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return withNoStore(Response.ok(null))
    if (!data) return withNoStore(Response.ok(null))
    return withNoStore(Response.ok({ id: data.id, slug: data.slug, gallery_url: `/api/v1/gallery/${data.slug}`, share_link_url: data.share_link_url }))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
