import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalSession } from '@/lib/services/portal.service'
import { handleRouteError, resolveTokenParam, withNoStore } from '@/lib/api/route-helpers'

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await resolveTokenParam(context, req, 'portal token')
    const session = await getPortalSession(token)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('invoices')
      .select('id,booking_id,invoice_number,status,total_amount,amount_paid,due_date,access_token')
      .eq('booking_id', session.booking_id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
    if (error) throw error

    return withNoStore(
      Response.ok(
        (data ?? []).map((row) => ({
          id: row.id,
          booking_id: row.booking_id,
          invoice_number: row.invoice_number,
          status: row.status,
          total_amount: row.total_amount,
          amount_paid: row.amount_paid,
          due_date: row.due_date,
          view_url: `/api/v1/invoices/view/${row.access_token}`,
        }))
      )
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
