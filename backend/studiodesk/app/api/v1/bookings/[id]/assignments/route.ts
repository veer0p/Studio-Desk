import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AssignmentService } from '@/lib/services/assignment.service'
import { createAssignmentsSchema } from '@/lib/validations/assignment.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'booking id')
    return withNoStore(Response.ok(await AssignmentService.getAssignmentsByBooking(supabase, id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'booking id')
    const parsed = createAssignmentsSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await AssignmentService.assignTeamToBooking(supabase, member.studio_id, id, parsed.data.assignments, user.id)
    return withNoStore(Response.ok(result))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
