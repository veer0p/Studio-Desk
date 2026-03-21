import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, parseJson, resolveUuidParam, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { AssignmentService } from '@/lib/services/assignment.service'
import { shootBriefSchema } from '@/lib/validations/assignment.schema'

export async function GET(req: NextRequest, context: any) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'booking id')
    return withNoStore(Response.ok(await AssignmentService.getShootBrief(supabase, id, member.studio_id)))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const { member, supabase, user } = await requireAuth(req)
    const id = await resolveUuidParam(context, req, 'booking id')
    const parsed = shootBriefSchema.safeParse(await parseJson(req))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const brief = await AssignmentService.upsertShootBrief(supabase, id, member.studio_id, parsed.data, user.id)
    return withNoStore(Response.ok(brief))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
