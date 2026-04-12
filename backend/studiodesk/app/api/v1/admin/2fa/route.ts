import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { TwoFAService } from '@/lib/services/two-fa.service'
import { enable2FASchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/admin/2fa/setup
 * Generate a new TOTP secret (not yet enabled). Returns secret and OTP URI for QR code.
 */
export async function POST(req: NextRequest) {
  try {
    const { admin } = await requireAdminAuth(req)

    const { secret, otpUri } = TwoFAService.generateSecret(admin.id, admin.email)

    return NextResponse.json(
      {
        data: { secret, otp_uri: otpUri },
        error: null,
      },
      {
        status: 200,
        headers: { 'X-API-Version': '1', 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Access denied') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/admin/2fa/enable
 * Enable 2FA: verify token against provided secret, then store in DB.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    if (admin.is_2fa_enabled) {
      return ApiResponse.error('2FA is already enabled', 'CONFLICT', 409)
    }

    const body = await req.json()
    const validated = enable2FASchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    // Verify the token against the provided secret
    const isValid = TwoFAService.verify(validated.data.secret, validated.data.token)
    if (!isValid) {
      return ApiResponse.error('Invalid 2FA code', 'INVALID_2FA', 401)
    }

    // Enable 2FA
    await TwoFAService.enable(supabase, admin.id, validated.data.secret)

    // Audit log
    await requireAdminAuth(req).then(({ admin: a, supabase: s }) =>
      import('@/lib/services/admin-auth.service').then(({ AdminAuthService }) =>
        AdminAuthService.logAudit(s, a.id, '2fa_enabled')
      )
    )

    return NextResponse.json(
      { data: { enabled: true }, error: null },
      { status: 200, headers: { 'X-API-Version': '1', 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Access denied') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/admin/2fa
 * Disable 2FA (requires current password verification — handled client-side by re-auth flow).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    if (!admin.is_2fa_enabled) {
      return ApiResponse.error('2FA is not enabled', 'CONFLICT', 409)
    }

    await TwoFAService.disable(supabase, admin.id)

    // Audit log
    await import('@/lib/services/admin-auth.service').then(({ AdminAuthService }) =>
      AdminAuthService.logAudit(supabase, admin.id, '2fa_disabled')
    )

    return NextResponse.json(
      { data: { disabled: true }, error: null },
      { status: 200, headers: { 'X-API-Version': '1', 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    if (err.message === 'Unauthorized' || err.message === 'Access denied') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
