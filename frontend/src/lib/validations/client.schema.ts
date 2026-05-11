import { z } from 'zod';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode');
// Format-only check; backend performs checksum validation
const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Enter a valid 15-character GSTIN (e.g. 24AAACA0000A1Z5)',
  );

export const createClientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  phone: phoneSchema,
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  whatsapp: phoneSchema.optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: pincodeSchema.optional().or(z.literal('')),
  company_name: z.string().max(200).optional(),
  gstin: gstinSchema.optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateClientSchema = createClientSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
