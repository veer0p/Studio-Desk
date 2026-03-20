import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, resolveUuidParam, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    return withNoStore(Response.ok(await GalleryService.getFaceClusters(supabase, id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
