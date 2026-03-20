import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { createGallerySchema, galleriesQuerySchema } from '@/lib/validations/gallery.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const parsed = galleriesQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await GalleryService.getGalleries(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.paginated(result.data, result.count, parsed.data.page, parsed.data.pageSize))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const parsed = createGallerySchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.created(await GalleryService.createGallery(supabase, member.studio_id, parsed.data, user.id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
