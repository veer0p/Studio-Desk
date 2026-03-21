import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

type UserRole = Database['public']['Tables']['studio_members']['Row']['role']

const MEMBER_COLUMNS =
  'id, user_id, role, display_name, phone, whatsapp, specialization, profile_photo_url, is_active, last_active_at, invited_at, accepted_at'

export const teamRepo = {
  async getMembers(supabase: any, studioId: string) {
    const { data, error } = await supabase
      .from('studio_members')
      .select(MEMBER_COLUMNS)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('accepted_at', { ascending: true, nullsFirst: false })

    if (error) throw Errors.validation('Failed to fetch members')
    return (data ?? []) as Array<any>
  },

  async getMemberById(
    supabase: any,
    memberId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('studio_members')
      .select(MEMBER_COLUMNS)
      .eq('id', memberId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch member')
    return data
  },

  async getMemberByUserId(
    supabase: any,
    userId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('studio_members')
      .select(MEMBER_COLUMNS)
      .eq('user_id', userId)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch member')
    return data
  },

  async countActiveMembers(supabase: any, studioId: string): Promise<number> {
    const { count, error } = await supabase
      .from('studio_members')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .eq('is_active', true)

    if (error) throw Errors.validation('Failed to count members')
    return count ?? 0
  },

  async countActiveNonOwnerMembers(
    supabase: any,
    studioId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from('studio_members')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .neq('role', 'owner')

    if (error) throw Errors.validation('Failed to count members')
    return count ?? 0
  },

  async createInvitation(
    supabase: any,
    data: {
      studio_id: string
      invited_by: string
      email: string
      role: UserRole
      token: string
      expires_at: string
    }
  ) {
    const { data: row, error } = await supabase
      .from('studio_invitations')
      .insert({
        ...data,
        resent_count: 0,
      })
      .select()
      .single()

    if (error) throw Errors.validation('Failed to create invitation')
    return row
  },

  async getInvitationByToken(supabase: any, token: string) {
    const { data, error } = await supabase
      .from('studio_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch invitation')
    return data
  },

  async getInvitationByEmail(
    supabase: any,
    email: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('studio_invitations')
      .select('*')
      .eq('email', email)
      .eq('studio_id', studioId)
      .is('accepted_at', null)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch invitation')
    return data
  },

  async markInvitationAccepted(supabase: any, invitationId: string) {
    const { error } = await supabase
      .from('studio_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId)

    if (error) throw Errors.validation('Failed to mark invitation accepted')
  },

  async incrementResendCount(supabase: any, invitationId: string) {
    const { data: inv } = await supabase
      .from('studio_invitations')
      .select('resent_count')
      .eq('id', invitationId)
      .single()
    const nextCount = ((inv as { resent_count?: number })?.resent_count ?? 0) + 1
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)
    const { error } = await supabase
      .from('studio_invitations')
      .update({
        resent_count: nextCount,
        last_resent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', invitationId)

    if (error) throw Errors.validation('Failed to update invitation')
  },

  async updateInvitationTokenAndExpiry(
    supabase: any,
    invitationId: string,
    token: string
  ) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)
    const { error } = await supabase
      .from('studio_invitations')
      .update({
        token,
        last_resent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', invitationId)

    if (error) throw Errors.validation('Failed to update invitation')
  },

  async createMember(
    supabase: any,
    data: {
      studio_id: string
      user_id: string
      role: UserRole
      display_name?: string | null
      accepted_at: string
      invited_by?: string | null
      invited_at?: string | null
    }
  ) {
    const { data: row, error } = await supabase
      .from('studio_members')
      .insert(data as any)
      .select()
      .single()

    if (error) throw Errors.validation('Failed to create member')
    return row
  },

  async updateMemberRole(
    supabase: any,
    memberId: string,
    studioId: string,
    role: UserRole
  ) {
    const { data, error } = await supabase
      .from('studio_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('studio_id', studioId)
      .select(MEMBER_COLUMNS)
      .single()

    if (error) throw Errors.notFound('Team member')
    return data
  },

  async setMemberActive(
    supabase: any,
    memberId: string,
    studioId: string,
    isActive: boolean
  ) {
    const { error } = await supabase
      .from('studio_members')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to update member')
  },

  async deactivateMember(supabase: any, memberId: string, studioId: string) {
    const { data: existing } = await supabase
      .from('studio_members')
      .select('id')
      .eq('id', memberId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (!existing) throw Errors.notFound('Team member')

    const { error } = await supabase
      .from('studio_members')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to deactivate member')
  },

  async getStudioName(supabase: any, studioId: string): Promise<string> {
    const { data, error } = await supabase
      .from('studios')
      .select('name')
      .eq('id', studioId)
      .single()
    if (error || !data) return 'Studio'
    return (data as { name: string }).name
  },

  /**
   * Uses service role: `subscription_plans` is not exposed to member JWT context in local RLS,
   * so user-scoped clients would always fall back to limit 1 and block invites incorrectly.
   */
  async getPlanMemberLimit(_supabase: any, studioId: string): Promise<number> {
    const admin = createAdminClient()
    const { data: studio, error: studioError } = await admin
      .from('studios')
      .select('plan_tier')
      .eq('id', studioId)
      .single()

    if (studioError || !studio) return 1

    const tier = (studio as { plan_tier: string | null }).plan_tier || 'studio'
    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('max_team_members')
      // @ts-expect-error: residual strict constraint
      .eq('tier', tier)
      .eq('is_active', true)
      .maybeSingle()

    if (planError || !plan) return 1
    return (plan as { max_team_members: number }).max_team_members ?? 1
  },
}
