import { z } from 'zod';

/**
 * Line item validation
 */
export const lineItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  hsn_sac_code: z.string().min(1, 'HSN/SAC code is required'),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  gst_rate: z.number().default(18),
});

/**
 * Create Invoice Schema
 */
export const createInvoiceSchema = z.object({
  booking_id: z.string().uuid(),
  invoice_type: z.enum(['advance', 'balance', 'full', 'credit_note']),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  due_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

/**
 * Update Invoice Schema (Draft only)
 */
export const updateInvoiceSchema = z.object({
  line_items: z.array(lineItemSchema).optional(),
  due_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

/**
 * Record Manual Payment Schema
 */
export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['cash', 'neft', 'cheque', 'upi', 'other']),
  reference_number: z.string().optional(),
  payment_date: z.string().datetime(),
  notes: z.string().optional(),
});

/**
 * Initiate Refund Schema
 */
export const initiateRefundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1, 'Reason for refund is required'),
});

/**
 * Razorpay Webhook Schema (Essential fields)
 */
export const razorpayWebhookSchema = z.object({
  entity: z.literal('event'),
  account_id: z.string(),
  event: z.string(),
  contains: z.array(z.string()),
  payload: z.record(z.any()),
  created_at: z.number(),
});

// Types inferred from schemas
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type InitiateRefundInput = z.infer<typeof initiateRefundSchema>;
export type RazorpayWebhookPayload = z.infer<typeof razorpayWebhookSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
