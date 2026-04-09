import * as z from "zod"

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  gst_rate: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().min(1).default(1),
})

export const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  booking_id: z.string().optional().or(z.literal("")),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  type: z.enum(["advance", "balance", "full", "credit_note"], { message: "Invoice type is required" }),
  line_items: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
  gst_type: z.enum(["cgst_sgst", "igst", "exempt"]).optional(),
})

export const createInvoiceSchema = invoiceSchema
export const updateInvoiceSchema = invoiceSchema.partial()

export type CreateInvoiceData = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>
export type InvoiceLineItem = z.infer<typeof lineItemSchema>
