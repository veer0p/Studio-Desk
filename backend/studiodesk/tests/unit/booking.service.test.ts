import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingService } from '@/lib/services/booking.service'
import { bookingRepo } from '@/lib/repositories/booking.repo'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { clientRepo } from '@/lib/repositories/client.repo'

vi.mock('@/lib/repositories/booking.repo')
vi.mock('@/lib/repositories/studio.repo')
vi.mock('@/lib/repositories/client.repo')
vi.mock('@/lib/logger')

const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000'

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
} as any

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createBooking', () => {
    it('successfully creates a booking and calculates GST', async () => {
      vi.mocked(studioRepo.getProfileById).mockResolvedValue({ state_id: 'MH' } as any)
      vi.mocked(clientRepo.getClientById).mockResolvedValue({ state_id: 'MH' } as any)
      vi.mocked(bookingRepo.createBooking).mockResolvedValue({ id: MOCK_UUID, title: 'Test' } as any)

      const input = {
        title: 'Wedding: A & B',
        client_id: MOCK_UUID,
        event_type: 'wedding',
        event_date: new Date().toISOString(),
        total_amount: 100000,
        advance_amount: 20000
      }

      const result = await BookingService.createBooking(mockSupabase, 's1', input, 'u1')

      expect(bookingRepo.createBooking).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          gst_type: 'cgst_sgst',
          cgst_rate: 9,
          sgst_rate: 9,
          total_amount: 100000
        })
      )
      expect(result.id).toBe(MOCK_UUID)
    })
  })

  describe('updateStatus', () => {
    it('throws error for invalid status transition', async () => {
      vi.mocked(bookingRepo.getBookingById).mockResolvedValue({ id: MOCK_UUID, status: 'booked' } as any)

      await expect(
        BookingService.updateStatus(mockSupabase, MOCK_UUID, 's1', 'delivered', 'u1')
      ).rejects.toThrow('Invalid status transition')
    })

    it('successfully updates status for valid transition', async () => {
      vi.mocked(bookingRepo.getBookingById).mockResolvedValue({ id: MOCK_UUID, status: 'booked' } as any)
      vi.mocked(bookingRepo.updateBookingStatus).mockResolvedValue({ id: MOCK_UUID, status: 'shoot_completed' } as any)

      const result = await BookingService.updateStatus(mockSupabase, MOCK_UUID, 's1', 'shoot_completed', 'u1')
      expect(result.status).toBe('shoot_completed')
    })
  })
})
