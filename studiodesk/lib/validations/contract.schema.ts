import { z } from 'zod'
import { uuidSchema } from '@/lib/validations/common.schema'

const eventTypeSchema = z.enum([
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

export const contractTokenSchema = z
  .string()
  .regex(/^[0-9a-f]{64}$/i, 'Invalid contract token')

export const createContractSchema = z.object({
  booking_id: uuidSchema,
  template_id: uuidSchema.optional(),
  custom_content: z.string().max(100000).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateContractSchema = z
  .object({
    content_html: z.string().min(100).max(100000).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const signContractSchema = z.object({
  signature_data: z.string().min(1, 'Signature is required').max(50000, 'Signature data too large'),
  signed_name: z.string().min(2).max(200).optional(),
})

export const createTemplateSchema = z.object({
  name: z.string().min(2).max(200),
  event_type: eventTypeSchema.optional().nullable(),
  content_html: z.string().min(50).max(100000),
  is_default: z.boolean().default(false),
})

export const updateTemplateSchema = createTemplateSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
})

export const contractsQuerySchema = z.object({
  status: z.enum(['draft', 'sent', 'signed', 'cancelled']).optional(),
  booking_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
export type SignContractInput = z.infer<typeof signContractSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type ContractsQueryInput = z.infer<typeof contractsQuerySchema>
