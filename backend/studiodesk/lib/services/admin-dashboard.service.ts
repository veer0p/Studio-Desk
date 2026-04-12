import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

type Db = SupabaseClient<Database>

/**
 * Admin Dashboard Service — platform-wide metrics for super admin panel.
 * All queries use admin Supabase client (bypass RLS).
 */
export const AdminDashboardService = {
  /**
   * Get platform overview: studio count, MRR, active subs, health metrics.
   */
  async getPlatformOverview(supabase: Db) {
    const admin = createAdminClient()

    // Fetch all studios
    const { data: studios, error: studiosError } = await admin
      .from('studios')
      .select('id, name, slug, plan_tier, subscription_status, is_active, storage_used_gb, storage_limit_gb, created_at, is_suspended')
      .order('created_at', { ascending: false })

    if (studiosError) throw Errors.validation('Failed to fetch studios')

    // Fetch subscription plans
    const { data: plans } = await admin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    // Aggregate metrics
    const totalStudios = (studios || []).length
    const activeStudios = (studios || []).filter((s) => s.is_active && !s.is_suspended)
    const suspendedStudios = (studios || []).filter((s) => s.is_suspended)
    const trialingStudios = (studios || []).filter((s) => s.subscription_status === 'trialing')
    const paidStudios = (studios || []).filter(
      (s) => ['active', 'active'].includes(s.subscription_status) && !s.is_suspended
    )

    // Storage usage
    const totalStorageUsed = activeStudios.reduce((sum, s) => sum + (s.storage_used_gb || 0), 0)
    const totalStorageLimit = activeStudios.reduce((sum, s) => sum + (s.storage_limit_gb || 0), 0)

    // Plan tier distribution
    const byTier = new Map<string, number>()
    activeStudios.forEach((s) => {
      const tier = s.plan_tier || 'free'
      byTier.set(tier, (byTier.get(tier) || 0) + 1)
    })

    // Recent studios (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentStudios = (studios || []).filter((s) => s.created_at >= sevenDaysAgo).length

    return {
      total_studios: totalStudios,
      active_studios: activeStudios.length,
      suspended_studios: suspendedStudios.length,
      trialing_studios: trialingStudios.length,
      paid_studios: paidStudios.length,
      recent_studios: recentStudios,
      storage: {
        used_gb: parseFloat(totalStorageUsed.toFixed(2)),
        limit_gb: parseFloat(totalStorageLimit.toFixed(2)),
        usage_pct: totalStorageLimit > 0 ? parseFloat(((totalStorageUsed / totalStorageLimit) * 100).toFixed(1)) : 0,
      },
      by_tier: Object.fromEntries(byTier),
      plans: plans || [],
    }
  },

  /**
   * Get health metrics from v_platform_studio_health view.
   */
  async getPlatformHealth(supabase: Db) {
    const admin = createAdminClient()

    // Check for studios with issues
    const { data: healthData, error } = await admin
      .from('studios')
      .select('id, name, slug, subscription_status, plan_tier, is_suspended, storage_used_gb, storage_limit_gb')
      .or('is_suspended.eq.true,subscription_status.eq.past_due,subscription_status.eq.cancelled')

    if (error) throw Errors.validation('Failed to fetch health data')

    // Studios nearing storage limit
    const { data: storageWarning } = await admin
      .from('studios')
      .select('id, name, slug, storage_used_gb, storage_limit_gb')
      .is('is_suspended', false)
      .filter('storage_used_gb', 'gt', 0)

    const storageCritical = (storageWarning || [])
      .filter((s) => s.storage_limit_gb > 0 && (s.storage_used_gb / s.storage_limit_gb) > 0.8)
      .map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        usage_pct: parseFloat(((s.storage_used_gb / s.storage_limit_gb) * 100).toFixed(1)),
      }))

    // Count errors in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: errorCount } = await admin
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)
      .eq('severity', 'critical' as any)

    return {
      unhealthy_studios: (healthData || []).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        issue: s.is_suspended
          ? 'suspended'
          : s.subscription_status === 'past_due'
            ? 'payment_overdue'
            : s.subscription_status === 'cancelled'
              ? 'cancelled'
              : 'unknown',
      })),
      storage_critical: storageCritical,
      critical_errors_24h: errorCount || 0,
    }
  },

  /**
   * List all studios with pagination and filters.
   */
  async listStudios(
    supabase: Db,
    params: {
      search?: string
      plan_tier?: string
      subscription_status?: string
      is_suspended?: boolean
      page: number
      pageSize: number
    }
  ) {
    const admin = createAdminClient()

    let query: any = admin.from('studios').select('*', { count: 'exact' })

    // Apply filters
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`)
    }
    if (params.plan_tier) {
      query = query.eq('plan_tier', params.plan_tier)
    }
    if (params.subscription_status) {
      query = query.eq('subscription_status', params.subscription_status)
    }
    if (params.is_suspended !== undefined) {
      query = query.eq('is_suspended', params.is_suspended)
    }

    // Pagination
    const offset = params.page * params.pageSize
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + params.pageSize - 1)

    if (error) throw Errors.validation('Failed to fetch studios')

    return {
      studios: data || [],
      count: count || 0,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil((count || 0) / params.pageSize),
    }
  },

  /**
   * Get studio detail with subscription and usage info.
   */
  async getStudioDetail(supabase: Db, studioId: string) {
    const admin = createAdminClient()

    // Studio info
    const { data: studio, error: studioError } = await admin
      .from('studios')
      .select('*')
      .eq('id', studioId)
      .single()

    if (studioError || !studio) throw Errors.notFound('Studio')

    // Members
    const { data: members } = await admin
      .from('studio_members')
      .select('id, display_name, email, role, is_active, created_at')
      .eq('studio_id', studioId)
      .eq('is_active', true)

    // Bookings count
    const { count: bookingCount } = await admin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .is('deleted_at', null)

    // Revenue
    const { data: payments } = await admin
      .from('payments')
      .select('amount, status, created_at')
      .eq('studio_id', studioId)
      .eq('status', 'captured')
      .order('created_at', { ascending: false })
      .limit(10)

    // Galleries
    const { count: galleryCount } = await admin
      .from('galleries')
      .select('*', { count: 'exact', head: true })
      .eq('studio_id', studioId)

    // Support notes
    const { data: supportNotes } = await admin
      .from('support_notes')
      .select('*, platform_admins(name)')
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })
      .limit(20)

    const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      studio,
      members: members || [],
      stats: {
        booking_count: bookingCount || 0,
        gallery_count: galleryCount || 0,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        recent_payments: payments || [],
      },
      support_notes: supportNotes || [],
    }
  },

  /**
   * Suspend a studio (blocks login, marks as suspended).
   */
  async suspendStudio(supabase: Db, studioId: string, adminId: string, reason: string) {
    const admin = createAdminClient()

    const { data: studio } = await admin
      .from('studios')
      .select('name, slug, is_suspended')
      .eq('id', studioId)
      .single()

    if (!studio) throw Errors.notFound('Studio')
    if (studio.is_suspended) throw Errors.conflict('Studio is already suspended')

    const { error } = await admin
      .from('studios')
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspension_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studioId)

    if (error) throw Errors.validation('Failed to suspend studio')

    // Log audit event
    await this.logAdminAction(supabase, adminId, 'suspend_studio', 'studio', studioId, null, { reason })

    return { suspended: true, studio: { name: studio.name, slug: studio.slug } }
  },

  /**
   * Reactivate a suspended studio.
   */
  async reactivateStudio(supabase: Db, studioId: string, adminId: string, reason: string) {
    const admin = createAdminClient()

    const { data: studio } = await admin
      .from('studios')
      .select('name, slug, is_suspended')
      .eq('id', studioId)
      .single()

    if (!studio) throw Errors.notFound('Studio')
    if (!studio.is_suspended) throw Errors.conflict('Studio is not suspended')

    const { error } = await admin
      .from('studios')
      .update({
        is_suspended: false,
        suspended_at: null,
        suspension_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studioId)

    if (error) throw Errors.validation('Failed to reactivate studio')

    await this.logAdminAction(supabase, adminId, 'reactivate_studio', 'studio', studioId, null, { reason })

    return { reactivated: true, studio: { name: studio.name, slug: studio.slug } }
  },

  /**
   * Start studio impersonation: generate a scoped session for admin.
   */
  async startImpersonation(
    supabase: Db,
    studioId: string,
    adminId: string,
    reason: string,
    ipAddress: string
  ) {
    const admin = createAdminClient()

    const { data: studio } = await admin
      .from('studios')
      .select('name, slug')
      .eq('id', studioId)
      .single()

    if (!studio) throw Errors.notFound('Studio')

    // Log impersonation start
    const { data: logEntry, error: logError } = await admin
      .from('studio_impersonation_log')
      .insert({
        admin_id: adminId,
        studio_id: studioId,
        reason,
        ip_address: ipAddress as any,
        actions_taken: [],
      })
      .select('id')
      .single()

    if (logError) throw Errors.validation('Failed to log impersonation')

    // Generate a session token for the admin (they'll use this to access studio APIs)
    const impersonationToken = `imp_${crypto.randomUUID()}`

    return {
      impersonation_id: logEntry.id,
      studio: { name: studio.name, slug: studio.slug },
      message: `Now impersonating ${studio.name}. All actions will be logged.`,
    }
  },

  /**
   * Log an admin action to audit logs.
   */
  async logAdminAction(
    supabase: Db,
    adminId: string,
    action: string,
    entityType: string | null = null,
    entityId: string | null = null,
    oldValue: Record<string, unknown> | null = null,
    newValue: Record<string, unknown> | null = null
  ) {
    const admin = createAdminClient()
    // Fire-and-forget
    void admin.from('admin_audit_logs').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
    })
  },
}
