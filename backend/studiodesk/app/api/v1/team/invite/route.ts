import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { TeamService } from '@/lib/services/team.service'
import { inviteMemberSchema } from '@/lib/validations/team.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireOwner(req)
    const body = await req.json()
    const parsed = inviteMemberSchema.safeParse(body)
    if (!parsed.success) {
      return Response.error(
        parsed.error.issues[0]?.message ?? 'Validation failed',
        'VALIDATION_ERROR',
        400
      )
    }
    const { email, role } = parsed.data
    if ((role as string) === 'owner') {
      return Response.error('Cannot invite with owner role', 'VALIDATION_ERROR', 400)
    }
    const result = await TeamService.inviteMember(supabase, {
      studioId: member.studio_id,
      email,
      role,
      invitedBy: user.id,
      invitedByMemberId: member.member_id,
    })
    const res = Response.created(result)
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
