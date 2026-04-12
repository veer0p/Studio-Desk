import { NextRequest, NextResponse } from 'next/server'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { ImmichService } from '@/lib/services/immich.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/gallery/[slug]/photos/[id]/thumb
 * Public endpoint: serve thumbnail image from Immich with caching.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ slug: string; id: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '', id: '' }))
    const slug = params.slug || ''
    const assetId = params.id || ''
    if (!slug || !assetId) return new NextResponse('Missing parameters', { status: 400 })

    const admin = createAdminClient()

    // Find gallery
    const { data: gallery } = await admin
      .from('galleries')
      .select('id, status, is_published, expires_at, immich_album_id')
      .eq('slug', slug)
      .maybeSingle()

    if (!gallery || !gallery.is_published) return new NextResponse('Not found', { status: 404 })
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) return new NextResponse('Expired', { status: 404 })

    // Get thumbnail from Immich
    const { apiKey } = await ImmichService.getStudioImmichCredentials(admin, gallery.id)
    const res = await ImmichService.immichRequest(
      `/assets/${assetId}/thumbnail?size=thumbnail&format=webp&quality=75`,
      { method: 'GET', headers: { 'x-api-key': apiKey } },
      apiKey
    )

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/webp'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Length': String(buffer.byteLength),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    })
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return new NextResponse('Internal server error', { status: 500 })
  }
}
