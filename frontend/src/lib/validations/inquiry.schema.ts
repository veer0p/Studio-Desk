import { z } from 'zod';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');
const amountSchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter a valid amount');

const eventTypeEnum = z.enum([
  'wedding', 'pre_wedding', 'engagement', 'portrait', 'birthday',
  'corporate', 'product', 'maternity', 'newborn', 'other',
]);

export const inquiryFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  phone: phoneSchema,
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  event_type: eventTypeEnum.optional(),
  event_date: dateSchema.optional().or(z.literal('')),
  venue: z.string().max(200).optional(),
  budget_min: amountSchema.optional().or(z.literal('')),
  budget_max: amountSchema.optional().or(z.literal('')),
  message: z.string().max(1000, 'Message must be under 1000 characters').optional(),
  guest_count: z.coerce.number().int().min(1).max(10000).optional().or(z.literal('')),
});

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;
