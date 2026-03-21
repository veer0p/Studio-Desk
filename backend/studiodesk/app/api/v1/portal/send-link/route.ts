import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { handleRouteError, parseJson, withNoStore } from '@/lib/api/route-helpers'
import { upsertPortalSession } from '@/lib/services/portal.service'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { member } = await requireOwner(req)
    const body = await parseJson(req)
    const bookingId = (body as any)?.booking_id
    if (!bookingId || typeof bookingId !== 'string') {
      return Response.error('booking_id is required', 'VALIDATION_ERROR', 400)
    }

    const admin = createAdminClient()
    const { data: booking, error } = await admin
      .from('bookings')
      .select('id, studio_id, client_id')
      .eq('id', bookingId)
      .eq('studio_id', member.studio_id)
      .maybeSingle()
    if (error) throw error
    if (!booking) return Response.error('Booking not found', 'NOT_FOUND', 404)

    const session = await upsertPortalSession(member.studio_id, booking.client_id, booking.id)
    const url = `${new URL(req.url).origin}/portal/${session.token}`
    return withNoStore(
      Response.ok({
        token: session.token,
        portal_url: url,
        expires_at: session.expires_at,
        reused: session.reused,
      })
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
