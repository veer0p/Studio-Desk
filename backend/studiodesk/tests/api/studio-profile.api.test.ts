import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import * as route from '@/app/api/v1/studio/profile/route'
import { StudioService } from '@/lib/services/studio.service'
import { requireAuth } from '@/lib/auth/guards'

vi.mock('@/lib/auth/guards')
vi.mock('@/lib/services/studio.service')
vi.mock('@/lib/logger')

describe('API: /api/v1/studio/profile', () => {
  const mockMember = { studio_id: 's1', role: 'owner' }
  const mockUser = { id: 'u1' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 200 with profile data', async () => {
      vi.mocked(requireAuth).mockResolvedValue({ user: mockUser, member: mockMember, supabase: {} } as any)
      vi.mocked(StudioService.getProfile).mockResolvedValue({ id: 's1', name: 'Test' } as any)

      await testApiHandler({
        appHandler: route,
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.name).toBe('Test')
          expect(res.headers.get('Cache-Control')).toBe('no-store')
        }
      })
    })

    it('returns 401 when not auth', async () => {
      vi.mocked(requireAuth).mockRejectedValue({ status: 401, message: 'Unauth', code: 'UNAUTHORIZED' })

      await testApiHandler({
        appHandler: route,
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(401)
        }
      })
    })
  })

  describe('PATCH', () => {
    it('returns 403 when role is not owner', async () => {
      vi.mocked(requireAuth).mockResolvedValue({ user: mockUser, member: { ...mockMember, role: 'photographer' }, supabase: {} } as any)

      await testApiHandler({
        appHandler: route,
        async test({ fetch }) {
          const res = await fetch({ 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New' })
          })
          if (res.status !== 403) {
            console.log('PATCH 403 response:', res.status, await res.json())
          }
          expect(res.status).toBe(403)
        }
      })
    })

    it('returns 400 for invalid body', async () => {
      vi.mocked(requireAuth).mockResolvedValue({ user: mockUser, member: mockMember, supabase: {} } as any)

      await testApiHandler({
        appHandler: route,
        async test({ fetch }) {
          const res = await fetch({ 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logo_url: 'not-a-url' })
          })
          const json = await res.json()
          console.log('PATCH 400 response:', res.status, json)
          expect(res.status).toBe(400)
          expect(json.code).toBe('VALIDATION_ERROR')
        }
      })
    })

    it('returns 200 on success', async () => {
      vi.mocked(requireAuth).mockResolvedValue({ user: mockUser, member: mockMember, supabase: {} } as any)
      vi.mocked(StudioService.updateProfile).mockResolvedValue({ name: 'Updated' } as any)

      await testApiHandler({
        appHandler: route,
        async test({ fetch }) {
          const res = await fetch({ 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated' })
          })
          if (res.status !== 200) {
            console.log('PATCH 200 response:', res.status, await res.json())
          }
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.name).toBe('Updated')
        }
      })
    })
  })
})
