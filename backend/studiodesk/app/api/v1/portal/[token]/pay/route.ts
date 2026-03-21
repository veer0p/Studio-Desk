import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalSession } from '@/lib/services/portal.service'
import { handleRouteError, parseJson, resolveTokenParam, withNoStore } from '@/lib/api/route-helpers'
import { InvoiceService } from '@/lib/services/invoice.service'

export async function POST(req: NextRequest, context: any) {
  try {
    const token = await resolveTokenParam(context, req, 'portal token')
    const session = await getPortalSession(token)
    const body = await parseJson(req)
    const invoiceId = (body as any)?.invoice_id
    if (!invoiceId || typeof invoiceId !== 'string') {
      return Response.error('invoice_id is required', 'VALIDATION_ERROR', 400)
    }

    const admin = createAdminClient()
    const { data: invoice, error } = await admin
      .from('invoices')
      .select('id,booking_id,status,amount_paid,total_amount,studio_id,payment_link_url,payment_link_expires_at')
      .eq('id', invoiceId)
      .maybeSingle()
    if (error) throw error
    if (!invoice) return Response.error('Invoice not found', 'FORBIDDEN', 403)
    if (invoice.booking_id !== session.booking_id) return Response.error('Invoice not in portal booking', 'FORBIDDEN', 403)
    if (invoice.status === 'paid') return Response.error('Invoice already paid', 'CONFLICT', 409)

    const stillValidLink =
      !!invoice.payment_link_url &&
      !!invoice.payment_link_expires_at &&
      new Date(invoice.payment_link_expires_at).getTime() > Date.now()
    if (stillValidLink) return withNoStore(Response.ok({ payment_link_url: invoice.payment_link_url }))

    const generated = await InvoiceService.generatePaymentLink(admin as any, invoice.id, invoice.studio_id)
    return withNoStore(Response.ok(generated))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
