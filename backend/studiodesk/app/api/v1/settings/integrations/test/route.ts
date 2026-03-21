import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { SettingsService } from '@/lib/services/settings.service'
import { testIntegrationSchema } from '@/lib/validations/settings.schema'

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const body = await parseJson(req)
    const parsed = testIntegrationSchema.safeParse(body)
    
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const result = await SettingsService.testIntegration(
      supabase,
      member.studio_id,
      parsed.data.service,
      parsed.data.test_phone
    )
    
    return withNoStore(Response.ok(result))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
