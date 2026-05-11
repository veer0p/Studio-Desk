import { z } from 'zod';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');
const amountSchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 50000)');

const eventTypeEnum = z.enum([
  'wedding', 'pre_wedding', 'engagement', 'portrait', 'birthday',
  'corporate', 'product', 'maternity', 'newborn', 'other',
]);
const sourceEnum = z.enum([
  'inquiry_form', 'referral', 'instagram', 'facebook',
  'google', 'walk_in', 'phone', 'other',
]);
const statusEnum = z.enum([
  'new_lead', 'contacted', 'proposal_sent', 'contract_signed',
  'advance_paid', 'shoot_scheduled', 'delivered', 'closed', 'lost',
]);
const priorityEnum = z.enum(['high', 'medium', 'low']);

export const createLeadSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  phone: phoneSchema,
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  whatsapp: phoneSchema.optional().or(z.literal('')),
  client_id: uuidSchema.optional(),
  event_type: eventTypeEnum.optional(),
  event_date_approx: dateSchema.optional().or(z.literal('')),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional().or(z.literal('')),
  budget_max: amountSchema.optional().or(z.literal('')),
  source: sourceEnum.default('phone'),
  priority: priorityEnum.default('medium'),
  notes: z.string().max(1000).optional(),
  assigned_to: uuidSchema.optional(),
});

export const updateLeadSchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  event_date_approx: dateSchema.optional().or(z.literal('')),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional().or(z.literal('')),
  budget_max: amountSchema.optional().or(z.literal('')),
  follow_up_at: z.string().datetime({ offset: true }).optional(),
  notes: z.string().max(1000).optional(),
  assigned_to: uuidSchema.optional().nullable(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});

export const convertLeadSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  event_date: dateSchema,
  total_amount: amountSchema.optional().or(z.literal('')),
  advance_amount: amountSchema.optional().or(z.literal('')),
  package_id: uuidSchema.optional(),
  gst_type: z.enum(['cgst_sgst', 'igst', 'exempt']).default('cgst_sgst'),
});

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
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type LeadsQueryInput = z.infer<typeof leadsQuerySchema>;
