import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Errors } from '@/lib/errors'
import { handleRouteError, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AssignmentService } from '@/lib/services/assignment.service'
import { memberAssignmentsQuerySchema } from '@/lib/validations/assignment.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const resolved = typeof context?.params?.then === 'function' ? await context.params : context?.params
    const memberId = resolved?.memberId ?? ''
    if (!memberId || !/^[0-9a-fA-F-]{36}$/.test(memberId)) {
      return Response.error('Invalid member id', 'VALIDATION_ERROR', 400)
    }
    if (member.role !== 'owner' && memberId !== member.member_id) throw Errors.forbidden()
    const parsed = memberAssignmentsQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const assignments = await AssignmentService.getMemberAssignments(supabase, memberId, member.studio_id, parsed.data)
    return withNoStore(Response.ok(assignments))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
