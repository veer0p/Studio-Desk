import { NextRequest } from 'next/server'
import { handleRouteError, resolveTokenParam, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { InvoiceService } from '@/lib/services/invoice.service'

export async function GET(req: NextRequest, context: any) {
  try {
    const token = await resolveTokenParam(context, req, 'invoice token')
    return withCache(Response.ok(await InvoiceService.viewInvoice(token)), 'private, max-age=60')
  } catch (err) {
    return handleRouteError(err, req)
  }
}
