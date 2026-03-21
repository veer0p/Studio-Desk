import { NextRequest } from 'next/server'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { handleRouteError, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { GalleryService } from '@/lib/services/gallery.service'

function ipOf(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
}

export async function GET(req: NextRequest, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
    await checkAndIncrementRateLimitWithCustomMax(`public_gallery:${params?.slug}:${ipOf(req)}`, 100)
    return withCache(Response.ok(await GalleryService.getPublicGallery(params?.slug ?? '', ipOf(req))), 'public, max-age=60, stale-while-revalidate=300')
  } catch (err) {
    return handleRouteError(err, req)
  }
}
