import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/lib/services/auth.service'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { teamRepo } from '@/lib/repositories/team.repo'

vi.mock('@/lib/repositories/studio.repo')
vi.mock('@/lib/repositories/team.repo')
vi.mock('@/lib/logger')

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
} as any

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signup', () => {
    it('successfully signs up user and creates studio', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      vi.mocked(studioRepo.createStudio).mockResolvedValue({ id: 's1', name: 'Test Studio' } as any)
      vi.mocked(teamRepo.createMember).mockResolvedValue({ id: 'm1' } as any)

      const input = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        studioName: 'Test Studio',
        studioSlug: 'test-studio'
      }

      const result = await AuthService.signup(mockSupabase, input)

      expect(mockSupabase.auth.signUp).toHaveBeenCalled()
      expect(studioRepo.createStudio).toHaveBeenCalled()
      expect(teamRepo.createMember).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({ role: 'owner' })
      )
      expect(result.studio.id).toBe('s1')
    })

    it('throws conflict error for duplicate email', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered', status: 422 }
      })

      const input = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User',
        studioName: 'Test Studio',
        studioSlug: 'test-studio'
      }

      await expect(AuthService.signup(mockSupabase, input)).rejects.toThrow('An account with this email already exists')
    })
  })

  describe('login', () => {
    it('returns user, studio, and member data', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com' } },
        error: null
      })
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'm1', role: 'owner', display_name: 'Test', studios: { id: 's1', name: 'Test Studio', onboarding_completed: true } },
          error: null
        })
      }))

      const result = await AuthService.login(mockSupabase, { email: 'test@example.com', password: 'password123' })
      expect(result.user.id).toBe('u1')
      expect(result.studio.name).toBe('Test Studio')
      expect(result.member.role).toBe('owner')
    })

    it('returns null studio/member when user has no studio', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com' } },
        error: null
      })
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      }))

      const result = await AuthService.login(mockSupabase, { email: 'test@example.com', password: 'password123' })
      expect(result.user.id).toBe('u1')
      expect(result.studio).toBeNull()
      expect(result.member).toBeNull()
    })
  })

  describe('me', () => {
    it('returns combined user and studio info', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'm1', role: 'owner', studios: { id: 's1', name: 'Test' } },
          error: null
        })
      }))

      const result = await AuthService.me(mockSupabase)
      expect(result.user.id).toBe('u1')
      expect(result.studio.name).toBe('Test')
    })
  })
})

