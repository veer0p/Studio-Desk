import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StudioService } from '@/lib/services/studio.service'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { packageRepo } from '@/lib/repositories/package.repo'

vi.mock('@/lib/repositories/studio.repo')
vi.mock('@/lib/repositories/package.repo')

const mockSupabase = {} as any

describe('StudioService — storage & onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStorageStats', () => {
    it('computes usage_pct: 100/200 → 50', async () => {
      vi.mocked(studioRepo.getStorageStats).mockResolvedValue({
        storage_used_gb: 100,
        storage_limit_gb: 200,
        plan_tier: 'studio',
      })
      const stats = await StudioService.getStorageStats(mockSupabase, 's1')
      expect(stats.usage_pct).toBe(50)
      expect(stats.used_gb).toBe(100)
      expect(stats.limit_gb).toBe(200)
      expect(stats.available_gb).toBe(100)
    })

    it('caps usage_pct at 100 when over limit', async () => {
      vi.mocked(studioRepo.getStorageStats).mockResolvedValue({
        storage_used_gb: 201,
        storage_limit_gb: 200,
        plan_tier: 'studio',
      })
      const stats = await StudioService.getStorageStats(mockSupabase, 's1')
      expect(stats.usage_pct).toBe(100)
    })

    it('status: 79% → ok, 80% → warning, 95% → critical', async () => {
      vi.mocked(studioRepo.getStorageStats)
        .mockResolvedValueOnce({
          storage_used_gb: 79,
          storage_limit_gb: 100,
          plan_tier: 'studio',
        })
        .mockResolvedValueOnce({
          storage_used_gb: 80,
          storage_limit_gb: 100,
          plan_tier: 'studio',
        })
        .mockResolvedValueOnce({
          storage_used_gb: 95,
          storage_limit_gb: 100,
          plan_tier: 'studio',
        })
      const s1 = await StudioService.getStorageStats(mockSupabase, 's1')
      const s2 = await StudioService.getStorageStats(mockSupabase, 's1')
      const s3 = await StudioService.getStorageStats(mockSupabase, 's1')
      expect(s1.status).toBe('ok')
      expect(s2.status).toBe('warning')
      expect(s3.status).toBe('critical')
    })

    it('available_gb is never negative', async () => {
      vi.mocked(studioRepo.getStorageStats).mockResolvedValue({
        storage_used_gb: 250,
        storage_limit_gb: 200,
        plan_tier: 'studio',
      })
      const stats = await StudioService.getStorageStats(mockSupabase, 's1')
      expect(stats.available_gb).toBe(0)
    })
  })

  describe('getOnboardingStatus', () => {
    it('returns all 5 steps even when none completed', async () => {
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: false,
        onboarding_step: 1,
        onboarding_completed_at: null,
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue([])
      const status = await StudioService.getOnboardingStatus(mockSupabase, 's1')
      expect(status.steps).toHaveLength(5)
      expect(status.steps.every((s) => !s.is_completed)).toBe(true)
      expect(status.progress_pct).toBe(0)
      expect(status.is_completed).toBe(false)
      expect(status.current_step).toBe(1)
    })

    it('marks steps completed from events and progress_pct 1 step → 20, 5 → 100', async () => {
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: false,
        onboarding_step: 2,
        onboarding_completed_at: null,
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue([
        {
          step_number: 1,
          step_name: 'basic_info',
          completed_at: '2025-03-15T10:00:00Z',
          skipped: false,
        },
      ] as any)
      const status = await StudioService.getOnboardingStatus(mockSupabase, 's1')
      expect(status.steps[0].is_completed).toBe(true)
      expect(status.steps[0].completed_at).toBe('2025-03-15T10:00:00Z')
      expect(status.progress_pct).toBe(20)
      expect(status.current_step).toBe(2)
    })

    it('is_completed true only when studio.onboarding_completed is true', async () => {
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: true,
        onboarding_step: 5,
        onboarding_completed_at: '2025-03-15T12:00:00Z',
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue(
        [1, 2, 3, 4, 5].map((n) => ({
          step_number: n,
          step_name: `step_${n}`,
          completed_at: '2025-03-15T10:00:00Z',
          skipped: false,
        })) as any
      )
      const status = await StudioService.getOnboardingStatus(mockSupabase, 's1')
      expect(status.is_completed).toBe(true)
      expect(status.progress_pct).toBe(100)
    })
  })

  describe('completeOnboardingStep', () => {
    it('step 0 throws INVALID_STEP', async () => {
      await expect(
        StudioService.completeOnboardingStep(mockSupabase, 's1', 0, {})
      ).rejects.toMatchObject({ code: 'INVALID_STEP', status: 400 })
    })

    it('step 6 throws INVALID_STEP', async () => {
      await expect(
        StudioService.completeOnboardingStep(mockSupabase, 's1', 6, {})
      ).rejects.toMatchObject({ code: 'INVALID_STEP', status: 400 })
    })

    it('step 1 with empty data throws VALIDATION_ERROR', async () => {
      await expect(
        StudioService.completeOnboardingStep(mockSupabase, 's1', 1, {})
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('step 1 with invalid phone throws VALIDATION_ERROR', async () => {
      await expect(
        StudioService.completeOnboardingStep(mockSupabase, 's1', 1, {
          name: 'Ab',
          phone: '123',
          city: 'Mumbai',
          state: 'Maharashtra',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('step 2 with empty data succeeds (all optional)', async () => {
      vi.mocked(studioRepo.updateOnboardingStep).mockResolvedValue({} as any)
      vi.mocked(studioRepo.upsertOnboardingEvent).mockResolvedValue({} as any)
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: false,
        onboarding_step: 3,
        onboarding_completed_at: null,
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue([
        { step_number: 1, completed_at: '', skipped: false },
        { step_number: 2, completed_at: '', skipped: true },
      ] as any)
      const status = await StudioService.completeOnboardingStep(
        mockSupabase,
        's1',
        2,
        {}
      )
      expect(status).toBeDefined()
      expect(studioRepo.upsertOnboardingEvent).toHaveBeenCalled()
      expect(studioRepo.updateOnboardingStep).toHaveBeenCalledWith(
        mockSupabase,
        's1',
        3,
        false
      )
    })

    it('step 5 with no package succeeds and sets onboarding_completed', async () => {
      vi.mocked(studioRepo.upsertOnboardingEvent).mockResolvedValue({} as any)
      vi.mocked(studioRepo.updateOnboardingStep).mockResolvedValue({} as any)
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: true,
        onboarding_step: 5,
        onboarding_completed_at: new Date().toISOString(),
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue([])
      const status = await StudioService.completeOnboardingStep(
        mockSupabase,
        's1',
        5,
        {}
      )
      expect(status.is_completed).toBe(true)
      expect(studioRepo.updateOnboardingStep).toHaveBeenCalledWith(
        mockSupabase,
        's1',
        5,
        true
      )
    })

    it('step 5 with package data creates package and completes onboarding', async () => {
      vi.mocked(packageRepo.create).mockResolvedValue({ id: 'pkg1' } as any)
      vi.mocked(studioRepo.upsertOnboardingEvent).mockResolvedValue({} as any)
      vi.mocked(studioRepo.updateOnboardingStep).mockResolvedValue({} as any)
      vi.mocked(studioRepo.getOnboardingStatus).mockResolvedValue({
        onboarding_completed: true,
        onboarding_step: 5,
        onboarding_completed_at: new Date().toISOString(),
      })
      vi.mocked(studioRepo.getOnboardingEvents).mockResolvedValue([])
      await StudioService.completeOnboardingStep(mockSupabase, 's1', 5, {
        package: {
          name: 'Wedding Basic',
          event_type: 'wedding',
          base_price: '50000.00',
          turnaround_days: 30,
        },
      })
      expect(packageRepo.create).toHaveBeenCalledWith(
        mockSupabase,
        's1',
        expect.objectContaining({
          name: 'Wedding Basic',
          event_type: 'wedding',
          base_price: 50000,
          turnaround_days: 30,
        })
      )
    })
  })
})
