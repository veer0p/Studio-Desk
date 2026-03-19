import { z } from 'zod'
import { phoneSchema, uuidSchema, dateSchema, amountSchema } from './common.schema'

const eventTypeEnum = z.enum([
  'wedding', 'pre_wedding', 'engagement', 'portrait', 'birthday',
  'corporate', 'product', 'maternity', 'newborn', 'other',
])
const sourceEnum = z.enum([
  'inquiry_form', 'referral', 'instagram', 'facebook',
  'google', 'walk_in', 'phone', 'other',
])
const statusEnum = z.enum([
  'new_lead', 'contacted', 'proposal_sent', 'contract_signed',
  'advance_paid', 'shoot_scheduled', 'delivered', 'closed', 'lost',
])
const priorityEnum = z.enum(['high', 'medium', 'low'])

export const inquiryFormSchema = z.object({
  full_name: z.string().min(2).max(200),
  phone: phoneSchema,
  email: z.string().email().optional(),
  event_type: eventTypeEnum.optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional(),
  budget_max: amountSchema.optional(),
  message: z.string().max(1000).optional(),
  guest_count: z.number().int().min(1).max(10000).optional(),
})

export const createLeadSchema = z.object({
  full_name: z.string().min(2).max(200),
  phone: phoneSchema,
  email: z.string().email().optional(),
  whatsapp: phoneSchema.optional(),
  client_id: uuidSchema.optional(),
  event_type: eventTypeEnum.optional(),
  event_date_approx: dateSchema.optional(),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional(),
  budget_max: amountSchema.optional(),
  source: sourceEnum.default('phone'),
  priority: priorityEnum.default('medium'),
  notes: z.string().max(1000).optional(),
  assigned_to: uuidSchema.optional(),
})

export const updateLeadSchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  event_date_approx: dateSchema.optional(),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional(),
  budget_max: amountSchema.optional(),
  follow_up_at: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  assigned_to: uuidSchema.optional().nullable(),
}).refine((obj) => obj && Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
})

export const convertLeadSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  event_date: dateSchema,
  total_amount: amountSchema.optional(),
  advance_amount: amountSchema.optional(),
  package_id: uuidSchema.optional(),
  gst_type: z.enum(['cgst_sgst', 'igst', 'exempt']).default('cgst_sgst'),
})

export const leadsQuerySchema = z.object({
  status: statusEnum.optional(),
  source: sourceEnum.optional(),
  event_type: eventTypeEnum.optional(),
  assigned_to: uuidSchema.optional(),
  search: z.string().max(100).optional(),
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>
export type LeadsQueryInput = z.infer<typeof leadsQuerySchema>
