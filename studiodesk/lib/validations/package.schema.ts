import { z } from 'zod'
import { amountSchema } from './common.schema'

export const lineItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  hsn_sac_code: z.string().optional(),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/).default('1'),
  unit_price: amountSchema,
})

export const createPackageSchema = z.object({
  name: z.string().min(2).max(100),
  event_type: z.enum([
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
  ]),
  description: z.string().max(500).optional(),
  base_price: amountSchema,
  hsn_sac_code: z.string().default('998389'),
  is_gst_applicable: z.boolean().default(true),
  deliverables: z.array(z.string().max(200)).max(20).default([]),
  turnaround_days: z.number().int().min(1).max(365).default(30),
  line_items: z.array(lineItemSchema).max(20).default([]),
})

export const updatePackageSchema = createPackageSchema
  .partial()
  .refine((obj) => obj && Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const createAddonSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: amountSchema,
  unit: z.enum(['flat', 'per_hour', 'per_day']).default('flat'),
})

export const updateAddonSchema = createAddonSchema
  .partial()
  .refine((obj) => obj && Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export type CreatePackageInput = z.infer<typeof createPackageSchema>
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
export type CreateAddonInput = z.infer<typeof createAddonSchema>
export type UpdateAddonInput = z.infer<typeof updateAddonSchema>
