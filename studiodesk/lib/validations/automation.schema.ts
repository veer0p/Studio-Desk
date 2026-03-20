import { z } from 'zod'
import { dateSchema, phoneSchema, uuidSchema } from '@/lib/validations/common.schema'

export const automationTypes = [
  'lead_acknowledgment',
  'lead_follow_up',
  'proposal_sent',
  'proposal_reminder',
  'contract_sent',
  'contract_reminder',
  'contract_signed',
  'advance_payment_reminder',
  'balance_payment_reminder',
  'payment_overdue_reminder',
  'payment_received',
  'gallery_ready',
  'gallery_reminder',
  'shoot_reminder',
  'post_shoot_followup',
] as const

export const automationTypeSchema = z.enum(automationTypes)
export const automationChannelSchema = z.enum(['whatsapp', 'email', 'both'])
export const automationStatusSchema = z.enum(['pending', 'sent', 'failed', 'cancelled'])
export const automationPeriodSchema = z.enum(['today', 'this_week', 'this_month', 'last_month'])

export const updateSettingSchema = z.object({
  automation_type: automationTypeSchema,
  is_enabled: z.boolean().optional(),
  channel: automationChannelSchema.optional(),
  delay_days: z.number().int().min(0).max(30).optional(),
  delay_hours: z.number().int().min(0).max(23).optional(),
  send_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
})

export const updateSettingsSchema = z.object({
  settings: z.array(updateSettingSchema).min(1).max(15),
})

export const triggerManualSchema = z
  .object({
    automation_type: automationTypeSchema,
    booking_id: uuidSchema.optional(),
    lead_id: uuidSchema.optional(),
  })
  .refine((data) => Boolean(data.booking_id || data.lead_id), {
    message: 'Either booking_id or lead_id required',
  })

export const testMessageSchema = z.object({
  automation_type: automationTypeSchema,
  phone: phoneSchema,
  channel: automationChannelSchema.optional(),
})

export const automationLogQuerySchema = z.object({
  automation_type: automationTypeSchema.optional(),
  channel: automationChannelSchema.optional(),
  status: automationStatusSchema.optional(),
  booking_id: uuidSchema.optional(),
  lead_id: uuidSchema.optional(),
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const statsQuerySchema = z.object({
  period: automationPeriodSchema.default('this_month'),
})

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type TriggerManualInput = z.infer<typeof triggerManualSchema>
export type TestMessageInput = z.infer<typeof testMessageSchema>
export type AutomationLogQueryInput = z.infer<typeof automationLogQuerySchema>
export type StatsQueryInput = z.infer<typeof statsQuerySchema>
