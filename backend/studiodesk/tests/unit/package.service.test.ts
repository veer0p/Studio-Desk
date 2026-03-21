import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PackageService } from '@/lib/services/package.service'
import { packageRepo } from '@/lib/repositories/package.repo'

vi.mock('@/lib/repositories/package.repo')
vi.mock('@/lib/logger')

const mockSupabase = {} as any

describe('PackageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPackages', () => {
    it('returns array with gst_amount and total_with_gst computed', async () => {
      vi.mocked(packageRepo.getPackages).mockResolvedValue([
        {
          id: 'p1',
          name: 'Wedding',
          event_type: 'wedding',
          base_price: 85000,
          is_gst_applicable: true,
          hsn_sac_code: '998389',
          deliverables: [],
          turnaround_days: 30,
          line_items: [],
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as any)
      const result = await PackageService.getPackages(mockSupabase, 's1')
      expect(result).toHaveLength(1)
      expect(result[0].base_price).toBe('85000')
      expect(result[0].gst_amount).toBe('15300.00')
      expect(result[0].total_with_gst).toBe('100300.00')
    })

    it('returns gst_amount 0.00 when is_gst_applicable false', async () => {
      vi.mocked(packageRepo.getPackages).mockResolvedValue([
        {
          id: 'p1',
          name: 'Free',
          event_type: 'other',
          base_price: 0,
          is_gst_applicable: false,
          hsn_sac_code: '998389',
          deliverables: [],
          turnaround_days: 7,
          line_items: [],
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as any)
      const result = await PackageService.getPackages(mockSupabase, 's1')
      expect(result[0].gst_amount).toBe('0.00')
      expect(result[0].total_with_gst).toBe('0.00')
    })
  })

  describe('createPackage', () => {
    it('throws VALIDATION_ERROR when base_price is 0', async () => {
      await expect(
        PackageService.createPackage(mockSupabase, 's1', {
          name: 'Pkg',
          event_type: 'wedding',
          base_price: '0',
        } as any)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
      expect(packageRepo.createPackage).not.toHaveBeenCalled()
    })

    it('throws VALIDATION_ERROR when turnaround_days is 0', async () => {
      await expect(
        PackageService.createPackage(mockSupabase, 's1', {
          name: 'Pkg',
          event_type: 'wedding',
          base_price: '10000',
          turnaround_days: 0,
        } as any)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws VALIDATION_ERROR when turnaround_days is 366', async () => {
      await expect(
        PackageService.createPackage(mockSupabase, 's1', {
          name: 'Pkg',
          event_type: 'wedding',
          base_price: '10000',
          turnaround_days: 366,
        } as any)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws VALIDATION_ERROR when deliverables length > 20', async () => {
      await expect(
        PackageService.createPackage(mockSupabase, 's1', {
          name: 'Pkg',
          event_type: 'wedding',
          base_price: '10000',
          deliverables: Array(21).fill('x'),
        } as any)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('calls repo.createPackage with hsn_sac_code default and sort_order', async () => {
      vi.mocked(packageRepo.getNextSortOrder).mockResolvedValue(2)
      vi.mocked(packageRepo.createPackage).mockResolvedValue({
        id: 'new',
        name: 'Pkg',
        event_type: 'wedding',
        base_price: 10000,
        is_gst_applicable: true,
        hsn_sac_code: '998389',
        deliverables: [],
        turnaround_days: 30,
        line_items: [],
        is_active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      await PackageService.createPackage(mockSupabase, 's1', {
        name: 'Pkg',
        event_type: 'wedding',
        base_price: '10000',
      } as any)
      expect(packageRepo.createPackage).toHaveBeenCalledWith(
        mockSupabase,
        's1',
        expect.objectContaining({
          name: 'Pkg',
          event_type: 'wedding',
          hsn_sac_code: '998389',
          sort_order: 2,
        })
      )
    })
  })

  describe('deletePackage', () => {
    it('throws CONFLICT when package linked to active booking', async () => {
      vi.mocked(packageRepo.getPackageById).mockResolvedValue({ id: 'p1' } as any)
      vi.mocked(packageRepo.softDeletePackage).mockRejectedValue(
        new (class extends Error {
          code = 'CONFLICT'
          status = 409
        })('Package is linked to active bookings')
      )
      await expect(
        PackageService.deletePackage(mockSupabase, 'p1', 's1')
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('throws NOT_FOUND when package not found', async () => {
      vi.mocked(packageRepo.getPackageById).mockResolvedValue(null)
      vi.mocked(packageRepo.softDeletePackage).mockRejectedValue(
        new (class extends Error {
          code = 'NOT_FOUND'
          status = 404
        })('Package not found')
      )
      await expect(
        PackageService.deletePackage(mockSupabase, 'p1', 's1')
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('succeeds when package not linked to active bookings', async () => {
      vi.mocked(packageRepo.softDeletePackage).mockResolvedValue(undefined as any)
      await PackageService.deletePackage(mockSupabase, 'p1', 's1')
      expect(packageRepo.softDeletePackage).toHaveBeenCalledWith(mockSupabase, 'p1', 's1')
    })
  })

  describe('getTemplates', () => {
    it('returns exactly 6 templates with is_template true', () => {
      const result = PackageService.getTemplates()
      expect(result).toHaveLength(6)
      result.forEach((t) => {
        expect(t.is_template).toBe(true)
        expect(t.id).toBeDefined()
        expect(t.name).toBeDefined()
        expect(t.base_price).toBeDefined()
      })
    })

    it('does not call repo', () => {
      PackageService.getTemplates()
      expect(packageRepo.getPackages).not.toHaveBeenCalled()
    })
  })

  describe('createAddon', () => {
    it('throws VALIDATION_ERROR when price is 0', async () => {
      await expect(
        PackageService.createAddon(mockSupabase, 's1', {
          name: 'Addon',
          price: '0',
        } as any)
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
      expect(packageRepo.createAddon).not.toHaveBeenCalled()
    })

    it('throws VALIDATION_ERROR when unit is invalid', async () => {
      vi.mocked(packageRepo.createAddon).mockResolvedValue({} as any)
      await expect(
        PackageService.updateAddon(mockSupabase, 'a1', 's1', { unit: 'weekly' as any })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('creates addon with valid data', async () => {
      vi.mocked(packageRepo.createAddon).mockResolvedValue({
        id: 'a1',
        name: 'Drone',
        description: null,
        price: 15000,
        unit: 'flat',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      const result = await PackageService.createAddon(mockSupabase, 's1', {
        name: 'Drone',
        price: '15000',
        unit: 'flat',
      } as any)
      expect(result.price).toBe('15000')
      expect(packageRepo.createAddon).toHaveBeenCalled()
    })
  })
})
