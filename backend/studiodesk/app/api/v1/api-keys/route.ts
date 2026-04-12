import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { createApiKeySchema } from '@/lib/validations/api-key.schema'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/api-keys
 * List all API keys for current studio (prefix only, never full keys).
 */
export async function GET(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('api_keys')
      .select('*')
      .eq('studio_id', studio_id)
      .order('created_at', { ascending: false })

    if (error) throw new Error('Failed to fetch API keys')

    const keys = (data || []).map((k: any) => ({
      id: k.id,
      name: k.name,
      key_prefix: k.key_prefix,
      scopes: k.scopes,
      last_used_at: k.last_used_at,
      is_active: k.is_active && !k.revoked_at,
      expires_at: k.expires_at,
      created_at: k.created_at,
      revoked_at: k.revoked_at,
    }))

    return ApiResponse.ok({ keys })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/api-keys
 * Create a new API key. Returns the full key ONCE.
 */
export async function POST(req: NextRequest) {
  try {
    const { studio_id, user_id } = await requireAuth(req)
    const body = await req.json()
    const validated = createApiKeySchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    // Generate a cryptographically secure key
    const rawKey = `sdsk_${crypto.randomUUID().replace(/-/g, '')}`
    const keyPrefix = rawKey.substring(0, 12)

    // Hash the key using Web Crypto API
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const { data, error } = await adminClient
      .from('api_keys')
      .insert({
        studio_id,
        name: validated.data.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: validated.data.scopes,
        expires_at: validated.data.expires_at || null,
        created_by: user_id,
      })
      .select('id')
      .single()

    if (error) throw new Error('Failed to create API key')

    return ApiResponse.ok({
      key: rawKey,
      key_id: data.id,
      key_prefix: keyPrefix,
      name: validated.data.name,
      expires_at: validated.data.expires_at,
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
