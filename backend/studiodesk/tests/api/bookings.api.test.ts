import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import * as bookingsRoute from '@/app/api/v1/bookings/route'
import * as bookingIdRoute from '@/app/api/v1/bookings/[id]/route'
import { requireAuth } from '@/lib/auth/guards'
import { BookingService } from '@/lib/services/booking.service'

vi.mock('@/lib/auth/guards')
vi.mock('@/lib/services/booking.service')
vi.mock('@/lib/logger')

const authContext = { user: { id: 'u1' }, member: { studio_id: 's1', role: 'member' }, supabase: {} }
const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('API: /api/v1/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /bookings', () => {
    it('returns 200 with data', async () => {
      vi.mocked(requireAuth).mockResolvedValue(authContext as any)
      vi.mocked(BookingService.listBookings).mockResolvedValue({
        data: [{ id: MOCK_UUID, title: 'Booking 1' }],
        count: 1
      })

      await testApiHandler({
        appHandler: bookingsRoute,
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.data).toHaveLength(1)
        }
      })
    })
  })

  describe('POST /bookings', () => {
    it('returns 201 on success', async () => {
      vi.mocked(requireAuth).mockResolvedValue(authContext as any)
      vi.mocked(BookingService.createBooking).mockResolvedValue({ id: MOCK_UUID, title: 'New' } as any)

      await testApiHandler({
        appHandler: bookingsRoute,
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'New', client_id: MOCK_UUID, event_type: 'wedding', total_amount: 50000 })
          })
          expect(res.status).toBe(201)
          const json = await res.json()
          expect(json.data.id).toBe(MOCK_UUID)
        }
      })
    })
  })
})
