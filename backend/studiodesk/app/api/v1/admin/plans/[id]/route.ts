import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth, requireSuperAdmin } from '@/lib/admin/guards'
import { AdminPlanService } from '@/lib/services/admin-plan.service'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * GET /api/v1/admin/plans/[id]
 * Get plan detail.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const planId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!planId) {
      return ApiResponse.error('Invalid plan ID', 'VALIDATION_ERROR', 400)
    }

    const plan = await AdminPlanService.getPlanById(supabase, planId)

    return ApiResponse.ok(plan)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }
    if (err.message === 'Plan not found') {
      return ApiResponse.error('Plan not found', 'NOT_FOUND', 404)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * PATCH /api/v1/admin/plans/[id]
 * Update a plan. Super admin only.
 */
export async function PATCH(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireSuperAdmin(req)

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const planId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!planId) {
      return ApiResponse.error('Invalid plan ID', 'VALIDATION_ERROR', 400)
    }

    const body = await req.json()
    const plan = await AdminPlanService.updatePlan(supabase, planId, body, admin.id)

    return ApiResponse.ok(plan)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied' || err.message === 'Super admin access required') {
      return ApiResponse.error('Super admin access required', 'FORBIDDEN', 403)
    }
    if (err.code === 'CONFLICT') {
      return ApiResponse.error(err.message, 'CONFLICT', 409)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/admin/plans/[id]
 * Deactivate a plan. Super admin only.
 */
export async function DELETE(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireSuperAdmin(req)

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const planId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!planId) {
      return ApiResponse.error('Invalid plan ID', 'VALIDATION_ERROR', 400)
    }

    const result = await AdminPlanService.deletePlan(supabase, planId, admin.id)

    return ApiResponse.ok(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied' || err.message === 'Super admin access required') {
      return ApiResponse.error('Super admin access required', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
