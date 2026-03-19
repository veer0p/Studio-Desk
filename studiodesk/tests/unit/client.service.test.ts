import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientService } from '@/lib/services/client.service'
import { clientRepo } from '@/lib/repositories/client.repo'

vi.mock('@/lib/repositories/client.repo')

const mockSupabase = {} as any

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createClient', () => {
    it('throws CONFLICT when phone already exists in studio', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue({ id: 'existing', full_name: 'X' } as any)

      await expect(
        ClientService.createClient(mockSupabase, 'studio-1', {
          full_name: 'New Client',
          phone: '9876543210',
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
      expect(clientRepo.createClient).not.toHaveBeenCalled()
    })

    it('creates client on valid data', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue(null)
      vi.mocked(clientRepo.createClient).mockResolvedValue({
        id: 'c1',
        full_name: 'Test',
        phone: '9876543210',
        email: null,
        city: null,
        state: null,
        company_name: null,
        gstin: null,
        tags: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any)

      const result = await ClientService.createClient(mockSupabase, 'studio-1', {
        full_name: 'Test',
        phone: '9876543210',
      })
      expect(result.id).toBe('c1')
      expect(clientRepo.createClient).toHaveBeenCalledWith(mockSupabase, 'studio-1', expect.objectContaining({ full_name: 'Test', phone: '9876543210' }))
    })
  })

  describe('updateClient', () => {
    it('throws CONFLICT when phone changed to another client phone', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue({ id: 'other-client' } as any)

      await expect(
        ClientService.updateClient(mockSupabase, 'client-1', 'studio-1', { phone: '9876543210' })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('succeeds when phone unchanged (same client)', async () => {
      vi.mocked(clientRepo.getClientByPhone).mockResolvedValue({ id: 'client-1' } as any)
      vi.mocked(clientRepo.updateClient).mockResolvedValue({
        id: 'client-1',
        full_name: 'Test',
        phone: '9876543210',
        email: null,
        city: null,
        state: null,
        company_name: null,
        gstin: null,
        tags: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any)

      const result = await ClientService.updateClient(mockSupabase, 'client-1', 'studio-1', { full_name: 'Updated' })
      expect(result.id).toBe('client-1')
    })
  })

  describe('deleteClient', () => {
    it('throws CONFLICT when client has active bookings', async () => {
      vi.mocked(clientRepo.softDeleteClient).mockRejectedValue(
        Object.assign(new Error('Client has active bookings'), { code: 'CONFLICT', status: 409 })
      )

      await expect(
        ClientService.deleteClient(mockSupabase, 'client-1', 'studio-1')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('succeeds when only closed bookings', async () => {
      vi.mocked(clientRepo.softDeleteClient).mockResolvedValue(undefined as any)
      await ClientService.deleteClient(mockSupabase, 'client-1', 'studio-1')
      expect(clientRepo.softDeleteClient).toHaveBeenCalledWith(mockSupabase, 'client-1', 'studio-1')
    })
  })

  describe('getClientDetail', () => {
    it('throws NOT_FOUND when client does not exist', async () => {
      vi.mocked(clientRepo.getClientById).mockResolvedValue(null)
      vi.mocked(clientRepo.getClientBookingHistory).mockResolvedValue([])
      vi.mocked(clientRepo.getClientStats).mockResolvedValue({ total_bookings: 0, total_revenue: 0, total_paid: 0 })

      await expect(
        ClientService.getClientDetail(mockSupabase, 'client-1', 'studio-1')
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('runs three queries in parallel and returns combined detail', async () => {
      const client = {
        id: 'c1',
        full_name: 'Priya',
        phone: '9876543210',
        email: 'p@b.com',
        address: null,
        city: 'Surat',
        state: 'Gujarat',
        pincode: null,
        company_name: null,
        gstin: null,
        notes: null,
        tags: ['vip'],
        created_at: new Date(),
        updated_at: new Date(),
      }
      vi.mocked(clientRepo.getClientById).mockResolvedValue(client as any)
      vi.mocked(clientRepo.getClientBookingHistory).mockResolvedValue([
        { id: 'b1', title: 'Wedding', event_type: 'wedding', event_date: new Date(), status: 'delivered', total_amount: 85000, amount_paid: 85000, amount_pending: 0 },
      ] as any)
      vi.mocked(clientRepo.getClientStats).mockResolvedValue({ total_bookings: 1, total_revenue: 85000, total_paid: 85000 })

      const result = await ClientService.getClientDetail(mockSupabase, 'c1', 'studio-1')
      expect(result.id).toBe('c1')
      expect(result.full_name).toBe('Priya')
      expect(result.stats.total_bookings).toBe(1)
      expect(result.stats.total_revenue).toBe('85000.00')
      expect(result.bookings).toHaveLength(1)
      expect(clientRepo.getClientById).toHaveBeenCalled()
      expect(clientRepo.getClientBookingHistory).toHaveBeenCalled()
      expect(clientRepo.getClientStats).toHaveBeenCalled()
    })
  })
})
