import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/gallery/[slug]/verify
 * Verify gallery access PIN/password.
 * Rate limited: 10 attempts per IP per hour.
 */
export async function POST(req: NextRequest, context: { params?: Promise<{ slug: string }> }) {
  try {
    const params = await (context?.params || Promise.resolve({ slug: '' }))
    const slug = params.slug

    if (!slug) {
      return ApiResponse.error('Invalid gallery slug', 'VALIDATION_ERROR', 400)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 10 PIN attempts per IP per hour
    try {
      await checkAndIncrementRateLimitWithCustomMax(`gallery_pin_verify:${ip}:${slug}`, 10)
    } catch {
      return ApiResponse.error('Too many PIN attempts. Please try again later.', 'RATE_LIMITED', 429)
    }

    const body = await req.json()
    const pin = body?.pin

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return ApiResponse.error('PIN is required', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    // Fetch gallery by slug
    const { data: gallery, error: galleryError } = await adminClient
      .from('galleries')
      .select('id, slug, password, is_published, expires_at')
      .eq('slug', slug)
      .single()

    if (galleryError || !gallery) {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }

    if (!gallery.is_published) {
      return ApiResponse.error('Gallery not published', 'FORBIDDEN', 403)
    }

    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) {
      return ApiResponse.error('Gallery has expired', 'EXPIRED', 410)
    }

    // If gallery has no password set, allow access without PIN
    if (!gallery.password) {
      return ApiResponse.ok({ verified: true, requires_pin: false })
    }

    // Compare PIN with stored password
    // Note: For production, use bcrypt comparison. For now, direct comparison.
    // TODO: Migrate to bcrypt-hashed passwords
    if (gallery.password !== pin) {
      return ApiResponse.error('Incorrect PIN', 'INVALID_PIN', 401)
    }

    return ApiResponse.ok({ verified: true, requires_pin: true })
  } catch (err: any) {
    if (err.message === 'Gallery not found') {
      return ApiResponse.error('Gallery not found', 'NOT_FOUND', 404)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
