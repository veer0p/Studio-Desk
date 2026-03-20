import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AutomationService } from '@/lib/services/automation.service'
import { updateSettingsSchema } from '@/lib/validations/automation.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    return withNoStore(Response.ok(await AutomationService.getSettings(supabase, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const parsed = updateSettingsSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withNoStore(Response.ok(await AutomationService.updateSettings(supabase, member.studio_id, parsed.data.settings)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
