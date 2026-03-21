import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { InvoiceService } from '@/lib/services/invoice.service'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    return withNoStore(Response.ok(await InvoiceService.getOutstandingInvoices(supabase, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
