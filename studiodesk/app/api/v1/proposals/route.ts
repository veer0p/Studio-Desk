import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { Errors } from '@/lib/errors'
import { ProposalService } from '@/lib/services/proposal.service'
import { listProposalsSchema, createProposalSchema } from '@/lib/validations/proposal.schema'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    
    const url = new URL(req.url)
    const params = {
      status: url.searchParams.get('status') || undefined,
      booking_id: url.searchParams.get('booking_id') || undefined,
      page: parseInt(url.searchParams.get('page') || '0', 10),
      pageSize: parseInt(url.searchParams.get('pageSize') || '20', 10),
    }

    const result = listProposalsSchema.safeParse(params)
    if (!result.success) {
      return Response.error(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }

    const data = await ProposalService.getProposals(supabase, member.studio_id, result.data)

    return Response.ok(data.data, 200, { total: data.count })
  } catch (err: any) {
    return handleError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, member, supabase } = await requireAuth(req)

    const body = await req.json()
    const result = createProposalSchema.safeParse(body)

    if (!result.success) {
      return Response.error(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }

    const proposal = await ProposalService.createProposal(
      supabase,
      member.studio_id,
      result.data,
      user.id
    )

    return Response.ok(proposal, 201)
  } catch (err: any) {
    return handleError(err, req)
  }
}

function handleError(err: any, req: NextRequest) {
  if (err.status && err.code) {
    return Response.error(err.message, err.code, err.status)
  }

  logError({
    message: err.message || 'proposals_api_error',
    stack: err.stack,
    requestUrl: req.url,
  })

  return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
}
