import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { BookingService } from '@/lib/services/booking.service'
import { ServiceError } from '@/lib/errors'
import { updateStatusSchema } from '@/lib/validations/booking.schema'
import { logError } from '@/lib/logger'

export async function PATCH(req: NextRequest, props: { params: Promise<{  id: string  }> }) {
  const params = await props.params;
  try {
    const { user, member, supabase } = await requireAuth(req)
    const body = await req.json()

    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return Response.error(parsed.error.issues[0]?.message || 'Invalid status', 'VALIDATION_ERROR', 400)
    }

    const updated = await BookingService.updateStatus(supabase, (await props.params).id, member.studio_id, parsed.data.status, user.id)
    return Response.ok(updated)
  } catch (err: unknown) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
