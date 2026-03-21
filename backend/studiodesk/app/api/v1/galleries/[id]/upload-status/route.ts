import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { uploadStatusQuerySchema } from '@/lib/validations/gallery.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    await resolveUuidParam(context, req, 'gallery id')
    const parsed = uploadStatusQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await GalleryService.getUploadStatus(supabase, parsed.data.job_id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
