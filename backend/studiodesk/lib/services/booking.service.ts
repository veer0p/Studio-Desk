import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { bookingRepo, BookingInsert, BookingUpdate } from '@/lib/repositories/booking.repo'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { clientRepo } from '@/lib/repositories/client.repo'
import { packageRepo } from '@/lib/repositories/package.repo'
import { createBookingSchema, updateBookingSchema, updateStatusSchema } from '@/lib/validations/booking.schema'
import { calculateGst, detectGstType } from '@/lib/gst/calculator'

export class BookingService {
  static async listBookings(
    supabase: any,
    studioId: string,
    params: {
      status?: string
      event_type?: string
      search?: string
      from_date?: string
      to_date?: string
      page?: number
      pageSize?: number
    }
  ) {
    return bookingRepo.getBookings(supabase, studioId, {
      ...params,
      page: params.page || 0,
      pageSize: params.pageSize || 20
    })
  }

  static async getBooking(supabase: any, bookingId: string, studioId: string) {
    const booking = await bookingRepo.getBookingById(supabase, bookingId, studioId)
    if (!booking) throw Errors.notFound('Booking')
    return booking
  }

  static async createBooking(supabase: any, studioId: string, input: unknown, actor_id?: string) {
    const validated = createBookingSchema.parse(input)

    // Parallel fetch client and studio for GST detection
    const [client, studio] = await Promise.all([
      clientRepo.getClientById(supabase, validated.client_id, studioId),
      studioRepo.getProfileById(supabase, studioId)
    ])

    if (!client) throw Errors.notFound('Client')

    // Detect GST Type
    const gstType = detectGstType(studio.state || '', (client as any).state || null)
    const gst = calculateGst(validated.total_amount, gstType)

    let packageSnapshot = null
    if (validated.package_id) {
      const pkg = await packageRepo.getPackageById(supabase, validated.package_id, studioId)
      if (pkg) {
        packageSnapshot = {
          id: pkg.id,
          name: pkg.name,
          base_price: pkg.base_price,
          line_items: pkg.line_items
        }
      }
    }

    const bookingData = {
      ...validated,
      studio_id: studioId,
      status: 'new_lead' as string,
      gst_type: gstType,
      cgst_amount: gst.cgst,
      sgst_amount: gst.sgst,
      igst_amount: gst.igst,
      subtotal: validated.total_amount - gst.total,
      total_amount: validated.total_amount,
      advance_amount: validated.advance_amount ?? 0,
      amount_paid: 0,
      package_snapshot: packageSnapshot as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const booking = await bookingRepo.createBooking(supabase, bookingData)

    // Log activity
    bookingRepo.logActivity(supabase, {
      studio_id: studioId,
      booking_id: booking.id,
      event_type: 'booking_created',
      actor_id,
      actor_type: actor_id ? 'member' : 'system',
      metadata: { title: booking.title }
    })

    return booking
  }

  static async updateBooking(supabase: any, bookingId: string, studioId: string, input: unknown, actor_id?: string) {
    const current = await bookingRepo.getBookingById(supabase, bookingId, studioId)
    if (!current) throw Errors.notFound('Booking')

    const validated = updateBookingSchema.parse(input)

    // Business Rule: Cannot change total_amount if payments exist
    if (validated.total_amount !== undefined && validated.total_amount !== current.total_amount) {
      if ((current.amount_paid || 0) > 0) {
        throw Errors.conflict('Cannot change total amount as payments have already been recorded.')
      }
    }

    // Business Rule: Cannot change event_date if status is delivered
    if (validated.event_date && validated.event_date !== current.event_date) {
      if (current.status === 'delivered' || current.status === 'closed') {
        throw Errors.conflict('Cannot change event date after delivery.')
      }
    }

    // Recalculate GST if amount or client changes (client change omitted for simplicity in this MVP)
    let gstData = {}
    if (validated.total_amount !== undefined) {
      const gst = calculateGst(validated.total_amount, current.gst_type as any)
      gstData = {
        cgst_amount: gst.cgst,
        sgst_amount: gst.sgst,
        igst_amount: gst.igst,
        subtotal: validated.total_amount - gst.total
        // amount_pending is GENERATED - don't set it
      }
    }

    const updated = await bookingRepo.updateBooking(supabase, bookingId, studioId, {
      ...validated,
      ...gstData
    } as BookingUpdate)

    // Log activity if important fields changed
    if (validated.total_amount || validated.event_date) {
      bookingRepo.logActivity(supabase, {
        studio_id: studioId,
        booking_id: bookingId,
        event_type: 'booking_updated',
        actor_id,
        actor_type: actor_id ? 'member' : 'system',
        metadata: { changes: validated }
      })
    }

    return updated
  }

  static async deleteBooking(supabase: any, bookingId: string, studioId: string, actor_id?: string) {
    await bookingRepo.softDeleteBooking(supabase, bookingId, studioId)

    bookingRepo.logActivity(supabase, {
      studio_id: studioId,
      booking_id: bookingId,
      event_type: 'booking_deleted',
      actor_id,
      actor_type: actor_id ? 'member' : 'system'
    })
  }

  static async updateStatus(supabase: any, bookingId: string, studioId: string, status: string, actor_id?: string) {
    const current = await bookingRepo.getBookingById(supabase, bookingId, studioId)
    if (!current) throw Errors.notFound('Booking')

    // Simple transition check
    const allowedTransitions: Record<string, string[]> = {
      'new_lead': ['contacted', 'lost'],
      'contacted': ['proposal_sent', 'lost', 'booked'],
      'proposal_sent': ['booked', 'lost'],
      'booked': ['partially_paid', 'paid', 'shoot_completed', 'lost'],
      'partially_paid': ['paid', 'shoot_completed'],
      'paid': ['shoot_completed'],
      'shoot_completed': ['delivered'],
      'delivered': ['closed'],
      'closed': [],
      'lost': ['contacted']
    }

    if (allowedTransitions[current.status] && !allowedTransitions[current.status].includes(status)) {
      throw Errors.conflict(`Invalid status transition from ${current.status} to ${status}`)
    }

    const updated = await bookingRepo.updateBookingStatus(supabase, bookingId, studioId, status)

    bookingRepo.logActivity(supabase, {
      studio_id: studioId,
      booking_id: bookingId,
      event_type: 'status_changed',
      actor_id,
      actor_type: actor_id ? 'member' : 'system',
      metadata: { from: current.status, to: status }
    })

    return updated
  }

  static async getActivityFeed(supabase: any, bookingId: string, studioId: string) {
    return bookingRepo.getActivityFeed(supabase, bookingId, studioId)
  }
}
