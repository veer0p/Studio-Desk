import { z } from 'zod'
import { uuidSchema, dateSchema, paginationSchema } from './common.schema'

export const listProposalsSchema = paginationSchema.extend({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  booking_id: uuidSchema.optional(),
})

export const proposalLineItemSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  hsn_sac_code: z.string().max(20).optional().nullable(),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  item_type: z.string().min(1).max(50).default('service'),
  sort_order: z.number().int().nonnegative().optional(),
  addon_id: uuidSchema.optional().nullable(),
})

export const createProposalSchema = z.object({
  booking_id: uuidSchema,
  client_id: uuidSchema,
  gst_type: z.enum(['none', 'cgst_sgst', 'igst']),
  valid_until: dateSchema.optional(),
  notes: z.string().max(2000).optional().nullable(),
  line_items: z.array(proposalLineItemSchema).min(1, 'At least one line item is required'),
})

export const updateProposalSchema = createProposalSchema.partial().extend({
  // Line items are replaced entirely if provided, so we keep the array schema
  line_items: z.array(proposalLineItemSchema).min(1).optional(),
}).strict()

export const acceptProposalSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().max(500).optional(),
})

export type ListProposalsInput = z.infer<typeof listProposalsSchema>
export type CreateProposalInput = z.infer<typeof createProposalSchema>
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>
export type AcceptProposalInput = z.infer<typeof acceptProposalSchema>
export type ProposalLineItemInput = z.infer<typeof proposalLineItemSchema>
