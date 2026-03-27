import * as z from "zod"

export const newClientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().optional(),
  source: z.string().optional(),
  referredBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
})

export type NewClientData = z.infer<typeof newClientSchema>

export const editClientSchema = newClientSchema.extend({
  dateOfBirth: z.string().optional(),
  anniversary: z.string().optional()
})

export type EditClientData = z.infer<typeof editClientSchema>
