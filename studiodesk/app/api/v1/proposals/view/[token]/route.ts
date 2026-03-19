import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Response } from '@/lib/response'
import { ProposalService } from '@/lib/services/proposal.service'
import { logError } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient()
    const proposal = await ProposalService.viewProposal(supabase, params.token)
    return Response.ok(proposal)
  } catch (err: any) {
    if (err.status && err.code) {
      return Response.error(err.message, err.code, err.status)
    }

    logError({
      message: err.message || 'proposal_view_api_error',
      stack: err.stack,
      requestUrl: req.url,
    })

    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
