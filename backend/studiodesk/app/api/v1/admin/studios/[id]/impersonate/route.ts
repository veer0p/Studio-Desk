import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminDashboardService } from '@/lib/services/admin-dashboard.service'
import { impersonateStudioSchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * POST /api/v1/admin/studios/[id]/impersonate
 * Start impersonating a studio. Generates a scoped session and logs the action.
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
    const validated = impersonateStudioSchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    const result = await AdminDashboardService.startImpersonation(
      supabase,
      studioId,
      admin.id,
      validated.data.reason,
      ip
    )

    return ApiResponse.ok(result)
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
