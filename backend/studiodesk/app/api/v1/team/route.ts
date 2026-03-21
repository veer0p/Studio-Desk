import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { TeamService } from '@/lib/services/team.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const members = await TeamService.getMembers(supabase, member.studio_id)
    const res = Response.ok(members)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err?.status && err?.code) {
      return Response.error(err.message ?? 'Error', err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
