import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/dashboard
 * Platform overview: studio count, MRR, active subs, health metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const [overview, health] = await Promise.all([
      AdminDashboardService.getPlatformOverview(supabase),
      AdminDashboardService.getPlatformHealth(supabase),
    ])

    return ApiResponse.ok({
      overview,
      health,
      admin: {
        name: admin.name,
        role: admin.role,
      },
    })
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
