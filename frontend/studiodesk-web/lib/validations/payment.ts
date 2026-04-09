import * as z from "zod"

export const paymentSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  method: z.enum([
    "upi", "card", "net_banking", "wallet",
    "cash", "neft", "rtgs", "cheque", "other"
  ], { message: "Payment method is required" }),
  reference: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Payment date is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export const createPaymentSchema = paymentSchema
export const updatePaymentSchema = paymentSchema.partial()

export type CreatePaymentData = z.infer<typeof createPaymentSchema>
export type UpdatePaymentData = z.infer<typeof updatePaymentSchema>
