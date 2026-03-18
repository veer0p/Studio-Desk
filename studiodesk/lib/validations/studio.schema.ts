import { z } from 'zod'
import { gstinSchema, panSchema, pincodeSchema, phoneSchema, ifscSchema, amountSchema } from './common.schema'

// --- Onboarding step schemas ---
export const step1Schema = z.object({
  name: z.string().min(2).max(100),
  phone: phoneSchema,
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
})

export const step2Schema = z
  .object({
    gstin: gstinSchema.optional(),
    pan: panSchema.optional(),
    business_address: z.string().max(500).optional(),
    pincode: pincodeSchema.optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().nullable(),
  })
  .partial()

export const step3Schema = z
  .object({
    bank_name: z.string().max(100).optional(),
    bank_account_number: z.string().max(20).optional(),
    bank_ifsc: ifscSchema.optional(),
    invoice_prefix: z.string().max(10).regex(/^[A-Z0-9]+$/).optional(),
    default_advance_pct: z.number().min(0).max(100).optional(),
  })
  .partial()

export const step4Schema = z
  .object({
    form_title: z.string().max(100).optional(),
    button_text: z.string().max(50).optional(),
    success_message: z.string().max(300).optional(),
    show_event_type: z.boolean().optional(),
    show_event_date: z.boolean().optional(),
    show_budget: z.boolean().optional(),
    require_phone: z.boolean().optional(),
  })
  .partial()

const eventTypeEnum = z.enum([
  'wedding',
  'pre_wedding',
  'engagement',
  'portrait',
  'birthday',
  'corporate',
  'product',
  'maternity',
  'newborn',
  'other',
])

export const step5Schema = z
  .object({
    package: z
      .object({
        name: z.string().min(2).max(100),
        event_type: eventTypeEnum,
        base_price: amountSchema,
        deliverables: z.array(z.string()).optional(),
        turnaround_days: z.number().int().min(1).max(365).optional(),
      })
      .optional(),
  })
  .partial()

export const completeStepSchema = z.object({
  data: z.record(z.unknown()).optional().default({}),
  time_spent_sec: z.number().int().min(0).max(86400).optional(),
})

export const STEP_SCHEMAS: Record<number, z.ZodType<unknown>> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
}

export const STEP_NAMES: Record<number, string> = {
  1: 'basic_info',
  2: 'business_details',
  3: 'payment_setup',
  4: 'inquiry_form',
  5: 'first_package',
}

export const STEP_LABELS: Record<number, string> = {
  1: 'Basic Info',
  2: 'Business Details',
  3: 'Payment Setup',
  4: 'Inquiry Form',
  5: 'First Package',
}

export type Step1Input = z.infer<typeof step1Schema>
export type Step5Input = z.infer<typeof step5Schema>
export type CompleteStepInput = z.infer<typeof completeStepSchema>

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  tagline: z.string().max(200).optional(),
  logo_url: z.string().url().optional().nullable(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  gstin: gstinSchema.optional(),
  pan: panSchema.optional(),
  business_address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().optional(),
  state_id: z.number().int().optional(),
  pincode: pincodeSchema.optional(),
  phone: phoneSchema.optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().nullable(),
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(20).optional(),
  bank_ifsc: ifscSchema.optional(),
  whatsapp_api_provider: z.enum(['interakt', 'aisensy']).optional(),
  whatsapp_phone: phoneSchema.optional(),
  invoice_prefix: z.string().max(10).regex(/^[A-Z0-9]+$/i).optional(),
  default_advance_pct: z.number().min(0).max(100).optional(),
  default_hsn_code: z.string().optional(),
})
.strict()
.refine(obj => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided'
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
