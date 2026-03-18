import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import * as onboardingRoute from '@/app/api/v1/studio/onboarding/route'
import * as stepRoute from '@/app/api/v1/studio/onboarding/[step]/route'
import { ServiceError } from '@/lib/errors'
import { requireAuth } from '@/lib/auth/guards'
import { StudioService } from '@/lib/services/studio.service'

vi.mock('@/lib/auth/guards')
vi.mock('@/lib/services/studio.service')
vi.mock('@/lib/logger')

describe('API: /api/v1/studio/onboarding', () => {
  const mockMember = { studio_id: 's1', role: 'owner' }
  const mockStatus = {
    is_completed: false,
    current_step: 1,
    progress_pct: 0,
    steps: [1, 2, 3, 4, 5].map((n) => ({
      step_number: n,
      step_name: `step_${n}`,
      label: `Step ${n}`,
      is_completed: false,
      completed_at: null,
      skipped: false,
    })),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(StudioService.getOnboardingStatus).mockResolvedValue(mockStatus as any)
  })

  describe('GET /onboarding', () => {
    it('returns 401 without auth', async () => {
      vi.mocked(requireAuth).mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      })
      await testApiHandler({
        appHandler: onboardingRoute,
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(401)
        },
      })
    })

    it('returns 200 with all 5 steps in response', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      await testApiHandler({
        appHandler: onboardingRoute,
        async test({ fetch }) {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.steps).toHaveLength(5)
          expect(json.data.current_step).toBeDefined()
          expect(json.data.progress_pct).toBeDefined()
        },
      })
    })
  })

  describe('POST /onboarding/:step', () => {
    it('POST /onboarding/1 returns 401 without auth', async () => {
      vi.mocked(requireAuth).mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      })
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '1' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {} }),
          })
          expect(res.status).toBe(401)
        },
      })
    })

    it('POST /onboarding/0 returns 400 INVALID_STEP', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '0' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {} }),
          })
          expect(res.status).toBe(400)
          const json = await res.json()
          expect(json.code).toBe('INVALID_STEP')
        },
      })
    })

    it('POST /onboarding/6 returns 400 INVALID_STEP', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '6' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {} }),
          })
          expect(res.status).toBe(400)
          const json = await res.json()
          expect(json.code).toBe('INVALID_STEP')
        },
      })
    })

    it.skip('POST /onboarding/1 returns 400 when name missing', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      vi.mocked(StudioService.completeOnboardingStep).mockRejectedValue(
        new ServiceError('Step 1 requires name, phone, city, state', 'VALIDATION_ERROR', 400)
      )
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '1' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: { phone: '9876543210', city: 'Mumbai', state: 'Maharashtra' },
            }),
          })
          const json = await res.json()
          expect(res.status).toBe(400)
          expect(json.code).toBe('VALIDATION_ERROR')
        },
      })
    })

    it.skip('POST /onboarding/1 200 with valid data returns updated status', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      const updatedStatus = {
        ...mockStatus,
        current_step: 2,
        progress_pct: 20,
        steps: mockStatus.steps.map((s, i) =>
          i === 0 ? { ...s, is_completed: true, completed_at: new Date().toISOString() } : s
        ),
      }
      vi.mocked(StudioService.completeOnboardingStep).mockResolvedValue(updatedStatus as any)
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '1' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                name: 'Test Studio',
                phone: '9876543210',
                city: 'Mumbai',
                state: 'Maharashtra',
              },
            }),
          })
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.current_step).toBe(2)
          expect(json.data.progress_pct).toBe(20)
        },
      })
    })

    it('POST /onboarding/2 200 with empty data succeeds (optional step)', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      const updatedStatus = {
        ...mockStatus,
        current_step: 3,
        progress_pct: 40,
      }
      vi.mocked(StudioService.completeOnboardingStep).mockResolvedValue(updatedStatus as any)
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '2' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {} }),
          })
          expect(res.status).toBe(200)
        },
      })
    })

    it('POST /onboarding/5 200 returns is_completed true in response', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'u1' },
        member: mockMember,
        supabase: {},
      } as any)
      const completedStatus = {
        ...mockStatus,
        is_completed: true,
        current_step: 5,
        progress_pct: 100,
      }
      vi.mocked(StudioService.completeOnboardingStep).mockResolvedValue(completedStatus as any)
      await testApiHandler({
        appHandler: stepRoute,
        params: { step: '5' },
        async test({ fetch }) {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {} }),
          })
          expect(res.status).toBe(200)
          const json = await res.json()
          expect(json.data.is_completed).toBe(true)
        },
      })
    })
  })
})
