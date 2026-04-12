import { NextRequest, NextResponse } from 'next/server'
import { Errors } from '@/lib/errors'
import { checkAndIncrementRateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { ImmichService } from '@/lib/services/immich.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/gallery/[slug]/photos/[id]/download
 * Public endpoint: serve original photo with rate limiting (50/hr/IP).
 * Increments download count in gallery_share_logs.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ slug: string; id: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '', id: '' }))
    const slug = params.slug || ''
    const assetId = params.id || ''
    if (!slug || !assetId) return new NextResponse('Missing parameters', { status: 400 })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 50 downloads per hour per IP per gallery
    const rateKey = `gallery_download:${ip}:${slug}`
    await checkAndIncrementRateLimit(rateKey)

    const admin = createAdminClient()

    // Find gallery
    const { data: gallery } = await admin
      .from('galleries')
      .select('id, status, is_published, expires_at, immich_album_id')
      .eq('slug', slug)
      .maybeSingle()

    if (!gallery || !gallery.is_published) return new NextResponse('Not found', { status: 404 })
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) return new NextResponse('Expired', { status: 404 })

    // Get original from Immich
    const { apiKey } = await ImmichService.getStudioImmichCredentials(admin, gallery.id)
    const res = await ImmichService.immichRequest(
      `/assets/${assetId}/original`,
      { method: 'GET', headers: { 'x-api-key': apiKey } },
      apiKey
    )

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const filename = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] || 'photo.jpg'

    // Log download
    await admin.from('gallery_share_logs').insert({
      gallery_id: gallery.id,
      studio_id: gallery.id,
      event_type: 'download',
      ip_address: ip as any,
    })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (err: any) {
    if (err.code === 'RATE_LIMITED') {
      return new NextResponse('Too many downloads. Please try again later.', {
        status: 429,
        headers: { 'Retry-After': '3600' },
      })
    }
    await logError({ message: String(err), requestUrl: req.url })
    return new NextResponse('Internal server error', { status: 500 })
  }
}
