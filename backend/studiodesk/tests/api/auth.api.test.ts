import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import * as signupRoute from '@/app/api/v1/auth/signup/route'
import * as loginRoute from '@/app/api/v1/auth/login/route'
import { AuthService } from '@/lib/services/auth.service'

vi.mock('@/lib/services/auth.service')
vi.mock('@/lib/logger')

describe('API: Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/v1/auth/signup', () => {
    it('returns 201 on valid signup', async () => {
      vi.mocked(AuthService.signup).mockResolvedValue({ user: { id: 'u1' }, studio: { id: 's1' } } as any)

      await testApiHandler({
        appHandler: signupRoute,
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
              fullName: 'John Doe',
              studioName: 'Johns Studio',
              studioSlug: 'johns-studio'
            })
          })
          expect(res.status).toBe(201)
          const json = await res.json()
          expect(json.data.studio.id).toBe('s1')
        }
      })
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 on valid credentials', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({ user: { id: 'u1' }, session: {} } as any)

      await testApiHandler({
        appHandler: loginRoute,
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123'
            })
          })
          expect(res.status).toBe(200)
        }
      })
    })
  })
})
