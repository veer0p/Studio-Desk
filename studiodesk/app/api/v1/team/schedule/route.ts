import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AssignmentService } from '@/lib/services/assignment.service'
import { teamScheduleQuerySchema } from '@/lib/validations/assignment.schema'

function addDays(days: number) {
  const value = new Date()
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const params = Object.fromEntries(new URL(req.url).searchParams.entries())
    const parsed = teamScheduleQuerySchema.safeParse({
      from_date: params.from_date ?? new Date().toISOString().slice(0, 10),
      to_date: params.to_date ?? addDays(30),
      member_id: member.role === 'owner' ? params.member_id : member.member_id,
    })
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const schedule = await AssignmentService.getTeamSchedule(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.ok(schedule))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
