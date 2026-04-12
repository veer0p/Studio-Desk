import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { auditLogQuerySchema } from '@/lib/validations/admin.schema'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/audit-logs
 * Paginated audit log viewer with filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)

    const url = new URL(req.url)
    const parsed = auditLogQuerySchema.safeParse({
      admin_id: url.searchParams.get('admin_id') || undefined,
      entity_type: url.searchParams.get('entity_type') || undefined,
      action: url.searchParams.get('action') || undefined,
      page: url.searchParams.get('page') || '0',
      pageSize: url.searchParams.get('pageSize') || '20',
    })

    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    let query = adminClient.from('admin_audit_logs').select('*', { count: 'exact' })

    if (parsed.data.admin_id) query = query.eq('admin_id', parsed.data.admin_id)
    if (parsed.data.entity_type) query = query.eq('entity_type', parsed.data.entity_type)
    if (parsed.data.action) query = query.eq('action', parsed.data.action)

    const offset = parsed.data.page * parsed.data.pageSize
    const { data, count, error } = await query
      .select('*, platform_admins(name, email)')
      .order('created_at', { ascending: false })
      .range(offset, offset + parsed.data.pageSize - 1)

    if (error) throw new Error('Failed to fetch audit logs')

    return ApiResponse.paginated(data || [], count || 0, parsed.data.page, parsed.data.pageSize)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (err.message === 'Access denied') {
      return ApiResponse.error('Access denied', 'FORBIDDEN', 403)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
