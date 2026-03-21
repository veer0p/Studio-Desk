import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { publishGallerySchema } from '@/lib/validations/gallery.schema'

export async function POST(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    const parsed = publishGallerySchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await GalleryService.publishGallery(supabase, id, member.studio_id, parsed.data, user.id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
