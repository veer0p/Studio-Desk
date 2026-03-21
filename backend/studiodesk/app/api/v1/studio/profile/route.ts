import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { Errors } from '@/lib/errors'
import { StudioService } from '@/lib/services/studio.service'
import { updateProfileSchema } from '@/lib/validations/studio.schema'
import { logError, logSecurityEvent } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)

    const profile = await StudioService.getProfile(supabase, member.studio_id)

    const response = Response.ok(profile, 200)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (err: any) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireAuth(req)

    if (member.role !== 'owner') {
      await logSecurityEvent({
        eventType: 'unauthorized_profile_update_attempt',
        req,
        userId: user.id,
        studioId: member.studio_id
      })
      throw Errors.forbidden()
    }

    const body = await req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return Response.error(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }

    const updated = await StudioService.updateProfile(
      supabase,
      member.studio_id,
      result.data,
      user.id
    )

    const response = Response.ok(updated)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (err: any) {
    return handleError(err, req)
  }
}

function handleError(err: any, req?: NextRequest) {
  if (err.status === 401 || err.status === 403) {
    return Response.error(err.message, err.code, err.status)
  }

  if (err.code === 'VALIDATION_ERROR' || err.code === 'CONFLICT') {
    return Response.error(err.message, err.code, err.status)
  }

  logError({
    message: err.message || 'studio_profile_api_error',
    stack: err.stack,
    requestUrl: req?.url
  })
  
  return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
}
