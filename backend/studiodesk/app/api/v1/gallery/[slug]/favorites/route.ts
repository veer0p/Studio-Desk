import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/gallery/[slug]/favorites
 * Mark photos as favorites. Optionally requires PIN verification first.
 */
export async function POST(req: NextRequest, context: { params?: Promise<{ slug: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '' }))
    const slug = params.slug

    if (!slug) {
      return ApiResponse.error('Invalid gallery slug', 'VALIDATION_ERROR', 400)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 50 favorites per IP per hour
    try {
      await checkAndIncrementRateLimitWithCustomMax(`gallery_favorites:${ip}:${slug}`, 50)
    } catch {
      return ApiResponse.error('Too many requests. Please try again later.', 'RATE_LIMITED', 429)
    }

    const body = await req.json()
    const assetIds = body?.asset_ids

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return ApiResponse.error('asset_ids array is required', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    // Fetch gallery by slug
    const { data: gallery, error: galleryError } = await adminClient
      .from('galleries')
      .select('id, studio_id')
      .eq('slug', slug)
      .single()

    if (galleryError || !gallery) {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }

    // Insert favorites (insert, ignore errors for duplicates)
    const favorites = assetIds.map((assetId: string) => ({
      gallery_id: gallery.id,
      studio_id: gallery.studio_id,
      immich_asset_id: assetId,
    }))

    // Try insert, ignore duplicate errors
    const { error: insertError } = await adminClient
      .from('photo_favorites')
      .insert(favorites)

    if (insertError && insertError.code !== '23505') {
      await logError({ message: 'Failed to save favorites', context: insertError })
      return ApiResponse.error('Failed to save favorites', 'INTERNAL_ERROR', 500)
    }

    return ApiResponse.ok({ saved: assetIds.length })
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * GET /api/v1/gallery/[slug]/favorites
 * Get list of favorited asset IDs for a gallery.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ slug: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '' }))
    const slug = params.slug

    if (!slug) {
      return ApiResponse.error('Invalid gallery slug', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    const { data: gallery, error: galleryError } = await adminClient
      .from('galleries')
      .select('id')
      .eq('slug', slug)
      .single()

    if (galleryError || !gallery) {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }

    const { data: favorites, error: fetchError } = await adminClient
      .from('photo_favorites')
      .select('immich_asset_id')
      .eq('gallery_id', gallery.id)

    if (fetchError) {
      return ApiResponse.error('Failed to fetch favorites', 'INTERNAL_ERROR', 500)
    }

    return ApiResponse.ok({
      asset_ids: (favorites || []).map((f: any) => f.immich_asset_id),
    })
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
