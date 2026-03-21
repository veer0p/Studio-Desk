import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, validationMessage, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AutomationService } from '@/lib/services/automation.service'
import { statsQuerySchema } from '@/lib/validations/automation.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const parsed = statsQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withCache(Response.ok(await AutomationService.getStats(supabase, member.studio_id, parsed.data.period)), 'private, max-age=300')
  } catch (err) {
    return handleRouteError(err, req)
  }
}
