import { NextRequest } from 'next/server'
import { handleRouteError, resolveTokenParam, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'

type TokenContext = { params?: Promise<{ token: string }> | { token: string } }

export async function GET(req: NextRequest, context?: TokenContext) {
  try {
    const token = await resolveTokenParam(context, req, 'contract token')
    const contract = await ContractService.viewContract(token)
    return withCache(Response.ok(contract), 'private, max-age=60')
  } catch (err) {
    return handleRouteError(err, req)
  }
}
