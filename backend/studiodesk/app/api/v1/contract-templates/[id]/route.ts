import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'
import { updateTemplateSchema } from '@/lib/validations/contract.schema'

type IdContext = { params?: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'template id')
    const parsed = updateTemplateSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const template = await ContractService.updateTemplate(supabase, id, member.studio_id, parsed.data)
    return withNoStore(Response.ok(template))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function DELETE(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'template id')
    await ContractService.deleteTemplate(supabase, id, member.studio_id)
    return Response.noContent()
  } catch (err) {
    return handleRouteError(err, req)
  }
}
