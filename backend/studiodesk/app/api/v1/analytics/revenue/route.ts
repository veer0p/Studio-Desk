import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, validationMessage, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { DashboardService, revenueQuerySchema } from '@/lib/services/dashboard.service'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const parsed = revenueQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    return withCache(
      Response.ok(await DashboardService.getRevenueAnalytics(supabase, member.studio_id, parsed.data)),
      'private, max-age=600'
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
