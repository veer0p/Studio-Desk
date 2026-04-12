import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Response as ApiResponse } from '@/lib/response'
import { AdminAuthService } from '@/lib/services/admin-auth.service'
import { TwoFAService } from '@/lib/services/two-fa.service'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { login2FASchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'
import { env } from '@/lib/env'

/**
 * POST /api/v1/admin/auth/login/2fa
 * Second step of 2FA login: verify TOTP token, then finalize session.
 *
 * Flow:
 * 1. First call POST /api/v1/admin/auth/login → if 2FA needed, returns { requires_2fa: true, admin_id }
 * 2. Then call this endpoint with { admin_id, token } → returns final admin context + session
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 10 attempts per IP per hour for 2FA
    try {
      await checkAndIncrementRateLimitWithCustomMax(`admin_2fa_login:${ip}`, 10)
    } catch {
      return ApiResponse.error('Too many 2FA attempts. Please try again later.', 'RATE_LIMITED', 429)
    }

    const body = await req.json()
    const validated = login2FASchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // Fetch admin with 2FA secret
    const { data: admin, error: adminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('id', validated.data.admin_id)
      .single()

    if (adminError || !admin) {
      return ApiResponse.error('Admin not found', 'NOT_FOUND', 404)
    }

    // Verify TOTP token
    const isValid = TwoFAService.verifyForLogin(admin.totp_secret, validated.data.token)
    if (!isValid) {
      return ApiResponse.error('Invalid 2FA code', 'INVALID_2FA', 401)
    }

    // Update login metadata
    await AdminAuthService.updateLoginMetadata(supabase, admin.id)

    // Create session
    const session = await AdminAuthService.createSession(supabase, admin.id, admin.user_id, ip)

    // Log audit event
    await AdminAuthService.logAudit(supabase, admin.id, 'admin_login_2fa')

    const sanitizedAdmin = AdminAuthService.sanitizeAdmin(admin)

    const response = NextResponse.json(
      {
        data: {
          admin: sanitizedAdmin,
          session_token: session.session_token,
        },
        error: null,
      },
      {
        status: 200,
        headers: {
          'X-API-Version': '1',
          'Content-Type': 'application/json',
        },
      }
    )

    response.cookies.set('admin_session', session.session_token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    })

    return response
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return ApiResponse.error(err.errors[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Invalid credentials', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
