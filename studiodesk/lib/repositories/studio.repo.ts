import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'

export type StudioRow = Database['public']['Tables']['studios']['Row']
export type StudioUpdate = Database['public']['Tables']['studios']['Update']

const SELECTED_COLUMNS = `
  id, name, slug, tagline, logo_url, brand_color,
  gstin, pan, business_address, city, state, state_id,
  pincode, phone, email, website,
  bank_name, bank_ifsc, bank_account_number,
  whatsapp_api_provider, whatsapp_phone,
  invoice_prefix, default_advance_pct, default_hsn_code,
  plan_tier, subscription_status, trial_ends_at,
  storage_limit_gb, storage_used_gb,
  onboarding_completed, onboarding_step,
  created_at, updated_at
`

export const studioRepo = {
  async getProfileById(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select(SELECTED_COLUMNS)
      .eq('id', studioId)
      .single()

    if (error || !data) {
      throw Errors.notFound('Studio')
    }

    return data as StudioRow
  },

  async updateProfile(supabase: SupabaseClient<Database>, studioId: string, data: StudioUpdate) {
    const { data: updated, error } = await supabase
      .from('studios')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', studioId)
      .select(SELECTED_COLUMNS)
      .single()

    if (error || !updated) {
      throw Errors.notFound('Studio')
    }

    return updated as StudioRow
  },

  async checkSlugAvailable(supabase: SupabaseClient<Database>, slug: string, excludeStudioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeStudioId)
      .maybeSingle()

    if (error) {
      throw Errors.validation('Failed to check slug availability')
    }

    return !data
  },

  async getStorageStats(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select('storage_used_gb, storage_limit_gb, plan_tier')
      .eq('id', studioId)
      .single()

    if (error || !data) {
      throw Errors.notFound('Studio')
    }

    return {
      storage_used_gb: data.storage_used_gb ?? 0,
      storage_limit_gb: data.storage_limit_gb ?? 0,
      plan_tier: data.plan_tier ?? 'starter',
    }
  },

  async getOnboardingStatus(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select('onboarding_completed, onboarding_step, onboarding_completed_at')
      .eq('id', studioId)
      .single()

    if (error || !data) {
      throw Errors.notFound('Studio')
    }

    return {
      onboarding_completed: data.onboarding_completed ?? false,
      onboarding_step: data.onboarding_step ?? 1,
      onboarding_completed_at: data.onboarding_completed_at,
    }
  },

  async getOnboardingEvents(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('studio_onboarding_events')
      .select('id, studio_id, step_number, step_name, completed_at, time_spent_sec, skipped')
      .eq('studio_id', studioId)
      .order('step_number', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch onboarding events')
    return data ?? []
  },

  async upsertOnboardingEvent(
    supabase: SupabaseClient<Database>,
    payload: {
      studio_id: string
      step_number: number
      step_name: string
      time_spent_sec?: number | null
      skipped: boolean
    }
  ) {
    const row = {
      studio_id: payload.studio_id,
      step_number: payload.step_number,
      step_name: payload.step_name,
      completed_at: new Date().toISOString(),
      time_spent_sec: payload.time_spent_sec ?? null,
      skipped: payload.skipped,
    }
    const { data: existing } = await supabase
      .from('studio_onboarding_events')
      .select('id')
      .eq('studio_id', payload.studio_id)
      .eq('step_number', payload.step_number)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('studio_onboarding_events')
        .update({
          completed_at: row.completed_at,
          time_spent_sec: row.time_spent_sec,
          skipped: row.skipped,
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw Errors.validation('Failed to update onboarding event')
      return data
    }
    const { data, error } = await supabase
      .from('studio_onboarding_events')
      .insert(row)
      .select()
      .single()
    if (error) throw Errors.validation('Failed to insert onboarding event')
    return data
  },

  async updateOnboardingStep(
    supabase: SupabaseClient<Database>,
    studioId: string,
    currentStep: number,
    isCompleted: boolean
  ) {
    const update: Record<string, unknown> = {
      onboarding_step: currentStep,
      updated_at: new Date().toISOString(),
    }
    if (isCompleted) {
      update.onboarding_completed = true
      update.onboarding_completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('studios')
      .update(update)
      .eq('id', studioId)
      .select('onboarding_completed, onboarding_step, onboarding_completed_at')
      .single()

    if (error || !data) throw Errors.notFound('Studio')
    return data
  },

  async upsertInquiryFormConfig(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: Record<string, unknown>
  ) {
    const payload = { ...data, updated_at: new Date().toISOString() }
    const { data: existing } = await supabase
      .from('inquiry_form_configs')
      .select('id')
      .eq('studio_id', studioId)
      .maybeSingle()

    if (existing) {
      const { data: row, error } = await supabase
        .from('inquiry_form_configs')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw Errors.validation('Failed to update inquiry form config')
      return row
    }
    const { data: row, error } = await supabase
      .from('inquiry_form_configs')
      .insert({ studio_id: studioId, ...payload })
      .select()
      .single()
    if (error) throw Errors.validation('Failed to insert inquiry form config')
    return row
  },
  async createStudio(supabase: SupabaseClient<Database>, data: { name: string; slug: string; email: string }) {
    const { data: row, error } = await supabase
      .from('studios')
      .insert({
        ...data,
        plan_tier: 'starter',
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select(SELECTED_COLUMNS)
      .single()

    if (error) {
      if (error.code === '23505') throw Errors.conflict('Studio slug already exists')
      throw error
    }
    return row as StudioRow
  },
}
