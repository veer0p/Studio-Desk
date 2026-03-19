import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, resolveUuidParam, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { InvoiceService } from '@/lib/services/invoice.service'

export async function POST(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'invoice id')
    return withNoStore(Response.ok(await InvoiceService.sendInvoice(supabase, id, member.studio_id, user.id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
