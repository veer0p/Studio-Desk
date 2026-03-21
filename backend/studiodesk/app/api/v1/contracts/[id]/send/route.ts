import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, resolveUuidParam, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'

type IdContext = { params?: Promise<{ id: string }> }

export async function POST(req: NextRequest, context?: IdContext) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'contract id')
    const contract = await ContractService.sendContract(supabase, id, member.studio_id, user.id)
    return withNoStore(Response.ok(contract))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
