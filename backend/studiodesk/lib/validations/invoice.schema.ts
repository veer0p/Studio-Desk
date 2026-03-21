import { z } from 'zod'
import { amountSchema, dateSchema, uuidSchema } from '@/lib/validations/common.schema'

const gstTypeSchema = z.enum(['cgst_sgst', 'igst', 'exempt'])
const invoiceTypeSchema = z.enum(['advance', 'balance', 'full', 'credit_note'])
const invoiceStatusSchema = z.enum(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'])
const paymentMethodSchema = z.enum([
  'cash',
  'neft',
  'rtgs',
  'cheque',
  'upi',
  'card',
  'net_banking',
  'other',
])

export const invoiceTokenSchema = z.string().regex(/^[0-9a-f]{64}$/i, 'Invalid invoice token')

export const invoiceLineItemSchema = z.object({
  sort_order: z.number().int().min(0).default(0),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  hsn_sac_code: z.string().max(8).default('998389'),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/).default('1'),
  unit_price: amountSchema,
})

export const createInvoiceSchema = z.object({
  booking_id: uuidSchema,
  client_id: uuidSchema.optional(),
  invoice_type: invoiceTypeSchema.exclude(['credit_note']),
  gst_type: gstTypeSchema.optional(),
  hsn_sac_code: z.string().max(8).default('998389'),
  due_date: dateSchema.optional(),
  notes: z.string().max(2000).optional(),
  internal_notes: z.string().max(2000).optional(),
  line_items: z.array(invoiceLineItemSchema).min(1).max(20),
  credit_note_for: uuidSchema.optional(),
})

export const updateInvoiceSchema = z
  .object({
    notes: z.string().max(2000).optional(),
    internal_notes: z.string().max(2000).optional(),
    due_date: dateSchema.optional().nullable(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export const recordPaymentSchema = z.object({
  amount: amountSchema,
  method: paymentMethodSchema,
  reference_number: z.string().max(100).optional(),
  payment_date: dateSchema.optional(),
  bank_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const creditNoteSchema = z.object({
  amount: amountSchema,
  reason: z.string().min(10).max(500),
})

export const invoicesQuerySchema = z.object({
  status: invoiceStatusSchema.optional(),
  invoice_type: invoiceTypeSchema.optional(),
  booking_id: uuidSchema.optional(),
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const paymentsQuerySchema = z.object({
  invoice_id: uuidSchema.optional(),
  booking_id: uuidSchema.optional(),
  status: z.enum(['pending', 'processing', 'captured', 'failed', 'refunded']).optional(),
  method: z
    .enum(['cash', 'neft', 'rtgs', 'cheque', 'upi', 'card', 'net_banking', 'wallet', 'other'])
    .optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const financeSummaryQuerySchema = z.object({
  period: z.enum(['this_month', 'last_month', 'this_quarter', 'this_fy']).default('this_month'),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type CreditNoteInput = z.infer<typeof creditNoteSchema>
export type InvoicesQueryInput = z.infer<typeof invoicesQuerySchema>
export type PaymentsQueryInput = z.infer<typeof paymentsQuerySchema>
export type FinanceSummaryQueryInput = z.infer<typeof financeSummaryQuerySchema>
