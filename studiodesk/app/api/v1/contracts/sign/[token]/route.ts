import { NextRequest } from 'next/server'
import { handleRouteError, parseJson, resolveTokenParam, validationMessage } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'
import { signContractSchema } from '@/lib/validations/contract.schema'

type TokenContext = { params?: Promise<{ token: string }> | { token: string } }

function requestIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
}

export async function POST(req: NextRequest, context?: TokenContext) {
  try {
    const token = await resolveTokenParam(context, req, 'contract token')
    const parsed = signContractSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await ContractService.signContract(token, {
      signatureData: parsed.data.signature_data,
      ipAddress: requestIp(req),
      userAgent: req.headers.get('user-agent') ?? '',
    })
    return Response.ok({
      ...result,
      message: 'Contract signed successfully. You will receive a confirmation email.',
    })
  } catch (err) {
    return handleRouteError(err, req)
  }
}
