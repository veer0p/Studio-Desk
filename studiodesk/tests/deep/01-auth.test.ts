import { beforeAll, describe, expect, it } from 'vitest'
import { api } from '../helpers/api'
import { setupTokens, tokens } from '../helpers/tokens'

describe('Deep Auth', () => {
  beforeAll(async () => {
    await setupTokens()
  })

  describe('POST /api/v1/auth/signup', () => {
    it('400 for empty body', async () => {
      const res = await api('POST', '/api/v1/auth/signup', { body: {} })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('401 for wrong password', async () => {
      const res = await api('POST', '/api/v1/auth/login', {
        body: { email: 'owner@test.com', password: 'WrongPass@1' },
      })
      expect(res.status).toBe(401)
    })

    it('200 for valid owner', async () => {
      const res = await api('POST', '/api/v1/auth/login', {
        body: { email: 'owner@test.com', password: 'Test@1234' },
      })
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('401 without token', async () => {
      const res = await api('GET', '/api/v1/auth/me')
      expect(res.status).toBe(401)
    })

    it('200 with owner token', async () => {
      const login = await api('POST', '/api/v1/auth/login', {
        body: { email: 'owner@test.com', password: 'Test@1234' },
      })
      const cookie = login.headers.get('set-cookie')
      const res = await api('GET', '/api/v1/auth/me', {
        headers: cookie ? { cookie } : undefined,
      })
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/v1/auth/forgot-password', () => {
    it('400 invalid email', async () => {
      const res = await api('POST', '/api/v1/auth/forgot-password', { body: { email: 'bad' } })
      expect(res.status).toBe(400)
    })

    it('200 with generic message for unknown email', async () => {
      const res = await api('POST', '/api/v1/auth/forgot-password', {
        body: { email: 'missing-user@example.com' },
      })
      expect(res.status).toBe(200)
      expect((res.body as any)?.data?.message).toContain('If an account exists')
    })
  })
})
