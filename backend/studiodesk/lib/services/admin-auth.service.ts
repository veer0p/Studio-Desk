import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminLoginSchema } from '@/lib/validations/admin.schema'

type Db = SupabaseClient<Database>

/**
 * Admin authentication service.
 * Admins authenticate via Supabase Auth (same as studio users), then we verify
 * they have an active platform_admins record.
 */
export const AdminAuthService = {
  /**
   * Login: authenticate via Supabase, verify platform_admins record, create session.
   */
  async login(supabase: Db, email: string, password: string) {
    const validated = adminLoginSchema.parse({ email, password })

    // 1. Authenticate via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (authError || !authData?.user) {
      throw Errors.unauthorized()
    }

    // 2. Verify user is a platform admin
    const admin = await this.getAdminByUserId(supabase, authData.user.id)
    if (!admin) {
      throw Errors.forbidden()
    }

    if (!admin.is_active) {
      throw Errors.validation('Admin account is disabled')
    }

    // 3. Update login metadata
    await this.updateLoginMetadata(supabase, admin.id)

    // 4. Create admin session
    const session = await this.createSession(supabase, admin.id, authData.user.id)

    // 5. Log audit event
    await this.logAudit(supabase, admin.id, 'admin_login', null, null, null, {
      email: admin.email,
    })

    return {
      admin: this.sanitizeAdmin(admin),
      session,
      access_token: authData.session?.access_token ?? null,
    }
  },

  /**
   * Logout: revoke the admin session.
   */
  async logout(supabase: Db, sessionId: string, adminId: string) {
    const { error } = await supabase
      .from('admin_sessions')
      .update({
        revoked_at: new Date().toISOString(),
        revoke_reason: 'manual_logout',
      })
      .eq('id', sessionId)
      .eq('admin_id', adminId)

    if (error) {
      throw Errors.validation('Failed to revoke session')
    }

    // Sign out from Supabase
    await supabase.auth.signOut()
  },

  /**
   * Get current admin context from Supabase session.
   */
  async getAdminContext(supabase: Db) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw Errors.unauthorized()
    }

    const admin = await this.getAdminByUserId(supabase, user.id)
    if (!admin || !admin.is_active) {
      throw Errors.forbidden()
    }

    // Update last_active_at on current session
    await this.updateSessionActivity(supabase, admin.id)

    return {
      admin: this.sanitizeAdmin(admin),
      user,
      supabase,
    }
  },

  /**
   * Look up platform admin by user_id.
   */
  async getAdminByUserId(supabase: Db, userId: string) {
    const { data, error } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw Errors.validation('Failed to fetch admin record')
    }

    return data
  },

  /**
   * Create a new admin session.
   */
  async createSession(supabase: Db, adminId: string, userId: string, ipAddress = '0.0.0.0') {
    // Generate a random session token
    const sessionToken = crypto.randomUUID() + crypto.randomUUID()

    const { data, error } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        session_token: sessionToken,
        ip_address: ipAddress as any,
        user_agent: null,
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      })
      .select('*')
      .single()

    if (error) {
      throw Errors.validation('Failed to create admin session')
    }

    return data
  },

  /**
   * Validate a session token.
   * Checks: token exists, not revoked, not expired (8h absolute), and not idle (30min).
   */
  async validateSession(supabase: Db, sessionToken: string) {
    const now = new Date()
    const idleThreshold = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes idle timeout

    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*, platform_admins(*)')
      .eq('session_token', sessionToken)
      .is('revoked_at', null)
      .gte('expires_at', now.toISOString())
      .maybeSingle()

    if (error || !data) {
      return null
    }

    // Check idle timeout: if last_active_at is older than 30 minutes, session is expired
    const lastActiveAt = data.last_active_at ? new Date(data.last_active_at) : new Date(data.created_at)
    if (lastActiveAt < idleThreshold) {
      // Revoke the session
      await supabase
        .from('admin_sessions')
        .update({
          revoked_at: now.toISOString(),
          revoke_reason: 'idle_timeout',
        })
        .eq('id', data.id)
      return null
    }

    return {
      session: data,
      admin: (data as any).platform_admins,
    }
  },

  /**
   * Update session last_active_at.
   */
  async updateSessionActivity(supabase: Db, adminId: string) {
    await supabase
      .from('admin_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('admin_id', adminId)
      .is('revoked_at', null)
      .gte('expires_at', new Date().toISOString())
  },

  /**
   * Update admin login metadata.
   */
  async updateLoginMetadata(supabase: Db, adminId: string) {
    const { data: current } = await supabase
      .from('platform_admins')
      .select('login_count')
      .eq('id', adminId)
      .single()

    if (current) {
      await supabase
        .from('platform_admins')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (current.login_count || 0) + 1,
        })
        .eq('id', adminId)
    }
  },

  /**
   * Log an audit event (append-only).
   */
  async logAudit(
    supabase: Db,
    adminId: string,
    action: string,
    entityType: string | null = null,
    entityId: string | null = null,
    oldValue: Record<string, unknown> | null = null,
    newValue: Record<string, unknown> | null = null
  ) {
    // Fire-and-forget: don't block the caller
    void supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue,
        new_value: newValue,
      })
  },

  /**
   * Sanitize admin for API response (remove sensitive fields).
   */
  sanitizeAdmin(admin: any) {
    const { user_id, totp_secret, ...safe } = admin
    return safe
  },
}
