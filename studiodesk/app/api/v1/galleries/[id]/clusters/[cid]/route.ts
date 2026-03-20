import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { labelClusterSchema } from '@/lib/validations/gallery.schema'

async function resolveClusterId(context: any, req: NextRequest) {
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
  const candidate = params?.cid ?? req.url.split('/').at(-1) ?? ''
  const parsed = z.string().uuid().safeParse(candidate)
  if (!parsed.success) throw { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid cluster id' }
  return parsed.data
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'gallery id')
    const cid = await resolveClusterId(context, req)
    const parsed = labelClusterSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await GalleryService.labelFaceCluster(supabase, id, member.studio_id, cid, parsed.data.label)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
