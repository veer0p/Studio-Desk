import { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/audit-logs/export
 * Export audit logs as CSV. Super admin only.
 */
export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req)

    const adminClient = createAdminClient()

    // Fetch all audit logs (no pagination for export)
    const { data, error } = await adminClient
      .from('admin_audit_logs')
      .select('*, platform_admins(name, email, role)')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) throw new Error('Failed to fetch audit logs')

    // Convert to CSV
    const headers = [
      'ID',
      'Admin Name',
      'Admin Email',
      'Admin Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Old Value',
      'New Value',
      'IP Address',
      'User Agent',
      'Created At',
    ]

    const rows = (data || []).map((log: any) => [
      log.id,
      log.platform_admins?.name || '',
      log.platform_admins?.email || '',
      log.platform_admins?.role || '',
      log.action,
      log.entity_type || '',
      log.entity_id || '',
      log.old_value ? JSON.stringify(log.old_value) : '',
      log.new_value ? JSON.stringify(log.new_value) : '',
      log.ip_address || '',
      log.user_agent || '',
      log.created_at,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (err.message === 'Super admin access required') {
      return new Response(JSON.stringify({ error: 'Super admin access required', code: 'FORBIDDEN' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    await logError({ message: String(err), requestUrl: req.url })
    return new Response(JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
