import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { ProposalService } from '@/lib/services/proposal.service'
import { logError } from '@/lib/logger'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, member, supabase } = await requireAuth(req)
    const proposal = await ProposalService.sendProposal(
      supabase,
      params.id,
      member.studio_id,
      user.id
    )
    return Response.ok(proposal)
  } catch (err: any) {
    if (err.status && err.code) {
      return Response.error(err.message, err.code, err.status)
    }

    logError({
      message: err.message || 'proposal_send_api_error',
      stack: err.stack,
      requestUrl: req.url,
    })

    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
