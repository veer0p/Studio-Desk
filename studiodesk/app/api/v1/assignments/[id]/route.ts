import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AssignmentService } from '@/lib/services/assignment.service'
import { updateAssignmentSchema } from '@/lib/validations/assignment.schema'

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'assignment id')
    const parsed = updateAssignmentSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const updated = await AssignmentService.updateAssignment(supabase, id, member.studio_id, parsed.data, {
      role: member.role,
      memberId: member.member_id,
      userId: user.id,
    })
    return withNoStore(Response.ok(updated))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveUuidParam(context, req, 'assignment id')
    await AssignmentService.removeAssignment(supabase, id, member.studio_id)
    return Response.noContent()
  } catch (err) {
    return handleRouteError(err, req)
  }
}
