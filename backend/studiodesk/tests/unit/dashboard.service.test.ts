import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardService } from '@/lib/services/dashboard.service'
import { dashboardRepo } from '@/lib/repositories/dashboard.repo'

vi.mock('@/lib/repositories/dashboard.repo', () => ({
  dashboardRepo: {
    getTodaySnapshot: vi.fn(),
    getMonthSnapshot: vi.fn(),
    getAttentionItems: vi.fn(),
    getUpcomingWeekShoots: vi.fn(),
    getTodayShoots: vi.fn(),
    getRevenueChartData: vi.fn(),
    getBookingFunnelData: vi.fn(),
    getLeadSourceData: vi.fn(),
    getEventTypeData: vi.fn(),
    getBookingCount: vi.fn(),
    getTeamPerformanceData: vi.fn(),
    getGalleryDeliveryStats: vi.fn(),
    getActiveStudios: vi.fn(),
    upsertRevenueSnapshot: vi.fn(),
  },
}))

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds overview with sorted attention items and estimated fallback', async () => {
    vi.mocked(dashboardRepo.getTodaySnapshot).mockResolvedValue(null)
    vi.mocked(dashboardRepo.getMonthSnapshot).mockResolvedValue(null)
    vi.mocked(dashboardRepo.getUpcomingWeekShoots).mockResolvedValue([])
    vi.mocked(dashboardRepo.getAttentionItems).mockResolvedValue({
      overdue_invoices: 3,
      unsigned_contracts: 2,
      pending_proposals: 1,
      galleries_ready: 4,
      overdue_followups: 2,
      oldest_invoice_date: '2026-03-15',
      oldest_contract_date: '2026-03-17',
    } as any)

    const result = await DashboardService.getDashboardOverview({} as any, 'studio-1', 'Arjun')

    expect(dashboardRepo.getTodaySnapshot).toHaveBeenCalled()
    expect(dashboardRepo.getMonthSnapshot).toHaveBeenCalled()
    expect(dashboardRepo.getAttentionItems).toHaveBeenCalled()
    expect(dashboardRepo.getUpcomingWeekShoots).toHaveBeenCalled()
    expect(result.attention_items).toHaveLength(5)
    expect(result.attention_items[0].severity).toBe('red')
    expect(result.attention_items[1].severity).toBe('amber')
    expect(result.this_month.is_estimated).toBe(true)
    expect(result.upcoming_week.days).toHaveLength(7)
  })

  it('uses snapshot values when available', async () => {
    vi.mocked(dashboardRepo.getTodaySnapshot).mockResolvedValue(null)
    vi.mocked(dashboardRepo.getMonthSnapshot).mockResolvedValue({
      revenue_month_start: '', days_count: 30, collected: 240000,
      revenue_pending: 80000,
      total_bookings: 12,
      new_leads: 8,
    } as any)
    vi.mocked(dashboardRepo.getAttentionItems).mockResolvedValue({
      overdue_invoices: 0,
      unsigned_contracts: 0,
      pending_proposals: 0,
      galleries_ready: 0,
      overdue_followups: 0,
      oldest_invoice_date: null,
      oldest_contract_date: null,
    } as any)
    vi.mocked(dashboardRepo.getUpcomingWeekShoots).mockResolvedValue([])

    const result = await DashboardService.getDashboardOverview({} as any, 'studio-1')
    expect(result.attention_items).toEqual([])
    expect(result.this_month.is_estimated).toBe(false)
    expect(result.this_month.total_bookings).toBe(12)
  })

  it('filters today detail by role', async () => {
    vi.mocked(dashboardRepo.getTodayShoots).mockResolvedValue([
      {
        id: 'booking-1',
        title: 'Wedding',
        event_type: 'wedding',
        client_name: 'Priya',
        client_phone: '1',
        client_whatsapp: '1',
        venue_name: 'Venue',
        call_time: '08:00',
        shoot_start_time: '09:00',
        shoot_end_time: '20:00',
        venue_address: 'Address',
        venue_map_link: 'https://maps.example',
        assigned_team: [{ member_id: 'member-1', name: 'Raj', role: 'photographer', status: 'confirmed' }],
      },
      {
        id: 'booking-2',
        title: 'Portrait',
        event_type: 'portrait',
        client_name: 'Dev',
        client_phone: null,
        client_whatsapp: null,
        venue_name: null,
        call_time: null,
        shoot_start_time: null,
        shoot_end_time: null,
        venue_address: null,
        venue_map_link: null,
        assigned_team: [{ member_id: 'member-2', name: 'Amit', role: 'videographer', status: 'pending' }],
      },
    ])

    const owner = await DashboardService.getTodayDetail({} as any, 'studio-1', 'member-1', 'owner')
    const photographer = await DashboardService.getTodayDetail({} as any, 'studio-1', 'member-1', 'photographer')

    expect(owner.shoot_count).toBe(2)
    expect(photographer.shoot_count).toBe(1)
    expect(photographer.shoots[0].assigned_team[0]).not.toHaveProperty('member_id')
  })

  it('computes revenue analytics and handles invalid month inputs', async () => {
    await expect(DashboardService.getRevenueAnalytics({} as any, 'studio-1', { months: 7, compare: false } as any)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    })

    vi.mocked(dashboardRepo.getRevenueChartData).mockResolvedValue([
      { month: 'Jan 2026', month_start: '', days_count: 30, collected: 100000, pending: 20000, overdue: 0 },
      { month: 'Feb 2026', month_start: '', days_count: 30, collected: 120000, pending: 10000, overdue: 5000 },
    ])

    const result = await DashboardService.getRevenueAnalytics({} as any, 'studio-1', { months: 12, compare: false })
    expect(result.total_collected).toBeTruthy()
    expect(result.best_month?.month).toBe('Feb 2026')
    expect(result.growth_pct).toBe(20)
    expect(result.chart_data[0]).toMatchObject({ month: 'Jan 2026', month_start: '', days_count: 30, collected: 100000, pending: 20000 })
  })

  it('computes booking analytics with zero-safe conversion and full funnel keys', async () => {
    vi.mocked(dashboardRepo.getBookingFunnelData).mockResolvedValue({ proposal_sent: 5, advance_paid: 2 } as any)
    vi.mocked(dashboardRepo.getLeadSourceData).mockResolvedValue([{ source: 'referral', count: 3, converted: 2 }])
    vi.mocked(dashboardRepo.getEventTypeData).mockResolvedValue([{ event_type: 'wedding', count: 2, revenue: 170000 }])
    vi.mocked(dashboardRepo.getBookingCount).mockResolvedValue(2)

    const result = await DashboardService.getBookingAnalytics({} as any, 'studio-1', { period: 'this_month' })
    expect(result.funnel.new_lead).toBe(0)
    expect(result.funnel.proposal_sent).toBe(5)
    expect(result.conversion_rate_pct).toBeGreaterThan(0)

    vi.mocked(dashboardRepo.getBookingFunnelData).mockResolvedValue({})
    vi.mocked(dashboardRepo.getLeadSourceData).mockResolvedValue([])
    vi.mocked(dashboardRepo.getEventTypeData).mockResolvedValue([])
    vi.mocked(dashboardRepo.getBookingCount).mockResolvedValue(0)
    const empty = await DashboardService.getBookingAnalytics({} as any, 'studio-1', { period: 'this_month' })
    expect(empty.conversion_rate_pct).toBe(0)
  })

  it('computes performance analytics and date ranges', async () => {
    vi.mocked(dashboardRepo.getTeamPerformanceData).mockResolvedValue([
      { member_id: 'm1', display_name: 'Raj', role: 'photographer', shoots_assigned: 12, shoots_confirmed: 11, shoots_declined: 1 },
    ])
    vi.mocked(dashboardRepo.getGalleryDeliveryStats).mockResolvedValue({
      delivered: 8,
      pending: 3,
      avg_delivery_days: 12.49,
      total_views: 450,
      total_downloads: 1200,
    } as any)

    const result = await DashboardService.getPerformanceAnalytics({} as any, 'studio-1', { period: 'this_month' })
    expect(result.gallery.avg_delivery_days).toBe(12.5)
    expect(result.team[0].confirmation_rate_pct).toBe(91.7)

    expect(DashboardService.getDateRange('this_month').from.endsWith('-01')).toBe(true)
    expect(DashboardService.getDateRange('this_fy').from.slice(5)).toBe('04-01')
    expect(DashboardService.getDateRange('last_fy').to.slice(5)).toBe('03-31')
  })
})
