import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { SettingsService } from '@/lib/services/settings.service'
import { updateIntegrationsSchema } from '@/lib/validations/settings.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const status = await SettingsService.getIntegrationStatus(supabase, member.studio_id)
    return withNoStore(Response.ok(status))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const body = await parseJson(req)
    const parsed = updateIntegrationsSchema.safeParse(body)
    
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const status = await SettingsService.updateIntegrations(
      supabase,
      member.studio_id,
      parsed.data
    )
    
    return withNoStore(Response.ok(status))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
