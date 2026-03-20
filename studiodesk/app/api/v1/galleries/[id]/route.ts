import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { updateGallerySchema } from '@/lib/validations/gallery.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    return withNoStore(Response.ok(await GalleryService.getGalleryById(supabase, id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    const parsed = updateGallerySchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await GalleryService.updateGallery(supabase, id, member.studio_id, parsed.data)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
