import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { InvoiceService } from '@/lib/services/invoice.service'
import { createInvoiceSchema, invoicesQuerySchema } from '@/lib/validations/invoice.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const parsed = invoicesQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await InvoiceService.getInvoices(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.paginated(result.data, result.count, parsed.data.page, parsed.data.pageSize))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const parsed = createInvoiceSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const invoice = await InvoiceService.createInvoice(supabase, member.studio_id, parsed.data, user.id)
    return withNoStore(Response.created(invoice))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
