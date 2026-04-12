import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { suspendStudioSchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * POST /api/v1/admin/studios/[id]/suspend
 * Suspend a studio (blocks login, marks as suspended).
 */
export async function POST(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const params = await (context?.params || Promise.resolve({ id: '' }))
    const studioId = params.id || req.url.match(UUID_RE)?.[1] || ''
    if (!studioId) {
      return ApiResponse.error('Invalid studio ID', 'VALIDATION_ERROR', 400)
    }

    const body = await req.json()
    const validated = suspendStudioSchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const result = await AdminDashboardService.suspendStudio(
      supabase,
      studioId,
      admin.id,
      validated.data.reason
    )

    return ApiResponse.ok(result)
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
