import * as z from "zod"

export const bookingSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  title: z.string().min(2, "Booking title is required").max(120),
  event_type: z.enum([
    "wedding", "pre_wedding", "engagement", "portrait", "birthday",
    "corporate", "product", "maternity", "newborn", "other"
  ], { message: "Event type is required" }),
  event_date: z.string().min(1, "Event date is required"),
  call_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format").optional().or(z.literal("")),
  venue_name: z.string().optional().or(z.literal("")),
  venue_city: z.string().optional().or(z.literal("")),
  venue_address: z.string().optional().or(z.literal("")),
  package_id: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  status: z.enum([
    "new_lead", "contacted", "proposal_sent", "contract_signed",
    "advance_paid", "shoot_scheduled", "delivered", "closed", "lost"
  ]).optional(),
  total_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount").optional().or(z.literal("")),
})

export const createBookingSchema = bookingSchema.refine(
  (data) => data.event_date && data.title && data.client_id,
  { message: "Title, client, and event date are required" }
)

export const updateBookingSchema = bookingSchema.partial()

export type CreateBookingData = z.infer<typeof createBookingSchema>
export type UpdateBookingData = z.infer<typeof updateBookingSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
