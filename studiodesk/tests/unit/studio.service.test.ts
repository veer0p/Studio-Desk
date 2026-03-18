import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StudioService } from '@/lib/services/studio.service'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { decrypt, encrypt } from '@/lib/crypto'
import { Errors } from '@/lib/errors'

vi.mock('@/lib/repositories/studio.repo')
vi.mock('@/lib/crypto')

describe('StudioService', () => {
  const mockStudio = {
    id: 's1',
    name: 'Test Studio',
    slug: 'test-studio',
    bank_account_number: 'encrypted-acc',
    storage_used_gb: 50,
    storage_limit_gb: 200,
    plan_tier: 'free',
    subscription_status: 'active'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('returns masked bank account number (last 4 only)', async () => {
      vi.mocked(studioRepo.getProfileById).mockResolvedValue(mockStudio as any)
      vi.mocked(decrypt).mockReturnValue('1234567890')

      const profile = await StudioService.getProfile({} as any, 's1')

      expect(profile.bank_account_number).toBe('XXXX7890')
      expect(profile.storage.usage_pct).toBe(25.0)
    })

    it('returns null bank account when not set', async () => {
      vi.mocked(studioRepo.getProfileById).mockResolvedValue({ ...mockStudio, bank_account_number: null } as any)
      
      const profile = await StudioService.getProfile({} as any, 's1')
      expect(profile.bank_account_number).toBeNull()
    })

    it('caps usage_pct at 100', async () => {
      vi.mocked(studioRepo.getProfileById).mockResolvedValue({ ...mockStudio, storage_used_gb: 300, storage_limit_gb: 200 } as any)
      
      const profile = await StudioService.getProfile({} as any, 's1')
      expect(profile.storage.usage_pct).toBe(100)
    })

    it('handles decrypt failure gracefully', async () => {
      vi.mocked(studioRepo.getProfileById).mockResolvedValue(mockStudio as any)
      vi.mocked(decrypt).mockImplementation(() => { throw new Error('fail') })

      const profile = await StudioService.getProfile({} as any, 's1')
      expect(profile.bank_account_number).toBeNull()
    })
  })

  describe('updateProfile', () => {
    const updateInput = { name: 'New Name', gstin: '24AAAAA0000A1Z5' }

    it('throws validation error for invalid GSTIN', async () => {
      await expect(StudioService.updateProfile({} as any, 's1', { gstin: 'invalid' }, 'u1'))
        .rejects.toThrow('Invalid GSTIN format')
    })

    it('encrypts bank account number before saving', async () => {
      vi.mocked(studioRepo.checkSlugAvailable).mockResolvedValue(true)
      vi.mocked(encrypt).mockReturnValue('new-encrypted')
      vi.mocked(studioRepo.getProfileById).mockResolvedValue(mockStudio as any)

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null })
      }

      await StudioService.updateProfile(mockSupabase as any, 's1', { bank_account_number: '987654321' }, 'u1')

      expect(encrypt).toHaveBeenCalledWith('987654321')
      expect(studioRepo.updateProfile).toHaveBeenCalledWith(
        expect.anything(),
        's1',
        expect.objectContaining({ bank_account_number: 'new-encrypted' })
      )
    })

    it('throws conflict when slug is taken', async () => {
      vi.mocked(studioRepo.checkSlugAvailable).mockResolvedValue(false)

      await expect(StudioService.updateProfile({} as any, 's1', { slug: 'taken' }, 'u1'))
        .rejects.toThrow('Studio slug already taken')
    })
  })
})
