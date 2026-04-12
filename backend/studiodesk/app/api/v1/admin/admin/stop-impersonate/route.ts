import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/admin/admin/stop-impersonate
 * End active studio impersonation session.
 */
export async function POST(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)
    const adminClient = createAdminClient()

    // Find the most recent active impersonation for this admin
    const { data: impersonation } = await adminClient
      .from('studio_impersonation_log')
      .select('id, studio_id, studios(name, slug)')
      .eq('admin_id', admin.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!impersonation) {
      return ApiResponse.error('No active impersonation session', 'NOT_FOUND', 404)
    }

    // End the impersonation
    await adminClient
      .from('studio_impersonation_log')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('id', impersonation.id)

    // Log audit event
    await adminClient.from('admin_audit_logs').insert({
      admin_id: admin.id,
      action: 'stop_impersonate',
      entity_type: 'studio',
      entity_id: impersonation.studio_id,
    })

    return ApiResponse.ok({
      message: `Stopped impersonating ${(impersonation as any).studios?.name || 'studio'}`,
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
