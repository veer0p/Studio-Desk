import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Response } from '@/lib/response'
import { ProposalService } from '@/lib/services/proposal.service'
import { acceptProposalSchema } from '@/lib/validations/proposal.schema'
import { logError } from '@/lib/logger'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    
    // We expect the token in the body for the public accept endpoint
    if (!body.token) {
      return Response.error('Access token is required', 'VALIDATION_ERROR', 400)
    }

    const result = acceptProposalSchema.safeParse(body)
    if (!result.success) {
      return Response.error(result.error.issues[0].message, 'VALIDATION_ERROR', 400)
    }

    const { booking_id } = await ProposalService.acceptProposal(
      supabase,
      body.token,
      result.data.action,
      result.data.reason
    )

    return Response.ok({ success: true, booking_id })
  } catch (err: any) {
    if (err.status && err.code) {
      return Response.error(err.message, err.code, err.status)
    }

    logError({
      message: err.message || 'proposal_accept_api_error',
      stack: err.stack,
      requestUrl: req.url,
    })

    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
