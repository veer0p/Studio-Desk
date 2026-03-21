import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { DashboardService } from '@/lib/services/dashboard.service'

export async function GET(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireAuth(req)
    return withCache(
      Response.ok(
        await DashboardService.getDashboardOverview(
          supabase,
          member.studio_id,
          user.user_metadata?.full_name ?? user.email ?? undefined
        )
      ),
      'private, max-age=120, stale-while-revalidate=60'
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
