import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminPlanService } from '@/lib/services/admin-plan.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/plans
 * List all subscription plans.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const plans = await AdminPlanService.listPlans(supabase)

    return ApiResponse.ok(plans)
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
 * POST /api/v1/admin/plans
 * Create a new subscription plan.
 */
export async function POST(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const body = await req.json()
    const plan = await AdminPlanService.createPlan(supabase, body, admin.id)

    return ApiResponse.created(plan)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }
    if (err.code === 'CONFLICT') {
      return ApiResponse.error(err.message, 'CONFLICT', 409)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
