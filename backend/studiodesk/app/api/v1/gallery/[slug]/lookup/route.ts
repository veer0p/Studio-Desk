import { NextRequest } from 'next/server'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'
import { selfieUploadSchema } from '@/lib/validations/gallery.schema'

function ipOf(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
}

export async function POST(req: NextRequest, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
    const parsed = selfieUploadSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const buffer = Buffer.from(parsed.data.selfie.data, 'base64')
    return withNoStore(Response.ok(await GalleryService.guestSelfieLookup(params?.slug ?? '', buffer, parsed.data.selfie.name, ipOf(req))))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
