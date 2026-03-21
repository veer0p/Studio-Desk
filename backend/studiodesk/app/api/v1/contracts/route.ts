import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'
import { contractsQuerySchema, createContractSchema } from '@/lib/validations/contract.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const query = Object.fromEntries(new URL(req.url).searchParams.entries())
    const parsed = contractsQuerySchema.safeParse(query)
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await ContractService.getContracts(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.paginated(result.data, result.count, parsed.data.page, parsed.data.pageSize))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const parsed = createContractSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const contract = await ContractService.createContract(supabase, member.studio_id, parsed.data, user.id)
    return withNoStore(Response.created(contract))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
