import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { studioListQuerySchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/studios
 * List all studios with pagination and filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const url = new URL(req.url)
    const parsed = studioListQuerySchema.safeParse({
      search: url.searchParams.get('search') || undefined,
      plan_tier: url.searchParams.get('plan_tier') || undefined,
      subscription_status: url.searchParams.get('subscription_status') || undefined,
      is_suspended: url.searchParams.get('is_suspended') || undefined,
      page: url.searchParams.get('page') || '0',
      pageSize: url.searchParams.get('pageSize') || '20',
    })

    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const result = await AdminDashboardService.listStudios(supabase, parsed.data)

    return ApiResponse.paginated(result.studios, result.count, result.page, result.pageSize)
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
