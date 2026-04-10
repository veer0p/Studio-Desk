import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { BookingService } from '@/lib/services/booking.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params;
  try {
    const { member, supabase } = await requireAuth(req)
    const feed = await BookingService.getActivityFeed(supabase, params.id, member.studio_id)
    return Response.ok(feed)
  } catch (err: unknown) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
