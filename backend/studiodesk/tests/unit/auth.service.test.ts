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
