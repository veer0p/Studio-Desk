import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { handleRouteError, withNoStore, parseJson } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { FeatureFlagService } from '@/lib/services/feature-flags.service'
import { Errors } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const flags = await FeatureFlagService.getFlagsForStudio(supabase, member.studio_id)
    return withNoStore(Response.ok(flags))
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const body = await parseJson(req)

    const key = typeof body.key === 'string' ? body.key : null
    const isEnabled = typeof body.is_enabled === 'boolean' ? body.is_enabled : null

    if (!key || isEnabled === null) {
      throw Errors.validation('Both "key" (string) and "is_enabled" (boolean) are required')
    }

    const flag = await FeatureFlagService.toggleFlag(supabase, member.studio_id, key, isEnabled)
    return withNoStore(Response.ok(flag))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
