import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AutomationService } from '@/lib/services/automation.service'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    return withNoStore(Response.ok(await AutomationService.getTemplates(supabase, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
