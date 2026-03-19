import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'
import { updateContractSchema } from '@/lib/validations/contract.schema'

type IdContext = { params?: Promise<{ id: string }> | { id: string } }

export async function GET(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'contract id')
    const contract = await ContractService.getContractById(supabase, id, member.studio_id)
    return withNoStore(Response.ok(contract))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'contract id')
    const parsed = updateContractSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const contract = await ContractService.updateContract(supabase, id, member.studio_id, parsed.data, user.id)
    return withNoStore(Response.ok(contract))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function DELETE(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'contract id')
    await ContractService.deleteContract(supabase, id, member.studio_id)
    return Response.noContent()
  } catch (err) {
    return handleRouteError(err, req)
  }
}
