import { z } from 'zod'

export const createPlanSchema = z.object({
  tier: z.enum(['starter', 'studio', 'agency']),
  name: z.string().min(2).max(50),
  monthly_price_inr: z.coerce.number().min(0),
  annual_price_inr: z.coerce.number().min(0),
  max_team_members: z.coerce.number().int().min(1),
  max_bookings_per_month: z.coerce.number().int().min(0).nullable().optional(),
  storage_limit_gb: z.coerce.number().min(1),
  razorpay_monthly_plan_id: z.string().optional().nullable(),
  razorpay_annual_plan_id: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

export const updatePlanSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  monthly_price_inr: z.coerce.number().min(0).optional(),
  annual_price_inr: z.coerce.number().min(0).optional(),
  max_team_members: z.coerce.number().int().min(1).optional(),
  max_bookings_per_month: z.coerce.number().int().min(0).nullable().optional(),
  storage_limit_gb: z.coerce.number().min(1).optional(),
  razorpay_monthly_plan_id: z.string().nullable().optional(),
  razorpay_annual_plan_id: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
