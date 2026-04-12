import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminPlanService } from '@/lib/services/admin-plan.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/subscriptions
 * Platform subscription overview: active plans per tier, MRR breakdown.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const overview = await AdminPlanService.getSubscriptionOverview(supabase)

    return ApiResponse.ok(overview)
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
