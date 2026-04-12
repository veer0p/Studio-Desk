import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/auth/me
 * Get current authenticated admin context.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, user } = await requireAdminAuth(req)

    return ApiResponse.ok({
      admin,
      user: {
        id: user.id,
        email: user.email,
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
