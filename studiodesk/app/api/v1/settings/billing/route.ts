import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, withCache } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { SettingsService } from '@/lib/services/settings.service'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const billing = await SettingsService.getBillingInfo(supabase, member.studio_id)
    
    // Billing info is relatively static, cache for 5 mins
    return withCache(
      Response.ok(billing),
      'private, max-age=300'
    )
  } catch (err) {
    return handleRouteError(err, req)
  }
}
