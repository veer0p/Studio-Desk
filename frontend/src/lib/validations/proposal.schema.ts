import { z } from 'zod';

export const proposalLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Item name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  hsn_sac_code: z.string().max(20).optional().nullable(),
  quantity: z.coerce.number({ invalid_type_error: 'Enter a number' }).positive('Must be > 0'),
  unit_price: z.coerce.number({ invalid_type_error: 'Enter a number' }).nonnegative('Must be ≥ 0'),
  item_type: z.string().min(1).max(50).default('service'),
  sort_order: z.number().int().nonnegative().optional(),
  addon_id: z.string().uuid().optional().nullable(),
});

export const createProposalSchema = z.object({
  booking_id: z.string().uuid('Enter a valid booking UUID'),
  client_id: z.string().uuid('Enter a valid client UUID'),
  gst_type: z.enum(['none', 'cgst_sgst', 'igst']),
  valid_until: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
  line_items: z.array(proposalLineItemSchema).min(1, 'Add at least one line item'),
});

export const updateProposalSchema = createProposalSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'At least one field must be provided' },
);

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type ProposalLineItemInput = z.infer<typeof proposalLineItemSchema>;
