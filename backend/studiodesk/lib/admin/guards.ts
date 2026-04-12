import { NextRequest } from 'next/server'
import { createClient, createClientFromAccessToken } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminAuthService } from '@/lib/services/admin-auth.service'
import { Errors } from '@/lib/errors'

export interface AdminGuardResult {
  admin: any
  user: any
  supabase: any
}

/**
 * Require authenticated platform admin.
 * Validates admin_session cookie or Bearer token, then checks platform_admins table.
 */
export async function requireAdminAuth(req: NextRequest): Promise<AdminGuardResult> {
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''
  const sessionCookie = req.cookies.get('admin_session')?.value || ''

  const sessionToken = bearer || sessionCookie

  if (!sessionToken) {
    throw Errors.unauthorized()
  }

  // Use service role client to validate session (bypasses RLS)
  const supabase = createAdminClient()

  // Validate the session token against admin_sessions table
  const sessionValidation = await AdminAuthService.validateSession(supabase, sessionToken)
  if (!sessionValidation || !sessionValidation.admin || !sessionValidation.admin.is_active) {
    throw Errors.unauthorized()
  }

  // Update session activity
  await AdminAuthService.updateSessionActivity(supabase, sessionValidation.admin.id)

  // Create a mock user object for compatibility
  const user = {
    id: sessionValidation.admin.user_id,
    email: sessionValidation.admin.email,
  }

  return { admin: sessionValidation.admin, user, supabase }
}

/**
 * Require super_admin role specifically.
 */
export async function requireSuperAdmin(req: NextRequest): Promise<AdminGuardResult> {
  const context = await requireAdminAuth(req)

  if (context.admin.role !== 'super_admin') {
    throw Errors.validation('Super admin access required')
  }

  return context
}
