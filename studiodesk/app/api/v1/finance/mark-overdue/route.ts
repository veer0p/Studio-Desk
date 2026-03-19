import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { invoiceRepo } from '@/lib/repositories/invoice.repo'

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    const result = await invoiceRepo.batchMarkOverdue(supabase, member.studio_id)
    return withNoStore(Response.ok({ updated_count: result.count }))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
