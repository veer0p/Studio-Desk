import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProposalService } from '@/lib/services/proposal.service'
import { proposalRepo } from '@/lib/repositories/proposal.repo'
import { getBookingById, getClientById } from '@/lib/supabase/queries'

vi.mock('@/lib/repositories/proposal.repo')
vi.mock('@/lib/supabase/queries')
vi.mock('@/lib/logger')
vi.mock('@/lib/resend/client')

const mockSupabase = {
  from: vi.fn().mockImplementation(() => ({
    insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
    update: vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          single: vi.fn().mockReturnValue(Promise.resolve({ data: {}, error: null })),
        })),
        eq: vi.fn().mockReturnThis(),
      })),
    })),
    select: vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation(() => ({
        single: vi.fn().mockReturnValue(Promise.resolve({ data: {}, error: null })),
        is: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      })),
      order: vi.fn().mockReturnThis(),
    })),
    delete: vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
    })),
  })),
} as any

describe('ProposalService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for getProposalById to avoid errors in calls
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue({ id: 'p1', subtotal: 0, total_amount: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, status: 'draft' } as any)
  })

  describe('createProposal', () => {
    it('calculates totals and GST correctly for cgst_sgst', async () => {
      vi.mocked(getBookingById).mockResolvedValue({ id: 'b1' } as any)
      vi.mocked(getClientById).mockResolvedValue({ id: 'c1' } as any)
      vi.mocked(proposalRepo.createProposal).mockResolvedValue({ id: 'p1', access_token: 't1' } as any)
      vi.mocked(proposalRepo.getProposalById).mockResolvedValue({
        id: 'p1',
        subtotal: 1000,
        total_amount: 1180,
        cgst_amount: 90,
        sgst_amount: 90,
        igst_amount: 0,
        status: 'draft',
      } as any)

      const data = {
        booking_id: 'b1',
        client_id: 'c1',
        gst_type: 'cgst_sgst',
        line_items: [
          { name: 'Item 1', quantity: 1, unit_price: 1000 }
        ]
      }

      const result = await ProposalService.createProposal(mockSupabase, 's1', data, 'u1')

      expect(proposalRepo.createProposal).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          subtotal: 1000,
          total_amount: 1180,
          cgst_amount: 90,
          sgst_amount: 90,
        })
      )
      expect(result.total_amount).toBe('1180.00')
    })
  })

  describe('updateProposal', () => {
    it('throws CONFLICT if proposal is not draft', async () => {
      vi.mocked(proposalRepo.getProposalById).mockResolvedValue({ status: 'sent' } as any)
      
      await expect(
        ProposalService.updateProposal(mockSupabase, 'p1', 's1', {}, 'u1')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('recalculates totals when line items provided', async () => {
      vi.mocked(proposalRepo.getProposalById)
        .mockResolvedValueOnce({ id: 'p1', status: 'draft', gst_type: 'none' } as any)
        .mockResolvedValueOnce({ 
          id: 'p1', status: 'draft', subtotal: 1000, total_amount: 1000, 
          cgst_amount: 0, sgst_amount: 0, igst_amount: 0, gst_type: 'none' 
        } as any)
      
      await ProposalService.updateProposal(mockSupabase, 'p1', 's1', {
        line_items: [{ name: 'New Item', quantity: 2, unit_price: 500 }]
      }, 'u1')

      expect(proposalRepo.updateProposal).toHaveBeenCalledWith(
        mockSupabase,
        'p1',
        's1',
        expect.objectContaining({
          subtotal: 1000,
          total_amount: 1000,
        })
      )
    })
  })

  describe('acceptProposal', () => {
    it('throws CONFLICT if proposal is expired', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      
      vi.mocked(proposalRepo.getProposalByToken).mockResolvedValue({
        id: 'p1',
        status: 'sent',
        valid_until: pastDate.toISOString().split('T')[0]
      } as any)

      await expect(
        ProposalService.acceptProposal(mockSupabase, 'token', 'accept')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('successfully accepts a valid proposal', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      
      vi.mocked(proposalRepo.getProposalByToken).mockResolvedValue({
        id: 'p1',
        booking_id: 'b1',
        studio_id: 's1',
        status: 'sent',
        valid_until: futureDate.toISOString().split('T')[0]
      } as any)

      vi.mocked(proposalRepo.markProposalAccepted).mockResolvedValue({ id: 'p1', status: 'accepted' } as any)

      const result = await ProposalService.acceptProposal(mockSupabase, 'token', 'accept')
      expect(result.booking_id).toBe('b1')
      expect(proposalRepo.markProposalAccepted).toHaveBeenCalledWith(mockSupabase, 'p1')
    })
  })
})
