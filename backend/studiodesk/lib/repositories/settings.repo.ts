import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>

const SETTINGS_COLUMNS = `
  id, studio_id,
  notify_new_lead:notify_new_lead_email,
  notify_payment:notify_payment_email,
  notify_via_email:notify_new_lead_email,
  notify_via_whatsapp:notify_new_lead_whatsapp,
  invoice_footer_text,
  timezone,
  updated_at
`

const INTEGRATION_COLUMNS = `
  whatsapp_api_provider, whatsapp_api_key, whatsapp_phone,
  razorpay_account_id,
  storage_used_gb, storage_limit_gb
`

function stripUndefined<T extends any>(input: T) {
  return Object.fromEntries(
    // @ts-expect-error: residual strict constraint
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

export const settingsRepo = {
  async getStudioSettings(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('studio_settings')
      .select(SETTINGS_COLUMNS)
      .eq('studio_id', studioId)
      .maybeSingle()
    if (error) {
      console.error('getStudioSettings error:', error)
      throw Errors.validation('Failed to fetch studio settings')
    }
    if (!data) return null
    const footer = typeof (data as any).invoice_footer_text === 'string' ? (data as any).invoice_footer_text : ''
    let extra: any = {}
    if (footer.startsWith('__settings_meta__:')) {
      try {
        extra = JSON.parse(footer.slice('__settings_meta__:'.length))
      } catch {
        extra = {}
      }
    }
    return { ...data, ...extra }
  },

  async upsertStudioSettings(supabase: Db, studioId: string, data: any) {
    const { data: existing } = await supabase
      .from('studio_settings')
      .select('invoice_footer_text')
      .eq('studio_id', studioId)
      .maybeSingle()
    const prevFooter =
      typeof existing?.invoice_footer_text === 'string' ? existing.invoice_footer_text : ''
    let prevExtra: any = {}
    if (prevFooter.startsWith('__settings_meta__:')) {
      try {
        prevExtra = JSON.parse(prevFooter.slice('__settings_meta__:'.length))
      } catch {
        prevExtra = {}
      }
    }
    const nextExtra = {
      ...prevExtra,
      ...(data.notify_contract_signed !== undefined ? { notify_contract_signed: data.notify_contract_signed } : {}),
      ...(data.notify_gallery_viewed !== undefined ? { notify_gallery_viewed: data.notify_gallery_viewed } : {}),
      ...(data.notify_team_confirmed !== undefined ? { notify_team_confirmed: data.notify_team_confirmed } : {}),
      ...(data.notify_team_declined !== undefined ? { notify_team_declined: data.notify_team_declined } : {}),
      ...(data.working_hours_start !== undefined ? { working_hours_start: data.working_hours_start } : {}),
      ...(data.working_hours_end !== undefined ? { working_hours_end: data.working_hours_end } : {}),
    }

    const mapped = stripUndefined({
      notify_new_lead_email: data.notify_new_lead,
      notify_payment_email: data.notify_payment,
      notify_new_lead_whatsapp: data.notify_via_whatsapp,
      notify_payment_whatsapp: data.notify_via_whatsapp,
      timezone: data.timezone,
      invoice_footer_text: `__settings_meta__:${JSON.stringify(nextExtra)}`,
      // Legacy schema does not have these; keep behavior stable by ignoring.
      ...(data.working_hours_start ? {} : {}),
      ...(data.working_hours_end ? {} : {}),
      ...(data.notify_contract_signed ? {} : {}),
      ...(data.notify_gallery_viewed ? {} : {}),
      ...(data.notify_team_confirmed ? {} : {}),
      ...(data.notify_team_declined ? {} : {}),
      ...data,
    })
    delete (mapped as any).notify_new_lead
    delete (mapped as any).notify_payment
    delete (mapped as any).notify_contract_signed
    delete (mapped as any).notify_gallery_viewed
    delete (mapped as any).notify_team_confirmed
    delete (mapped as any).notify_team_declined
    delete (mapped as any).notify_via_email
    delete (mapped as any).notify_via_whatsapp
    delete (mapped as any).working_hours_start
    delete (mapped as any).working_hours_end

    const payload = stripUndefined({
      studio_id: studioId,
      ...mapped,
      updated_at: new Date().toISOString(),
    })
    const { data: row, error } = await supabase
      .from('studio_settings')
      .upsert(payload, { onConflict: 'studio_id' })
      .select(SETTINGS_COLUMNS)
      .single()
    if (error || !row) {
      console.error('upsertStudioSettings error:', error)
      throw Errors.validation('Failed to update studio settings')
    }
    return row
  },

  async getIntegrationConfig(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select(INTEGRATION_COLUMNS)
      .eq('id', studioId)
      .maybeSingle()
    if (error || !data) throw Errors.notFound('Studio')
    return data
  },

  async updateIntegrations(supabase: Db, studioId: string, data: any) {
    const payload = stripUndefined({ ...data, updated_at: new Date().toISOString() })
    const { data: row, error } = await supabase
      .from('studios')
      .update(payload as any)
      .eq('id', studioId)
      .select(INTEGRATION_COLUMNS)
      .maybeSingle()
    if (error || !row) throw Errors.notFound('Studio')
    return row
  },

  async getBillingInfo(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('studios')
      .select(`
        plan_tier, subscription_status, trial_ends_at, storage_used_gb, storage_limit_gb
      `)
      .eq('id', studioId)
      .maybeSingle()

    if (error || !data) {
      console.error('getBillingInfo error:', error)
      throw Errors.notFound('Studio')
    }

    const [{ count: current_member_count }, { data: plan }] = await Promise.all([
      supabase
        .from('studio_members')
        .select('id', { count: 'exact', head: true })
        .eq('studio_id', studioId)
        .eq('is_active', true),
      supabase
        .from('subscription_plans')
        .select('name, monthly_price_inr, annual_price_inr, max_team_members, features')
        .eq('tier', (data as any).plan_tier)
        .maybeSingle(),
    ])

    return {
      plan_tier: data.plan_tier,
      subscription_status: data.subscription_status,
      trial_ends_at: data.trial_ends_at,
      storage_used_gb: data.storage_used_gb,
      storage_limit_gb: data.storage_limit_gb,
      plan_name: plan?.name,
      price_monthly: (plan as any)?.monthly_price_inr,
      price_annual: (plan as any)?.annual_price_inr,
      max_team_members: plan?.max_team_members,
      features: plan?.features,
      current_member_count,
    }
  },
}
