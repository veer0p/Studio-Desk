import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { BookingService } from '@/lib/services/booking.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    
    const params = {
      status: searchParams.get('status') || undefined,
      event_type: searchParams.get('event_type') || undefined,
      search: searchParams.get('search') || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      page: parseInt(searchParams.get('page') || '0'),
      pageSize: parseInt(searchParams.get('pageSize') || '20')
    }

    const bookings = await BookingService.listBookings(supabase, member.studio_id, params)
    return Response.ok(bookings)
  } catch (err: unknown) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireAuth(req)
    const body = await req.json()
    const booking = await BookingService.createBooking(supabase, member.studio_id, body, user.id)
    return Response.created(booking)
  } catch (err: unknown) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return Response.error((err as any).errors[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
