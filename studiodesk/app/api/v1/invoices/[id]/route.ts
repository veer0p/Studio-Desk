import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { InvoiceService } from '@/lib/services/invoice.service'
import { updateInvoiceSchema } from '@/lib/validations/invoice.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'invoice id')
    return withNoStore(Response.ok(await InvoiceService.getInvoiceById(supabase, id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'invoice id')
    const body = await parseJson(req)
    const invalidFields = Object.keys(body).filter((key) => !['notes', 'internal_notes', 'due_date'].includes(key))
    if (invalidFields.length) return Response.error('Only notes, internal_notes, and due_date can be updated', 'VALIDATION_ERROR', 400)
    const parsed = updateInvoiceSchema.safeParse(body)
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const updated = await InvoiceService.updateInvoice(supabase, id, member.studio_id, parsed.data, user.id)
    return withNoStore(Response.ok(updated))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
