import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * GET /api/v1/admin/studios/[id]
 * Studio detail with subscription, usage, members, and support notes.
 */
export async function GET(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const studioId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!studioId) {
      return ApiResponse.error('Invalid studio ID', 'VALIDATION_ERROR', 400)
    }

    const detail = await AdminDashboardService.getStudioDetail(supabase, studioId)

    return ApiResponse.ok(detail)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }
    if (err.message === 'Studio not found') {
      return ApiResponse.error('Studio not found', 'NOT_FOUND', 404)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
