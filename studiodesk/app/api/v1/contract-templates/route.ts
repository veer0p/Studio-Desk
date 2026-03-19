import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ContractService } from '@/lib/services/contract.service'
import { createTemplateSchema } from '@/lib/validations/contract.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const templates = await ContractService.getTemplates(supabase, member.studio_id)
    return withNoStore(Response.ok(templates))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const parsed = createTemplateSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const template = await ContractService.createTemplate(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.created(template))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
