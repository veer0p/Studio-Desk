import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { ImmichService } from '@/lib/services/immich.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/gallery/[slug]/photos/[id]
 * Public endpoint: single photo metadata with EXIF info.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ slug: string; id: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '', id: '' }))
    const slug = params.slug || ''
    const assetId = params.id || ''
    if (!slug || !assetId) return ApiResponse.error('Missing parameters', 'VALIDATION_ERROR', 400)

    const admin = createAdminClient()

    // Find gallery
    const { data: gallery } = await admin
      .from('galleries')
      .select('id, status, is_published, expires_at, immich_album_id')
      .eq('slug', slug)
      .maybeSingle()

    if (!gallery || !gallery.is_published) throw Errors.notFound('Gallery')
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) throw Errors.notFound('Gallery')

    // Get from Immich
    const { apiKey } = await ImmichService.getStudioImmichCredentials(admin, gallery.id)
    const res = await ImmichService.immichRequest(
      `/assets/${assetId}`,
      { method: 'GET', headers: { 'x-api-key': apiKey } },
      apiKey
    )

    const asset = await res.json()

    return ApiResponse.ok({
      id: asset.id,
      immich_asset_id: asset.id,
      filename: asset.originalFileName || asset.originalPath?.split('/').pop() || 'photo.jpg',
      mime_type: asset.originalMimeType || 'image/jpeg',
      file_size_bytes: asset.exifInfo?.fileSizeInByte || 0,
      taken_at: asset.exifInfo?.dateTimeOriginal || asset.fileCreatedAt,
      width: asset.exifInfo?.exifImageWidth || 0,
      height: asset.exifInfo?.exifImageHeight || 0,
      is_video: asset.type === 'VIDEO',
      exif: asset.exifInfo || null,
      thumb_url: `/api/v1/gallery/${slug}/photos/${asset.id}/thumb`,
      download_url: `/api/v1/gallery/${slug}/photos/${asset.id}/download`,
    })
  } catch (err: any) {
    if (err.message === 'Gallery not found') {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
