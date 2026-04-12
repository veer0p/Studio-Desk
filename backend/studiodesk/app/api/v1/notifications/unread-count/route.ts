import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { NotificationService } from '@/lib/services/notification.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications for current user.
 */
export async function GET(req: NextRequest) {
  try {
    const { user_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    const count = await NotificationService.getUnreadCount(adminClient, user_id)

    return ApiResponse.ok({ count })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for current user.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    await NotificationService.markAllAsRead(adminClient, user_id)

    return ApiResponse.ok({ marked_read: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
