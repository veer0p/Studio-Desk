import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth, requireSuperAdmin } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { updateFeatureFlagSchema } from '@/lib/validations/admin.schema'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * PATCH /api/v1/admin/feature-flags/[id]
 * Update a feature flag.
 */
export async function PATCH(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireSuperAdmin(req)
    const adminClient = createAdminClient()

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const flagId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!flagId) return ApiResponse.error('Invalid flag ID', 'VALIDATION_ERROR', 400)

    const body = await req.json()
    const validated = updateFeatureFlagSchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    // Get current value for audit
    const { data: current } = await adminClient.from('feature_flags').select('*').eq('id', flagId).maybeSingle()
    if (!current) return ApiResponse.error('Feature flag not found', 'NOT_FOUND', 404)

    const { data, error } = await adminClient
      .from('feature_flags')
      .update(validated.data as any)
      .eq('id', flagId)
      .select('*')
      .single()

    if (error) throw new Error('Failed to update feature flag')

    await AdminDashboardService.logAdminAction(supabase, admin.id, 'update_feature_flag', 'feature_flag', flagId, current, data)

    return ApiResponse.ok(data)
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Super admin access required') {
      return ApiResponse.error('Super admin access required', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/admin/feature-flags/[id]
 * Delete a feature flag.
 */
export async function DELETE(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireSuperAdmin(req)
    const adminClient = createAdminClient()

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const flagId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!flagId) return ApiResponse.error('Invalid flag ID', 'VALIDATION_ERROR', 400)

    const { data: current } = await adminClient.from('feature_flags').select('*').eq('id', flagId).maybeSingle()
    if (!current) return ApiResponse.error('Feature flag not found', 'NOT_FOUND', 404)

    const { error } = await adminClient.from('feature_flags').delete().eq('id', flagId)
    if (error) throw new Error('Failed to delete feature flag')

    await AdminDashboardService.logAdminAction(supabase, admin.id, 'delete_feature_flag', 'feature_flag', flagId, current, null)

    return ApiResponse.ok({ deleted: true, flag_name: current.flag_name })
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Super admin access required') {
      return ApiResponse.error('Super admin access required', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
