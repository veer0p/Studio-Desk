import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/api-keys/validate
 * Public endpoint — validates an API key and returns studio_id + scopes.
 * Used by external services (Zapier, webhooks, etc).
 *
 * Body: { key: string }
 * Response: { valid: boolean, studio_id?: string, scopes?: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawKey = body?.key

    if (!rawKey || typeof rawKey !== 'string') {
      return ApiResponse.error('Missing or invalid key', 'VALIDATION_ERROR', 400)
    }

    // Hash the provided key using SHA-256
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('api_keys')
      .select('studio_id, scopes, is_active, expires_at')
      .eq('key_hash', keyHash)
      .single()

    if (error || !data) {
      return ApiResponse.ok({ valid: false })
    }

    // Check if key is active and not expired
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date()
    const isActive = data.is_active && !isExpired

    if (!isActive) {
      return ApiResponse.ok({ valid: false })
    }

    // Update last_used_at
    await adminClient
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        last_used_ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip,
      })
      .eq('key_hash', keyHash)

    return ApiResponse.ok({
      valid: true,
      studio_id: data.studio_id,
      scopes: data.scopes,
    })
  } catch (err: unknown) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
