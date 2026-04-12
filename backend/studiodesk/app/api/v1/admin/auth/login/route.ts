import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Response as ApiResponse } from '@/lib/response'
import { AdminAuthService } from '@/lib/services/admin-auth.service'
import { TwoFAService } from '@/lib/services/two-fa.service'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'
import { env } from '@/lib/env'

/**
 * POST /api/v1/admin/auth/login
 * Step 1 of admin login: authenticate via Supabase Auth, verify platform_admins record.
 * If 2FA is enabled for this admin, returns { requires_2fa: true, admin_id }.
 * Otherwise, creates session and returns admin context + session token.
 * Rate limited: 5 attempts per IP per hour.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    // Rate limit: 5 attempts per IP per hour
    try {
      await checkAndIncrementRateLimitWithCustomMax(`admin_login:${ip}`, 5)
    } catch {
      return ApiResponse.error('Too many login attempts. Please try again later.', 'RATE_LIMITED', 429)
    }

    const body = await req.json()

    // Use service role client for admin auth (bypasses RLS for auth check)
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Authenticate via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (authError || !authData?.user) {
      return ApiResponse.error('Invalid credentials', 'UNAUTHORIZED', 401)
    }

    // Verify platform admin
    const admin = await AdminAuthService.getAdminByUserId(supabase, authData.user.id)
    if (!admin) {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }

    if (!admin.is_active) {
      return ApiResponse.error('Admin account is disabled', 'FORBIDDEN', 403)
    }

    // Check if 2FA is required
    const requires2FA = TwoFAService.isRequired(admin.role, admin.is_2fa_enabled)

    if (requires2FA && admin.is_2fa_enabled) {
      // 2FA is enabled — return admin_id for second step, don't create session yet
      return NextResponse.json(
        {
          data: {
            requires_2fa: true,
            admin_id: admin.id,
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
    }

    // No 2FA needed — proceed with full login
    await AdminAuthService.updateLoginMetadata(supabase, admin.id)
    const session = await AdminAuthService.createSession(supabase, admin.id, authData.user.id, ip)
    await AdminAuthService.logAudit(supabase, admin.id, 'admin_login')

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
    if (err.message === 'Access denied' || err.message === 'Admin account is disabled') {
      return ApiResponse.error(err.message, 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
