import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * PATCH /api/v1/api-keys/[id]
 * Update API key name or scopes.
 */
export async function PATCH(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { studio_id } = await requireAuth(req)
    const params = await (context?.params || Promise.resolve({ id: '' }))
    const id = params.id || req.url.match(UUID_RE)?.[1] || ''

    if (!id) return ApiResponse.error('Invalid key ID', 'VALIDATION_ERROR', 400)

    const body = await req.json()
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('api_keys')
      .update({
        ...(body.name && { name: body.name }),
        ...(body.scopes && { scopes: body.scopes }),
        ...(body.expires_at !== undefined && { expires_at: body.expires_at }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('studio_id', studio_id)

    if (error) throw new Error('Failed to update API key')

    return ApiResponse.ok({ updated: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/api-keys/[id]
 * Revoke an API key.
 */
export async function DELETE(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { studio_id, user_id } = await requireAuth(req)
    const params = await (context?.params || Promise.resolve({ id: '' }))
    const id = params.id || req.url.match(UUID_RE)?.[1] || ''

    if (!id) return ApiResponse.error('Invalid key ID', 'VALIDATION_ERROR', 400)

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user_id,
      })
      .eq('id', id)
      .eq('studio_id', studio_id)

    if (error) throw new Error('Failed to revoke API key')

    return ApiResponse.ok({ revoked: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
