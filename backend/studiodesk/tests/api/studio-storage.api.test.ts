import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import * as route from '@/app/api/v1/studio/storage/route'
import { requireAuth } from '@/lib/auth/guards'
import { StudioService } from '@/lib/services/studio.service'

vi.mock('@/lib/auth/guards')
vi.mock('@/lib/services/studio.service')
vi.mock('@/lib/logger')

describe('API: GET /api/v1/studio/storage', () => {
  const mockMember = { studio_id: 's1', role: 'owner' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without auth', async () => {
    vi.mocked(requireAuth).mockRejectedValue({
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    })
    await testApiHandler({
      appHandler: route,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(401)
      },
    })
  })

  it('returns 200 with correct StorageStats shape', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'u1' },
      member: mockMember,
      supabase: {},
    } as any)
    vi.mocked(StudioService.getStorageStats).mockResolvedValue({
      used_gb: 12.5,
      limit_gb: 200,
      available_gb: 187.5,
      usage_pct: 6.3,
      status: 'ok',
      plan_tier: 'studio',
    } as any)
    await testApiHandler({
      appHandler: route,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data).toMatchObject({
          used_gb: 12.5,
          limit_gb: 200,
          available_gb: 187.5,
          usage_pct: 6.3,
          plan_tier: 'studio',
        })
        expect(['ok', 'warning', 'critical']).toContain(json.data.status)
        expect(res.headers.get('Cache-Control')).toBe('no-store')
      },
    })
  })

  it('status field is one of ok, warning, critical', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'u1' },
      member: mockMember,
      supabase: {},
    } as any)
    vi.mocked(StudioService.getStorageStats).mockResolvedValue({
      used_gb: 95,
      limit_gb: 100,
      available_gb: 5,
      usage_pct: 95,
      status: 'critical',
      plan_tier: 'studio',
    } as any)
    await testApiHandler({
      appHandler: route,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' })
        const json = await res.json()
        expect(json.data.status).toBe('critical')
      },
    })
  })
})
