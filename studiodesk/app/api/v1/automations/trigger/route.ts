import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AutomationService } from '@/lib/services/automation.service'
import { triggerManualSchema } from '@/lib/validations/automation.schema'

export async function POST(req: NextRequest) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const parsed = triggerManualSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await AutomationService.triggerManual(supabase, member.studio_id, parsed.data, user.id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
