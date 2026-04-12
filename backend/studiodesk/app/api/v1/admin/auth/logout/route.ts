import { NextResponse, type NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { AdminAuthService } from '@/lib/services/admin-auth.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/admin/auth/logout
 * Revoke admin session and clear cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdminAuth(req)

    // Get session token from cookie
    const sessionToken = req.cookies.get('admin_session')?.value
    if (sessionToken) {
      // Use admin client to validate and logout
      const supabase = createAdminClient()
      const validated = await AdminAuthService.validateSession(supabase, sessionToken)
      if (validated) {
        await AdminAuthService.logout(supabase, validated.session.id, admin.id)
      }
    }

    // Create response and clear cookie
    const response = NextResponse.json(ApiResponse.ok({ success: true }))
    response.cookies.delete('admin_session')

    return response
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Logout failed', 'LOGOUT_ERROR', 500)
  }
}
