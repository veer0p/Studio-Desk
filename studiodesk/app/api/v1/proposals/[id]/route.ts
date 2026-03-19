import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { ProposalService } from '@/lib/services/proposal.service'
import { updateProposalSchema } from '@/lib/validations/proposal.schema'
import { logError } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { member, supabase } = await requireAuth(req)
    const proposal = await ProposalService.getProposalById(supabase, params.id, member.studio_id)
    return Response.ok(proposal)
  } catch (err: any) {
    return handleError(err, req)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, member, supabase } = await requireAuth(req)
    
    const body = await req.json()
    const result = updateProposalSchema.safeParse(body)
    if (!result.success) {
      return Response.error(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }

    const proposal = await ProposalService.updateProposal(
      supabase,
      params.id,
      member.studio_id,
      result.data,
      user.id
    )

    return Response.ok(proposal)
  } catch (err: any) {
    return handleError(err, req)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { member, supabase } = await requireAuth(req)
    await ProposalService.deleteProposal(supabase, params.id, member.studio_id)
    return Response.ok({ deleted: true }, 200)
  } catch (err: any) {
    return handleError(err, req)
  }
}

function handleError(err: any, req: NextRequest) {
  if (err.status && err.code) {
    return Response.error(err.message, err.code, err.status)
  }

  logError({
    message: err.message || 'proposal_id_api_error',
    stack: err.stack,
    requestUrl: req.url,
  })

  return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
}
