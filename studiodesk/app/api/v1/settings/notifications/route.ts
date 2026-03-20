import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { SettingsService } from '@/lib/services/settings.service'
import { updateNotificationSchema } from '@/lib/validations/settings.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const settings = await SettingsService.getNotificationSettings(supabase, member.studio_id)
    return withNoStore(Response.ok(settings))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const body = await parseJson(req)
    const parsed = updateNotificationSchema.safeParse(body)
    
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const updated = await SettingsService.updateNotificationSettings(
      supabase,
      member.studio_id,
      parsed.data
    )
    
    return withNoStore(Response.ok(updated))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
