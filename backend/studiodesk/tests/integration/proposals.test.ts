import { describe, it, expect, beforeAll } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, getOutsiderToken, type AuthToken } from '../helpers/auth'
import {
  BOOKING_CONVERTED_ID,
  CLIENT_PRIYA_ID,
  PACKAGE_WEDDING_ID,
  STUDIO_A_ID,
} from '../../supabase/seed'
import { createAdminClient } from '@/lib/supabase/admin'

describe('Proposals API Integration', () => {
  let owner: AuthToken
  let outsider: AuthToken
  let createdProposalId: string
  let proposalToken: string

  beforeAll(async () => {
    owner = await getOwnerToken()
    outsider = await getOutsiderToken()
    
    // Cleanup any existing proposals for the test booking to avoid conflicts if re-running
    const admin = createAdminClient()
    await (admin.from('proposal_line_items') as any).delete().eq('studio_id', STUDIO_A_ID)
    await (admin.from('proposals') as any).delete().eq('studio_id', STUDIO_A_ID)
  })

  it('POST /api/v1/proposals creates a draft', async () => {
    const { status, body } = await makeRequest('POST', '/api/v1/proposals', {
      token: owner.access_token,
      body: {
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        gst_type: 'cgst_sgst',
        line_items: [
          { name: 'Photography Service', quantity: 1, unit_price: 50000 },
          { name: 'Drone Addon', quantity: 1, unit_price: 15000 }
        ]
      }
    })

    expect(status).toBe(201)
    const proposal = (body as any).data
    expect(proposal.status).toBe('draft')
    expect(proposal.total_amount).toBe('76700.00') // (50000 + 15000) * 1.18
    createdProposalId = proposal.id
    proposalToken = proposal.access_token
  })

  it('GET /api/v1/proposals/:id returns detailed view', async () => {
    const { status, body } = await makeRequest('GET', `/api/v1/proposals/${createdProposalId}`, {
      token: owner.access_token
    })
    expect(status).toBe(200)
    expect((body as any).data.line_items).toHaveLength(2)
  })

  it('POST /api/v1/proposals/:id/send updates status', async () => {
    const { status, body } = await makeRequest('POST', `/api/v1/proposals/${createdProposalId}/send`, {
      token: owner.access_token
    })
    expect(status).toBe(200)
    expect((body as any).data.status).toBe('sent')
  })

  it('GET /api/v1/proposals/view/:token (Public) works', async () => {
    const { status, body } = await makeRequest('GET', `/api/v1/proposals/view/${proposalToken}`)
    expect(status).toBe(200)
    expect((body as any).data.id).toBe(createdProposalId)
  })

  it('POST /api/v1/proposals/:id/accept (Public) accepts proposal', async () => {
    const { status } = await makeRequest('POST', `/api/v1/proposals/${createdProposalId}/accept`, {
      body: {
        token: proposalToken,
        action: 'accept'
      }
    })
    expect(status).toBe(200)

    // Verify status in DB
    const { body: getBody } = await makeRequest('GET', `/api/v1/proposals/${createdProposalId}`, {
      token: owner.access_token
    })
    expect((getBody as any).data.status).toBe('accepted')
  })

  it('PATCH returns 409 for non-draft proposal', async () => {
    const { status } = await makeRequest('PATCH', `/api/v1/proposals/${createdProposalId}`, {
      token: owner.access_token,
      body: { notes: 'Trying to edit accepted proposal' }
    })
    expect(status).toBe(409)
  })
})
