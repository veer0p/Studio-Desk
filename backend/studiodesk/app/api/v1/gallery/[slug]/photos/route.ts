import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { Errors } from '@/lib/errors'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'
import { ImmichService } from '@/lib/services/immich.service'

const PAGE_SIZE = 48

/**
 * GET /api/v1/gallery/[slug]/photos
 * Public endpoint: list photos for a published gallery with pagination.
 * Rate limited: 100 photo list requests per IP per hour.
 * Returns photo metadata with thumbnail URLs from Immich.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ slug: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '' }))
    const slug = params.slug || ''
    if (!slug) return ApiResponse.error('Missing gallery slug', 'VALIDATION_ERROR', 400)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 100 requests per IP per hour
    try {
      await checkAndIncrementRateLimitWithCustomMax(`gallery_photos:${ip}:${slug}`, 100)
    } catch {
      return ApiResponse.error('Too many requests. Please try again later.', 'RATE_LIMITED', 429)
    }

    // Find published gallery by slug
    const admin = createAdminClient()
    const { data: gallery, error: galleryError } = await admin
      .from('galleries')
      .select('id, name, status, is_published, expires_at, immich_album_id')
      .eq('slug', slug)
      .maybeSingle()

    if (galleryError || !gallery) throw Errors.notFound('Gallery')
    if (!gallery.is_published || gallery.status !== 'published') {
      throw Errors.forbidden()
    }
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) {
      throw Errors.notFound('Gallery')
    }

    // Get credentials
    const { apiKey } = await ImmichService.getStudioImmichCredentials(admin, gallery.id)

    // Parse pagination
    const url = new URL(req.url)
    const page = Math.max(0, parseInt(url.searchParams.get('page') || '0', 10))

    // Get album assets from Immich
    const res = await ImmichService.immichRequest(
      `/albums/${gallery.immich_album_id}/assets?size=thumbnail&withPartners=false&withPeople=true`,
      { method: 'GET', headers: { 'x-api-key': apiKey } },
      apiKey
    )

    const immichAssets = await res.json()
    const allAssets = Array.isArray(immichAssets) ? immichAssets : immichAssets?.assets || []

    // Paginate
    const totalCount = allAssets.length
    const start = page * PAGE_SIZE
    const paginatedAssets = allAssets.slice(start, start + PAGE_SIZE)

    // Map to photo objects
    const photos = paginatedAssets.map((asset: any) => ({
      id: asset.id,
      immich_asset_id: asset.id,
      filename: asset.originalFileName || asset.originalPath?.split('/').pop() || 'photo.jpg',
      mime_type: asset.type === 'video' ? asset.originalMimeType || 'video/mp4' : asset.originalMimeType || 'image/jpeg',
      file_size_bytes: asset.exifInfo?.fileSizeInByte || 0,
      taken_at: asset.exifInfo?.dateTimeOriginal || asset.fileCreatedAt || asset.createdAt,
      width: asset.exifInfo?.exifImageWidth || 0,
      height: asset.exifInfo?.exifImageHeight || 0,
      is_video: asset.type === 'VIDEO',
      thumb_url: `/api/v1/gallery/${slug}/photos/${asset.id}/thumb`,
      download_url: `/api/v1/gallery/${slug}/photos/${asset.id}/download`,
    }))

    // Log access
    await admin.from('gallery_share_logs').insert({
      gallery_id: gallery.id,
      studio_id: gallery.id,
      event_type: 'view',
      ip_address: ip as any,
    })

    return ApiResponse.paginated(photos, totalCount, page, PAGE_SIZE)
  } catch (err: any) {
    if (err.message === 'Gallery not found') {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Gallery not published', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
