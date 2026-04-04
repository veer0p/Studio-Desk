import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { packageRepo } from '@/lib/repositories/package.repo'
import { decrypt, encrypt } from '@/lib/crypto'
import { Errors, ServiceError } from '@/lib/errors'
import {
  UpdateProfileInput,
  STEP_NAMES,
  STEP_LABELS,
  STEP_SCHEMAS,
  type Step1Input,
  type Step5Input,
} from '@/lib/validations/studio.schema'

export interface StorageStats {
  used_gb: number
  limit_gb: number
  available_gb: number
  usage_pct: number
  status: 'ok' | 'warning' | 'critical'
  plan_tier: string
}

export interface OnboardingStep {
  step_number: number
  step_name: string
  label: string
  is_completed: boolean
  completed_at: string | null
  skipped: boolean
}

export interface OnboardingStatus {
  is_completed: boolean
  current_step: number
  progress_pct: number
  steps: OnboardingStep[]
}

export interface StudioProfile {
  id: string
  name: string
  slug: string
  tagline: string | null
  logo_url: string | null
  brand_color: string
  gstin: string | null
  pan: string | null
  business_address: string | null
  city: string | null
  state: string | null
  state_id: number | null
  pincode: string | null
  phone: string | null
  email: string | null
  website: string | null
  bank_name: string | null
  bank_account_number: string | null  // masked last 4 digits
  bank_ifsc: string | null
  whatsapp_api_provider: string | null
  whatsapp_phone: string | null
  invoice_prefix: string
  default_advance_pct: string
  default_hsn_code: string
  plan_tier: string
  subscription_status: string
  trial_ends_at: string | null
  storage: {
    used_gb: number
    limit_gb: number
    usage_pct: number
  }
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

export const StudioService = {
  async getProfile(supabase: any, studioId: string): Promise<StudioProfile> {
    const studio = await studioRepo.getProfileById(supabase, studioId)

    let decryptedBankAccount = null
    if (studio.bank_account_number) {
      try {
        const fullNumber = decrypt(studio.bank_account_number)
        decryptedBankAccount = fullNumber ? `XXXX${fullNumber.slice(-4)}` : null
      } catch (err) {
        console.warn(`[StudioService] Decryption failed for studio ${studioId}:`, err)
        decryptedBankAccount = null
      }
    }

    const storageUsed = studio.storage_used_gb || 0
    const storageLimit = studio.storage_limit_gb || 1 // Avoid div by zero
    const usagePct = Math.round((storageUsed / storageLimit) * 100 * 10) / 10

    // @ts-expect-error: residual strict constraint
    return {
      ...studio,
      bank_account_number: decryptedBankAccount,
      storage: {
        used_gb: storageUsed,
        limit_gb: storageLimit,
        usage_pct: Math.min(100, usagePct)
      }
    } as StudioProfile
  },

  async updateProfile(
    supabase: any,
    studioId: string,
    data: UpdateProfileInput,
    userId: string
  ): Promise<StudioProfile> {
    const updateData: any = { ...data }

    // Business Validations
    if (data.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstin)) {
      throw Errors.validation('Invalid GSTIN format')
    }
    if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) {
      throw Errors.validation('Invalid PAN format')
    }
    if (data.bank_ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bank_ifsc)) {
      throw Errors.validation('Invalid IFSC format')
    }
    if (data.pincode && !/^[1-9][0-9]{5}$/.test(data.pincode)) {
      throw Errors.validation('Invalid pincode')
    }
    if (data.brand_color && !/^#[0-9A-Fa-f]{6}$/.test(data.brand_color)) {
      throw Errors.validation('Invalid brand color hex code')
    }
    if (data.invoice_prefix) {
      if (data.invoice_prefix.length > 10) throw Errors.validation('Invoice prefix too long')
      if (!/^[A-Z0-9]+$/i.test(data.invoice_prefix)) throw Errors.validation('Invoice prefix must be alphanumeric')
      updateData.invoice_prefix = data.invoice_prefix.toUpperCase()
    }
    if (data.default_advance_pct !== undefined && (data.default_advance_pct < 0 || data.default_advance_pct > 100)) {
      throw Errors.validation('Advance percentage must be between 0 and 100')
    }
    if (data.bank_account_number) {
      updateData.bank_account_number = encrypt(data.bank_account_number)
    }
    if (data.name && (data.name.length < 2 || data.name.length > 100)) {
      throw Errors.validation('Name must be between 2 and 100 characters')
    }
    // @ts-expect-error: residual strict constraint
    if (data.slug) {
      // @ts-expect-error: residual strict constraint
      if (!/^[a-z0-9-]+$/.test(data.slug)) throw Errors.validation('Invalid slug format')
      // @ts-expect-error: residual strict constraint
      if (data.slug.length < 3 || data.slug.length > 50) throw Errors.validation('Slug must be between 3 and 50 characters')
      
      // @ts-expect-error: residual strict constraint
      const isAvailable = await studioRepo.checkSlugAvailable(supabase, data.slug, studioId)
      if (!isAvailable) {
        throw Errors.conflict('Studio slug already taken')
      }
    }

    await studioRepo.updateProfile(supabase, studioId, updateData)

    // Audit Log (Fire and forget)
    supabase.from('audit_logs').insert({
      entity_type: 'studios',
      entity_id: studioId,
      action: 'update',
      user_id: userId,
      entity_snapshot: { fields_changed: Object.keys(data) }
    }).then(({ error }: any) => {
      if (error) console.error('[StudioService] Failed to insert audit log:', error)
    })

    return this.getProfile(supabase, studioId)
  },

  async getStorageStats(
    supabase: any,
    studioId: string
  ): Promise<StorageStats> {
    const row = await studioRepo.getStorageStats(supabase, studioId)
    const used = row.storage_used_gb
    const limit = Math.max(row.storage_limit_gb, 0.001)
    const usagePct = Math.min(100, Math.round((used / limit) * 1000) / 10)
    const availableGb = Math.max(0, Math.round((limit - used) * 1000) / 1000)
    let status: 'ok' | 'warning' | 'critical' = 'ok'
    if (usagePct >= 95) status = 'critical'
    else if (usagePct >= 80) status = 'warning'
    return {
      used_gb: used,
      limit_gb: limit,
      available_gb: availableGb,
      usage_pct: usagePct,
      status,
      plan_tier: row.plan_tier ?? 'starter',
    }
  },

  async getOnboardingStatus(
    supabase: any,
    studioId: string
  ): Promise<OnboardingStatus> {
    const [studio, events] = await Promise.all([
      studioRepo.getOnboardingStatus(supabase, studioId),
      studioRepo.getOnboardingEvents(supabase, studioId),
    ])
    const eventByStep = new Map(
      (
        events as { step_number: number; completed_at: string | Date; skipped: boolean }[]
      ).map((e) => [
        e.step_number,
        {
          completed_at:
            typeof e.completed_at === 'string'
              ? e.completed_at
              : new Date(e.completed_at).toISOString(),
          skipped: e.skipped,
        },
      ])
    )
    const steps: OnboardingStep[] = [1, 2, 3, 4, 5].map((n) => {
      const ev = eventByStep.get(n)
      return {
        step_number: n,
        step_name: STEP_NAMES[n],
        label: STEP_LABELS[n],
        is_completed: !!ev,
        completed_at: ev?.completed_at ?? null,
        skipped: ev?.skipped ?? false,
      }
    })
    const completedCount = steps.filter((s) => s.is_completed).length
    const progressPct = Math.round((completedCount / 5) * 100)
    return {
      is_completed: !!studio.onboarding_completed,
      current_step: studio.onboarding_step ?? 1,
      progress_pct: progressPct,
      steps,
    }
  },

  async completeOnboardingStep(
    supabase: any,
    studioId: string,
    step: number,
    data: Record<string, unknown>,
    timeSpentSec?: number
  ): Promise<OnboardingStatus> {
    if (step < 1 || step > 5) {
      throw new ServiceError('Invalid step', 'INVALID_STEP', 400)
    }
    const schema = STEP_SCHEMAS[step]
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      throw Errors.validation(parsed.error.issues[0]?.message ?? 'Validation failed')
    }
    const skipped = Object.keys(data).length === 0

    if (step === 1) {
      const d = parsed.data as Step1Input
      await studioRepo.updateProfile(supabase, studioId, {
        name: d.name,
        phone: d.phone ?? undefined,
        city: d.city,
        state: d.state,
        tagline: d.tagline ?? undefined,
      })
    }

    if (step === 2) {
      const d = parsed.data as Record<string, unknown>
      if (Object.keys(d).length > 0) {
        await studioRepo.updateProfile(supabase, studioId, d as UpdateProfileInput)
      }
    }

    if (step === 3) {
      const d = parsed.data as Record<string, unknown>
      const update: UpdateProfileInput = {}
      if (d.bank_name != null) update.bank_name = d.bank_name as string
      if (d.bank_account_number != null)
        update.bank_account_number = encrypt(String(d.bank_account_number))
      if (d.bank_ifsc != null) update.bank_ifsc = d.bank_ifsc as string
      if (d.invoice_prefix != null)
        update.invoice_prefix = String(d.invoice_prefix).toUpperCase()
      if (d.default_advance_pct != null) update.default_advance_pct = Number(d.default_advance_pct)
      if (Object.keys(update).length > 0) {
        await studioRepo.updateProfile(supabase, studioId, update)
      }
    }

    if (step === 4) {
      const d = parsed.data as Record<string, unknown>
      const config: Record<string, unknown> = {
        form_title: d.form_title ?? 'Contact Us',
        button_text: d.button_text ?? 'Submit',
      }
      if (d.form_title != null) config.form_title = d.form_title
      if (d.button_text != null) config.button_text = d.button_text
      if (d.success_message != null) config.success_message = d.success_message
      if (d.show_event_type != null) config.show_event_type = d.show_event_type
      if (d.show_event_date != null) config.show_event_date = d.show_event_date
      if (d.show_budget != null) config.show_budget = d.show_budget
      if (d.require_phone != null) config.require_phone = d.require_phone
      await studioRepo.upsertInquiryFormConfig(supabase, studioId, config)
    }

    if (step === 5) {
      const d = parsed.data as Step5Input
      if (d.package) {
        const basePrice = parseFloat(String(d.package.base_price))
        await packageRepo.create(supabase, studioId, {
          name: d.package.name,
          event_type: d.package.event_type,
          base_price: basePrice,
          deliverables: d.package.deliverables ?? null,
          turnaround_days: d.package.turnaround_days ?? null,
        })
      }
    }

    await studioRepo.upsertOnboardingEvent(supabase, {
      studio_id: studioId,
      step_number: step,
      step_name: STEP_NAMES[step],
      time_spent_sec: timeSpentSec ?? null,
      skipped,
    })
    await studioRepo.updateOnboardingStep(
      supabase,
      studioId,
      step === 5 ? 5 : step + 1,
      step === 5
    )
    return this.getOnboardingStatus(supabase, studioId)
  },
}
