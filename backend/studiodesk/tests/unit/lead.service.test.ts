import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeadService } from '@/lib/services/lead.service'
import { leadRepo } from '@/lib/repositories/lead.repo'
import { clientRepo } from '@/lib/repositories/client.repo'

vi.mock('@/lib/repositories/lead.repo')
vi.mock('@/lib/repositories/client.repo')
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null } as any),
      insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
    })),
  })),
}))
vi.mock('@/lib/rate-limit', () => ({ checkInquiryRateLimit: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }))

const mockSupabase = {} as any

describe('LeadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('processInquiryForm', () => {
    it('throws NOT_FOUND for unknown studio slug', async () => {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null } as any),
        }),
      } as any)
      await expect(
        LeadService.processInquiryForm('unknown-studio', {
          full_name: 'Test',
          phone: '9876543210',
        }, '1.2.3.4')
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws RATE_LIMITED when rate limit exceeded', async () => {
      const { checkInquiryRateLimit } = await import('@/lib/rate-limit')
      vi.mocked(checkInquiryRateLimit).mockRejectedValueOnce({ code: 'RATE_LIMITED', status: 429 })
      const admin = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'studio-1', name: 'Studio' } }),
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      }
      const { createAdminClient } = await import('@/lib/supabase/admin')
      vi.mocked(createAdminClient).mockReturnValue(admin as any)
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue(null)
      vi.mocked(clientRepo.createClient).mockResolvedValue({ id: 'client-1' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({ id: 'lead-1' } as any)

      await expect(
        LeadService.processInquiryForm('slug', { full_name: 'A', phone: '9876543210' }, '1.2.3.4')
      ).rejects.toMatchObject({ code: 'RATE_LIMITED' })
    })

    it('creates client and lead when phone is new', async () => {
      const admin = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'studio-1', name: 'Studio' } }),
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      }
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue(null)
      vi.mocked(clientRepo.createClient).mockResolvedValue({ id: 'client-1' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({ id: 'lead-1' } as any)
      const { createAdminClient } = await import('@/lib/supabase/admin')
      vi.mocked(createAdminClient).mockReturnValue(admin as any)

      const result = await LeadService.processInquiryForm(
        'slug',
        { full_name: 'New User', phone: '9876543210', email: 'a@b.com' },
        '1.2.3.4'
      )
      expect(result.lead_id).toBe('lead-1')
      expect(clientRepo.createClient).toHaveBeenCalled()
      expect(leadRepo.createLead).toHaveBeenCalled()
    })

    it('reuses existing client when phone exists', async () => {
      const admin = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'studio-1', name: 'Studio' } }),
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      }
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue({ id: 'existing-client' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({ id: 'lead-2' } as any)
      const { createAdminClient } = await import('@/lib/supabase/admin')
      vi.mocked(createAdminClient).mockReturnValue(admin as any)

      const result = await LeadService.processInquiryForm(
        'slug',
        { full_name: 'Existing', phone: '9876543210' },
        '1.2.3.4'
      )
      expect(result.lead_id).toBe('lead-2')
      expect(clientRepo.createClient).not.toHaveBeenCalled()
      expect(leadRepo.createLead).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ client_id: 'existing-client' }))
    })
  })

  describe('createLeadManual', () => {
    it('uses provided client_id when given', async () => {
      vi.mocked(clientRepo.getClientById).mockResolvedValue({ id: 'c1' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({
        id: 'lead-1',
        status: 'new_lead',
        client_id: 'c1',
        clients: { full_name: 'C', phone: '9876543210', email: null, whatsapp: null },
        created_at: new Date(),
        updated_at: new Date(),
      } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({
        id: 'lead-1',
        status: 'new_lead',
        client_id: 'c1',
        clients: { full_name: 'C', phone: '9876543210' },
        form_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any)

      const result = await LeadService.createLeadManual(mockSupabase, 'studio-1', {
        full_name: 'Client',
        phone: '9876543210',
        client_id: 'c1',
        source: 'phone',
        priority: 'medium',
      })
      expect(result.id).toBe('lead-1')
      expect(clientRepo.createClient).not.toHaveBeenCalled()
      expect(leadRepo.createLead).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ client_id: 'c1' }))
    })

    it('creates client when new phone and no client_id', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue(null)
      vi.mocked(clientRepo.createClient).mockResolvedValue({ id: 'new-client' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({ id: 'lead-1' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({
        id: 'lead-1',
        status: 'new_lead',
        clients: { full_name: 'X', phone: '9876543210' },
        form_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any)

      await LeadService.createLeadManual(mockSupabase, 'studio-1', {
        full_name: 'New',
        phone: '9876543210',
        source: 'phone',
        priority: 'medium',
      })
      expect(clientRepo.createClient).toHaveBeenCalled()
      expect(leadRepo.createLead).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ client_id: 'new-client' }))
    })

    it('reuses existing client when phone exists and no client_id', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue({ id: 'existing' } as any)
      vi.mocked(leadRepo.createLead).mockResolvedValue({ id: 'lead-1' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({
        id: 'lead-1',
        clients: { full_name: 'E', phone: '9876543210' },
        form_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any)

      await LeadService.createLeadManual(mockSupabase, 'studio-1', {
        full_name: 'Existing',
        phone: '9876543210',
        source: 'phone',
        priority: 'medium',
      })
      expect(clientRepo.createClient).not.toHaveBeenCalled()
      expect(leadRepo.createLead).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ client_id: 'existing' }))
    })
  })

  describe('updateLead status transitions', () => {
    it('allows new_lead → contacted', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({ id: 'l1', status: 'new_lead' } as any)
      vi.mocked(leadRepo.updateLead).mockResolvedValue({ id: 'l1', status: 'contacted' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValueOnce({ id: 'l1', status: 'new_lead' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValueOnce({
        id: 'l1', status: 'contacted', clients: {}, form_data: null, created_at: new Date(), updated_at: new Date(),
      } as any)

      const result = await LeadService.updateLead(mockSupabase, 'l1', 'studio-1', { status: 'contacted' })
      expect(result.status).toBe('contacted')
    })

    it('throws VALIDATION_ERROR for backward transition contacted → new_lead', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({ id: 'l1', status: 'contacted' } as any)

      await expect(
        LeadService.updateLead(mockSupabase, 'l1', 'studio-1', { status: 'new_lead' })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('allows any status → lost', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({ id: 'l1', status: 'proposal_sent' } as any)
      vi.mocked(leadRepo.updateLead).mockResolvedValue({ id: 'l1', status: 'lost' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValueOnce({ id: 'l1', status: 'proposal_sent' } as any)
      vi.mocked(leadRepo.getLeadById).mockResolvedValueOnce({
        id: 'l1', status: 'lost', clients: {}, form_data: null, created_at: new Date(), updated_at: new Date(),
      } as any)

      const result = await LeadService.updateLead(mockSupabase, 'l1', 'studio-1', { status: 'lost' })
      expect(result.status).toBe('lost')
    })

    it('throws VALIDATION_ERROR when follow_up_at is in the past', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({ id: 'l1' } as any)
      const past = new Date(Date.now() - 86400000).toISOString()

      await expect(
        LeadService.updateLead(mockSupabase, 'l1', 'studio-1', { follow_up_at: past })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })
  })

  describe('convertLeadToBooking', () => {
    it('throws CONFLICT when lead already converted', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({
        id: 'l1',
        converted_to_booking: true,
        client_id: 'c1',
        clients: {},
        event_type: 'wedding',
        event_date_approx: new Date('2025-06-01'),
      } as any)

      await expect(
        LeadService.convertLeadToBooking(mockSupabase, 'l1', 'studio-1', { event_date: '2025-06-01', gst_type: 'cgst_sgst' }, 'user-1')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('throws CONFLICT when lead status is lost', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue({
        id: 'l1',
        status: 'lost',
        converted_to_booking: false,
        client_id: 'c1',
        clients: {},
        event_type: 'wedding',
        event_date_approx: new Date('2025-06-01'),
      } as any)

      await expect(
        LeadService.convertLeadToBooking(mockSupabase, 'l1', 'studio-1', { event_date: '2025-06-01', gst_type: 'cgst_sgst' }, 'user-1')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('throws NOT_FOUND when lead does not exist', async () => {
      vi.mocked(leadRepo.getLeadById).mockResolvedValue(null)

      await expect(
        LeadService.convertLeadToBooking(mockSupabase, 'l1', 'studio-1', { event_date: '2025-06-01', gst_type: 'cgst_sgst' }, 'user-1')
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('creates booking and marks lead converted on success', async () => {
      const leadRow = {
        id: 'l1',
        client_id: 'c1',
        status: 'contacted',
        converted_to_booking: false,
        source: 'inquiry_form',
        clients: { full_name: 'Priya' },
        event_type: 'wedding',
        event_date_approx: new Date('2025-06-01'),
      }
      vi.mocked(leadRepo.getLeadById).mockResolvedValue(leadRow as any)
      const adminFrom = vi.fn((table: string) => {
        if (table === 'bookings') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { id: 'booking-1' }, error: null }),
            }),
          }
        }
        if (table === 'booking_activity_feed') {
          return { insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })) }
        }
        return { insert: vi.fn(), update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() }
      })
      const { createAdminClient } = await import('@/lib/supabase/admin')
      vi.mocked(createAdminClient).mockReturnValue({ from: adminFrom } as any)
      const mockUserSupabase = { from: vi.fn() } as any
      vi.mocked(leadRepo.markLeadConverted).mockResolvedValue(undefined as any)

      const result = await LeadService.convertLeadToBooking(
        mockUserSupabase,
        'l1',
        'studio-1',
        { event_date: '2025-06-01', gst_type: 'cgst_sgst' },
        'user-1'
      )
      expect(result.booking_id).toBe('booking-1')
      expect(leadRepo.markLeadConverted).toHaveBeenCalledWith(expect.anything(), 'l1', 'booking-1', 'studio-1')
    })
  })

  describe('deleteLead', () => {
    it('calls repo softDeleteLead', async () => {
      vi.mocked(leadRepo.softDeleteLead).mockResolvedValue(undefined as any)
      await LeadService.deleteLead(mockSupabase, 'l1', 'studio-1')
      expect(leadRepo.softDeleteLead).toHaveBeenCalledWith(mockSupabase, 'l1', 'studio-1')
    })
  })
})
