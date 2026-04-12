import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

type Db = SupabaseClient<Database>

/**
 * Admin Plan Management Service — CRUD for subscription plans.
 * All queries use admin Supabase client (bypass RLS).
 */
export const AdminPlanService = {
  /**
   * List all subscription plans.
   */
  async listPlans(supabase: Db) {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('subscription_plans')
      .select('*')
      .order('monthly_price_inr', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch plans')

    return data || []
  },

  /**
   * Get plan detail by ID.
   */
  async getPlanById(supabase: Db, planId: string) {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch plan')
    if (!data) throw Errors.notFound('Plan')

    return data
  },

  /**
   * Create a new subscription plan.
   */
  async createPlan(supabase: Db, data: any, adminId: string) {
    const admin = createAdminClient()

    const { data: plan, error } = await admin
      .from('subscription_plans')
      .insert({
        tier: data.tier,
        name: data.name,
        monthly_price_inr: data.monthly_price_inr,
        annual_price_inr: data.annual_price_inr,
        max_team_members: data.max_team_members,
        max_bookings_per_month: data.max_bookings_per_month ?? null,
        storage_limit_gb: data.storage_limit_gb,
        razorpay_monthly_plan_id: data.razorpay_monthly_plan_id ?? null,
        razorpay_annual_plan_id: data.razorpay_annual_plan_id ?? null,
        features: data.features ?? [],
        is_active: data.is_active ?? true,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') throw Errors.conflict('Plan tier already exists')
      throw Errors.validation('Failed to create plan')
    }

    await this.logAdminAction(supabase, adminId, 'create_plan', 'subscription_plan', plan.id, null, {
      tier: plan.tier,
      name: plan.name,
      monthly_price_inr: plan.monthly_price_inr,
    })

    return plan
  },

  /**
   * Update a subscription plan.
   */
  async updatePlan(supabase: Db, planId: string, data: any, adminId: string) {
    const admin = createAdminClient()

    const { data: current } = await admin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle()

    if (!current) throw Errors.notFound('Plan')

    const updates: Record<string, any> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.monthly_price_inr !== undefined) updates.monthly_price_inr = data.monthly_price_inr
    if (data.annual_price_inr !== undefined) updates.annual_price_inr = data.annual_price_inr
    if (data.max_team_members !== undefined) updates.max_team_members = data.max_team_members
    if (data.max_bookings_per_month !== undefined) updates.max_bookings_per_month = data.max_bookings_per_month
    if (data.storage_limit_gb !== undefined) updates.storage_limit_gb = data.storage_limit_gb
    if (data.razorpay_monthly_plan_id !== undefined) updates.razorpay_monthly_plan_id = data.razorpay_monthly_plan_id
    if (data.razorpay_annual_plan_id !== undefined) updates.razorpay_annual_plan_id = data.razorpay_annual_plan_id
    if (data.features !== undefined) updates.features = data.features
    if (data.is_active !== undefined) updates.is_active = data.is_active

    const { data: plan, error } = await admin
      .from('subscription_plans')
      .update(updates)
      .eq('id', planId)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') throw Errors.conflict('Plan tier already exists')
      throw Errors.validation('Failed to update plan')
    }

    await this.logAdminAction(supabase, adminId, 'update_plan', 'subscription_plan', planId, current, plan)

    return plan
  },

  /**
   * Soft-delete (deactivate) a plan.
   */
  async deletePlan(supabase: Db, planId: string, adminId: string) {
    const admin = createAdminClient()

    const { data: current } = await admin
      .from('subscription_plans')
      .select('tier, name, is_active')
      .eq('id', planId)
      .maybeSingle()

    if (!current) throw Errors.notFound('Plan')

    const { error } = await admin
      .from('subscription_plans')
      .update({ is_active: false })
      .eq('id', planId)

    if (error) throw Errors.validation('Failed to delete plan')

    await this.logAdminAction(supabase, adminId, 'delete_plan', 'subscription_plan', planId, current, null)

    return { deleted: true, plan: { tier: current.tier, name: current.name } }
  },

  /**
   * Get subscription overview: active plans per tier, total MRR.
   */
  async getSubscriptionOverview(supabase: Db) {
    const admin = createAdminClient()

    // Studios with active subscriptions
    const { data: studios } = await admin
      .from('studios')
      .select('id, plan_tier, subscription_status, created_at')
      .eq('is_active', true)

    // Plans
    const plans = await this.listPlans(supabase)

    // Count studios by tier
    const byTier = new Map<string, number>()
    ;(studios || []).forEach((s) => {
      const tier = s.plan_tier || 'starter'
      byTier.set(tier, (byTier.get(tier) || 0) + 1)
    })

    // Calculate MRR
    const planMap = new Map<string, any>()
    plans.forEach((p) => planMap.set(p.tier, p))

    let totalMRR = 0
    byTier.forEach((count, tier) => {
      const plan = planMap.get(tier)
      if (plan) totalMRR += Number(plan.monthly_price_inr || 0) * count
    })

    return {
      total_active_studios: (studios || []).length,
      by_tier: Object.fromEntries(byTier),
      total_mrr: parseFloat(totalMRR.toFixed(2)),
      plans: plans.map((p) => ({
        ...p,
        studio_count: byTier.get(p.tier) || 0,
        monthly_revenue: parseFloat((Number(p.monthly_price_inr || 0) * (byTier.get(p.tier) || 0)).toFixed(2)),
      })),
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
