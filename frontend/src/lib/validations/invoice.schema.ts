import { z } from 'zod';

// Backend amountSchema = string matching /^\d{1,10}(\.\d{1,2})?$/
const amountStr = z
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 5000 or 5000.00)');

export const INVOICE_TYPES = ['advance', 'balance', 'full'] as const;
export const INVOICE_TYPE_ALL = ['advance', 'balance', 'full', 'credit_note'] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'] as const;
export const GST_TYPES = ['cgst_sgst', 'igst', 'exempt'] as const;
export const PAYMENT_METHODS = ['cash', 'upi', 'neft', 'rtgs', 'cheque', 'card', 'net_banking', 'other'] as const;

export const invoiceLineItemSchema = z.object({
  sort_order: z.number().int().min(0).default(0),
  name: z.string().min(1, 'Item name is required').max(200),
  description: z.string().max(500).optional(),
  hsn_sac_code: z.string().max(8).default('998389'),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid quantity').default('1'),
  unit_price: amountStr,
});

export const createInvoiceSchema = z.object({
  booking_id: z.string().uuid('Must be a valid booking UUID'),
  invoice_type: z.enum(INVOICE_TYPES, { required_error: 'Invoice type is required' }),
  gst_type: z.enum(GST_TYPES).optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)')
    .optional(),
  notes: z.string().max(2000).optional(),
  internal_notes: z.string().max(2000).optional(),
  line_items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required').max(20),
});

export const updateInvoiceSchema = z
  .object({
    notes: z.string().max(2000).optional(),
    internal_notes: z.string().max(2000).optional(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be provided' });

export const recordPaymentSchema = z.object({
  amount: amountStr,
  method: z.enum(PAYMENT_METHODS),
  reference_number: z.string().max(100).optional(),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
    .optional(),
  bank_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const creditNoteSchema = z.object({
  amount: amountStr,
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreditNoteInput = z.infer<typeof creditNoteSchema>;
