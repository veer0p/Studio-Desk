import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { uploadPhotosSchema } from '@/lib/validations/gallery.schema'

export async function POST(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    const parsed = uploadPhotosSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await GalleryService.queuePhotoUpload(supabase, id, member.studio_id, parsed.data.files, user.id)
    return withNoStore(Response.ok({ ...result, message: 'Upload queued. Check status with job_id.' }))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
