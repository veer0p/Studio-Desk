import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { ImmichService } from '@/lib/services/immich.service'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/gallery/[slug]/download-all
 * Queue bulk download of all gallery photos.
 * Returns a download URL that will be ready asynchronously.
 */
export async function POST(req: NextRequest, context: { params?: Promise<{ slug: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '' }))
    const slug = params.slug

    if (!slug) {
      return ApiResponse.error('Invalid gallery slug', 'VALIDATION_ERROR', 400)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 5 bulk downloads per IP per hour
    try {
      await checkAndIncrementRateLimitWithCustomMax(`gallery_bulk_download:${ip}:${slug}`, 5)
    } catch {
      return ApiResponse.error('Too many download requests. Please try again later.', 'RATE_LIMITED', 429)
    }

    const adminClient = createAdminClient()

    // Fetch gallery
    const { data: gallery, error: galleryError } = await adminClient
      .from('galleries')
      .select('id, studio_id, immich_album_id, immich_library_id, is_download_enabled')
      .eq('slug', slug)
      .single()

    if (galleryError || !gallery) {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }

    if (!gallery.is_download_enabled) {
      return ApiResponse.error('Downloads are not enabled for this gallery', 'FORBIDDEN', 403)
    }

    // Fetch all assets from Immich album
    if (!gallery.immich_album_id) {
      return ApiResponse.error('Gallery album not linked to Immich', 'NOT_FOUND', 404)
    }

    try {
      const albumAssets = await ImmichService.immichRequest(
        'GET',
        `/albums/${gallery.immich_album_id}`,
        {},
        gallery.immich_library_id
      ) as any

      const assets = albumAssets?.assets || []
      const assetIds = assets.map((a: any) => a.id)

      // Log the download request
      await adminClient.from('gallery_share_logs').insert({
        gallery_id: gallery.id,
        studio_id: gallery.studio_id,
        event_type: 'bulk_download_requested',
        ip_address: ip,
        metadata: { asset_count: assetIds.length } as any,
      })

      // Generate a signed download URL from Immich (album download)
      const downloadUrl = `/api/v1/gallery/${slug}/download-all/trigger?token=${Buffer.from(JSON.stringify({
        albumId: gallery.immich_album_id,
        libraryId: gallery.immich_library_id,
        assetIds,
        expires: Date.now() + 3600000, // 1 hour expiry
      })).toString('base64')}`

      return ApiResponse.ok({
        download_url: downloadUrl,
        asset_count: assetIds.length,
        message: assetIds.length > 100
          ? 'Large gallery detected. Download may take a few minutes to prepare.'
          : 'Download ready.',
      })
    } catch (immichError: any) {
      await logError({ message: 'Immich album fetch failed', context: immichError })
      return ApiResponse.error('Failed to prepare download', 'EXTERNAL_ERROR', 502)
    }
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
