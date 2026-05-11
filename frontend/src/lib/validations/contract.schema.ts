import { z } from 'zod';

export const createContractSchema = z.object({
  booking_id: z.string().uuid('Enter a valid booking UUID'),
  template_id: z.string().uuid('Enter a valid template UUID').optional().or(z.literal('')),
  custom_content: z.string().max(100000).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateContractSchema = z
  .object({
    content_html: z.string().min(10).max(100000).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((obj) => Object.keys(obj).filter((k) => obj[k as keyof typeof obj] !== undefined).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
