import { z } from 'zod'
import { phoneSchema, pincodeSchema, gstinSchema } from './common.schema'

export const createClientSchema = z.object({
  full_name: z.string().min(2).max(200),
  phone: phoneSchema,
  email: z.string().email().optional(),
  whatsapp: phoneSchema.optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  state_id: z.number().int().optional(),
  pincode: pincodeSchema.optional(),
  company_name: z.string().max(200).optional(),
  gstin: gstinSchema.optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export const updateClientSchema = createClientSchema
  .partial()
  .refine((obj) => obj && Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const clientsQuerySchema = z.object({
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientsQueryInput = z.infer<typeof clientsQuerySchema>
