import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth, requireSuperAdmin } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { createFeatureFlagSchema, updateFeatureFlagSchema } from '@/lib/validations/admin.schema'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/feature-flags
 * List all feature flags.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error('Failed to fetch feature flags')

    return ApiResponse.ok(data || [])
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/admin/feature-flags
 * Create a new feature flag.
 */
export async function POST(req: NextRequest) {
  try {
    const { admin, supabase } = await requireSuperAdmin(req)
    const adminClient = createAdminClient()

    const body = await req.json()
    const validated = createFeatureFlagSchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const { data, error } = await adminClient
      .from('feature_flags')
      .insert(validated.data as any)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') return ApiResponse.error('Flag already exists', 'CONFLICT', 409)
      throw new Error('Failed to create feature flag')
    }

    await AdminDashboardService.logAdminAction(supabase, admin.id, 'create_feature_flag', 'feature_flag', data.id, null, validated.data)

    return ApiResponse.created(data)
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Super admin access required') {
      return ApiResponse.error('Super admin access required', 'FORBIDDEN', 403)
    }
    if (err.code === 'CONFLICT') {
      return ApiResponse.error(err.message, 'CONFLICT', 409)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
