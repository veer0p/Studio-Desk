import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { DashboardService } from '@/lib/services/dashboard.service'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    return withNoStore(
      Response.ok(await DashboardService.getTodayDetail(supabase, member.studio_id, member.member_id, member.role))
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
