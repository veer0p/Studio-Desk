import { z } from 'zod'
import { phoneSchema } from '@/lib/validations/common.schema'

export const updateNotificationSchema = z.object({
  notify_new_lead: z.boolean().optional(),
  notify_payment: z.boolean().optional(),
  notify_contract_signed: z.boolean().optional(),
  notify_gallery_viewed: z.boolean().optional(),
  notify_team_confirmed: z.boolean().optional(),
  notify_team_declined: z.boolean().optional(),
  notify_via_email: z.boolean().optional(),
  notify_via_whatsapp: z.boolean().optional(),
  working_hours_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  working_hours_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().min(1).max(100).optional(),
}).strict().refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field required',
})

export const updateIntegrationsSchema = z.object({
  whatsapp_api_provider: z.enum(['interakt', 'aisensy']).optional(),
  whatsapp_api_key: z.string().min(10).max(500).optional(),
  whatsapp_phone: phoneSchema.optional(),
  razorpay_account_id: z.string().min(5).max(100).optional(),
  // immich_user_id: z.string().min(5).max(200).optional(), // TODO: add to studios table
  // immich_api_key: z.string().min(10).max(500).optional(), // TODO: add to studios table
}).strict().refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field required',
})

export const testIntegrationSchema = z.object({
  service: z.enum(['whatsapp', 'immich', 'razorpay']),
  test_phone: phoneSchema.optional(),
}).strict().refine((data) => {
  if (data.service === 'whatsapp' && !data.test_phone) return false
  return true
}, {
  message: 'test_phone required for WhatsApp test',
})

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>
export type UpdateIntegrationsInput = z.infer<typeof updateIntegrationsSchema>
export type TestIntegrationInput = z.infer<typeof testIntegrationSchema>
