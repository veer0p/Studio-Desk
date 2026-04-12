import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { NotificationService } from '@/lib/services/notification.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)

    const count = await NotificationService.markAllAsRead(supabase, member.studio_id)
    return Response.ok({ marked: count })
  } catch (err: unknown) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
