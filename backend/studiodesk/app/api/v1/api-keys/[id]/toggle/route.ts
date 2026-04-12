import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * PATCH /api/v1/api-keys/[id]/toggle
 * Toggle the active status of an API key.
 * Body: { is_active: boolean }
 */
export async function PATCH(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { studio_id } = await requireAuth(req)
    const params = await (context?.params || Promise.resolve({ id: '' }))
    const id = params.id || req.url.match(UUID_RE)?.[1] || ''

    if (!id) return ApiResponse.error('Invalid key ID', 'VALIDATION_ERROR', 400)

    const body = await req.json()
    const isActive = body?.is_active

    if (typeof isActive !== 'boolean') {
      return ApiResponse.error('is_active must be a boolean', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('api_keys')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('studio_id', studio_id)

    if (error) throw new Error('Failed to toggle API key status')

    return ApiResponse.ok({ is_active: isActive })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
