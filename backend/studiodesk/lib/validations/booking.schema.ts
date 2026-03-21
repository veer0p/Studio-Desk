import { z } from 'zod'

const eventTypes = ['wedding', 'pre_wedding', 'engagement', 'maternity', 'newborn', 'fashion', 'corporate', 'other'] as const
const bookingStatuses = ['new_lead', 'contacted', 'proposal_sent', 'booked', 'partially_paid', 'paid', 'shoot_completed', 'delivered', 'closed', 'lost'] as const

export const createBookingSchema = z.object({
  title: z.string().min(3).max(100),
  client_id: z.string().uuid(),
  lead_id: z.string().uuid().optional().nullable(),
  event_type: z.enum(eventTypes),
  event_date: z.string().datetime().nullable().optional(),
  event_end_date: z.string().datetime().nullable().optional(),
  package_id: z.string().uuid().optional().nullable(),
  venue_name: z.string().max(100).optional().nullable(),
  venue_address: z.string().max(500).optional().nullable(),
  venue_state: z.string().max(50).optional().nullable(),
  venue_city: z.string().max(50).optional().nullable(),
  venue_pincode: z.string().max(10).optional().nullable(),
  total_amount: z.number().min(0).default(0),
  advance_amount: z.number().min(0).default(0),
  notes: z.string().max(2000).optional().nullable()
})

export const updateBookingSchema = createBookingSchema.partial()

export const updateStatusSchema = z.object({
  status: z.enum(bookingStatuses)
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
