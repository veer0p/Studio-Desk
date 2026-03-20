import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Response } from '@/lib/response'
import { DashboardService } from '@/lib/services/dashboard.service'

export async function POST(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') ?? ''
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.error('Unauthorized', 'UNAUTHORIZED', 401)
  }

  return Response.ok(await DashboardService.runDailySnapshot(createAdminClient()))
}
