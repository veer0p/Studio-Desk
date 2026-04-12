import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { NotificationService } from '@/lib/services/notification.service'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/notifications
 * List notifications for current user with pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const { user_id } = await requireAuth(req)
    const url = new URL(req.url)

    const page = parseInt(url.searchParams.get('page') || '0')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
    const isReadParam = url.searchParams.get('is_read')

    const isRead = isReadParam === null ? undefined : isReadParam === 'true'
    const adminClient = createAdminClient()

    const result = await NotificationService.getUserNotifications(adminClient, user_id, page, Math.min(pageSize, 50), isRead)

    return ApiResponse.paginated(
      result.notifications,
      result.count,
      result.page,
      result.pageSize
    )
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
