import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { Errors } from '@/lib/errors'
import { dashboardRepo } from '@/lib/repositories/dashboard.repo'

type Db = SupabaseClient<any>
type Role = 'owner' | 'photographer' | 'videographer' | 'editor' | 'assistant'

export const revenueQuerySchema = z.object({
  months: z.coerce.number().refine((v) => [3, 6, 12, 24].includes(v), {
    message: 'months must be 3, 6, 12, or 24',
  }).default(12),
  compare: z.coerce.boolean().default(false),
})

export const analyticsQuerySchema = z.object({
  period: z.enum(['this_month', 'last_month', 'this_quarter', 'this_fy', 'last_fy']).default('this_month'),
})

const STAGES = ['new_lead', 'contacted', 'proposal_sent', 'contract_signed', 'advance_paid', 'shoot_scheduled', 'delivered', 'closed', 'lost']
const SEVERITY_ORDER = { red: 0, amber: 1, blue: 2 } as const

function istDate(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function getDatePlusDays(dateStr: string, days: number) {
  const next = new Date(`${dateStr}T00:00:00.000Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

function dayDiff(dateStr?: string | null) {
  if (!dateStr) return 0
  const start = new Date(String(dateStr).slice(0, 10))
  const end = new Date(`${istDate()}T00:00:00.000Z`)
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
}

function money(value?: string | number | null) {
  const numeric = Number(value ?? 0)
  return numeric.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function numeric(value?: string | number | null) {
  return Number(value ?? 0)
}

function greeting(memberName?: string) {
  const hour = new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' })
  const hourInt = Number(hour)
  const timeOfDay = hourInt < 12 ? 'morning' : hourInt < 17 ? 'afternoon' : 'evening'
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
  return { name: memberName ?? 'Studio', date, time_of_day: timeOfDay as 'morning' | 'afternoon' | 'evening' }
}

function buildAttention(items: any) {
  const next = [] as Array<Record<string, string>>
  if (items.overdue_invoices > 0) {
    next.push({
      type: 'overdue_invoice',
      severity: 'red',
      title: `${items.overdue_invoices} invoice${items.overdue_invoices > 1 ? 's' : ''} overdue`,
      subtitle: `Oldest: ${dayDiff(items.oldest_invoice_date)} days ago`,
      action_url: '/finance?status=overdue',
    })
  }
  if (items.unsigned_contracts > 0) {
    next.push({
      type: 'unsigned_contract',
      severity: 'amber',
      title: `${items.unsigned_contracts} contract${items.unsigned_contracts > 1 ? 's' : ''} awaiting signature`,
      subtitle: `Sent ${dayDiff(items.oldest_contract_date)} days ago`,
      action_url: '/bookings?filter=contracts',
    })
  }
  if (items.galleries_ready > 0) {
    next.push({
      type: 'gallery_ready',
      severity: 'blue',
      title: `${items.galleries_ready} ${items.galleries_ready > 1 ? 'galleries' : 'gallery'} ready to publish`,
      subtitle: 'Photos uploaded, ready to share',
      action_url: '/gallery',
    })
  }
  if (items.pending_proposals > 0) {
    next.push({
      type: 'pending_proposal',
      severity: 'amber',
      title: `${items.pending_proposals} proposal${items.pending_proposals > 1 ? 's' : ''} awaiting response`,
      subtitle: 'Client review pending',
      action_url: '/proposals',
    })
  }
  if (items.overdue_followups > 0) {
    next.push({
      type: 'overdue_followup',
      severity: 'blue',
      title: `${items.overdue_followups} lead follow-up${items.overdue_followups > 1 ? 's' : ''} overdue`,
      subtitle: 'Follow up with warm leads today',
      action_url: '/leads',
    })
  }
  return next
    .sort((a, b) => SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] - SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER])
    .slice(0, 5)
}

function mapUpcomingWeek(today: string, rows: any[]) {
  const byDate = new Map(rows.map((row) => [row.event_date, [] as any[]]))
  for (let i = 0; i < 7; i += 1) {
    const date = getDatePlusDays(today, i)
    if (!byDate.has(date)) byDate.set(date, [])
  }
  for (const row of rows) {
    byDate.get(row.event_date)?.push({
      id: row.id,
      title: row.title,
      event_type: row.event_type,
      client_name: row.client_name,
    })
  }
  return {
    days: [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, bookings]) => ({
      date,
      day_label: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${date}T00:00:00.000Z`)),
      date_label: date.slice(-2),
      is_today: date === today,
      shoot_count: bookings.length,
      bookings,
    })),
  }
}

function getDateRange(period: z.infer<typeof analyticsQuerySchema>['period']) {
  const now = new Date()
  const today = istDate(now)
  const month = now.getMonth()
  const year = now.getFullYear()
  if (period === 'this_month') return { from: new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10), to: today }
  if (period === 'last_month') return { from: new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10), to: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10) }
  if (period === 'this_quarter') {
    const qMonth = Math.floor(month / 3) * 3
    return { from: new Date(Date.UTC(year, qMonth, 1)).toISOString().slice(0, 10), to: today }
  }
  const fyYear = month >= 3 ? year : year - 1
  if (period === 'this_fy') return { from: new Date(Date.UTC(fyYear, 3, 1)).toISOString().slice(0, 10), to: today }
  return { from: new Date(Date.UTC(fyYear - 1, 3, 1)).toISOString().slice(0, 10), to: new Date(Date.UTC(fyYear, 2, 31)).toISOString().slice(0, 10) }
}

async function calcSnapshot(db: Db, studioId: string, today: string) {
  const [activeBookings, newLeads, payments, invoicesSent, deliveredGalleries, snapshot] = await Promise.all([
    db.from('bookings').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).is('deleted_at', null),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).gte('created_at', `${today}T00:00:00.000Z`).lte('created_at', `${today}T23:59:59.999Z`),
    db.from('payments').select('amount').eq('studio_id', studioId).eq('status', 'captured').gte('captured_at', `${today}T00:00:00.000Z`).lte('captured_at', `${today}T23:59:59.999Z`),
    db.from('invoices').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).gte('sent_at', `${today}T00:00:00.000Z`).lte('sent_at', `${today}T23:59:59.999Z`),
    db.from('galleries').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).gte('published_at', `${today}T00:00:00.000Z`).lte('published_at', `${today}T23:59:59.999Z`),
    db.from('revenue_snapshots').select('storage_used_gb').eq('studio_id', studioId).eq('snapshot_date', today).maybeSingle(),
  ])
  return {
    total_bookings: activeBookings.count ?? 0,
    new_leads: newLeads.count ?? 0,
    invoices_sent: invoicesSent.count ?? 0,
    revenue_collected: (payments.data ?? []).reduce((sum, row: any) => sum + numeric(row.amount), 0),
    photos_delivered: deliveredGalleries.count ?? 0,
    storage_used_gb: numeric(snapshot.data?.storage_used_gb),
  }
}

export const DashboardService = {
  getDateRange,

  async getDashboardOverview(supabase: Db, studioId: string, memberName?: string) {
    const today = istDate()
    const now = new Date()
    const [todaySnapshot, monthSnapshot, attentionItems, upcomingWeek] = await Promise.all([
      dashboardRepo.getTodaySnapshot(supabase, studioId),
      dashboardRepo.getMonthSnapshot(supabase, studioId, now.getFullYear(), now.getMonth() + 1),
      dashboardRepo.getAttentionItems(supabase, studioId),
      dashboardRepo.getUpcomingWeekShoots(supabase, studioId, today, getDatePlusDays(today, 6)),
    ])
    return {
      greeting: greeting(memberName),
      attention_items: buildAttention(attentionItems),
      this_month: {
        revenue_collected: money(monthSnapshot?.revenue_collected ?? todaySnapshot?.revenue_collected),
        revenue_pending: money(monthSnapshot?.revenue_pending ?? todaySnapshot?.revenue_pending),
        revenue_overdue: money(0),
        total_bookings: Number(monthSnapshot?.total_bookings ?? todaySnapshot?.total_bookings ?? 0),
        new_leads: Number(monthSnapshot?.new_leads ?? todaySnapshot?.new_leads ?? 0),
        is_estimated: !monthSnapshot,
      },
      upcoming_week: mapUpcomingWeek(today, upcomingWeek),
    }
  },

  async getTodayDetail(supabase: Db, studioId: string, memberId?: string, role: Role = 'owner') {
    const today = istDate()
    const shoots = await dashboardRepo.getTodayShoots(supabase, studioId, today)
    const filtered = role === 'owner' ? shoots : shoots.filter((row: any) => row.assigned_team.some((member: any) => member.member_id === memberId))
    return {
      date: today,
      shoot_count: filtered.length,
      has_shoots: filtered.length > 0,
      shoots: filtered.map((row: any) => ({
        id: row.id,
        title: row.title,
        event_type: row.event_type,
        client_name: row.client_name,
        client_phone: row.client_phone,
        client_whatsapp: row.client_whatsapp,
        venue_name: row.venue_name,
        call_time: row.call_time,
        shoot_start_time: row.shoot_start_time,
        shoot_end_time: row.shoot_end_time,
        venue_address: row.venue_address,
        venue_map_link: row.venue_map_link,
        assigned_team: row.assigned_team.map(({ member_id: _memberId, ...team }: any) => team),
      })),
    }
  },

  async getRevenueAnalytics(supabase: Db, studioId: string, params: z.infer<typeof revenueQuerySchema>) {
    if (![3, 6, 12, 24].includes(params.months)) throw Errors.validation('months must be 3, 6, 12, or 24')
    const chartData = await dashboardRepo.getRevenueChartData(supabase, studioId, params.months)
    const totalCollected = chartData.reduce((sum: number, row: any) => sum + numeric(row.collected), 0)
    const totalPending = chartData.reduce((sum: number, row: any) => sum + numeric(row.pending), 0)
    const best = [...chartData].sort((a: any, b: any) => numeric(b.collected) - numeric(a.collected))[0]
    const last = chartData.at(-1)
    const prev = chartData.at(-2)
    const prevValue = numeric(prev?.collected)
    const growth = prevValue === 0 ? 0 : Number((((numeric(last?.collected) - prevValue) / prevValue) * 100).toFixed(1))
    return {
      period_months: params.months,
      total_collected: money(totalCollected),
      total_pending: money(totalPending),
      best_month: best ? { month: best.month, amount: money(best.collected) } : null,
      growth_pct: growth,
      chart_data: chartData.map((row: any) => ({
        month: row.month,
        collected: numeric(row.collected),
        pending: numeric(row.pending),
        overdue: numeric(row.overdue),
      })),
    }
  },

  async getBookingAnalytics(supabase: Db, studioId: string, params: z.infer<typeof analyticsQuerySchema>) {
    const range = getDateRange(params.period)
    const [funnelRows, sources, eventTypes, bookingCount] = await Promise.all([
      dashboardRepo.getBookingFunnelData(supabase, studioId, range.from, range.to),
      dashboardRepo.getLeadSourceData(supabase, studioId, range.from, range.to),
      dashboardRepo.getEventTypeData(supabase, studioId, range.from, range.to),
      dashboardRepo.getBookingCount(supabase, studioId, range.from, range.to),
    ])
    const funnel = Object.fromEntries(STAGES.map((stage) => [stage, Number(funnelRows[stage] ?? 0)]))
    const totalLeads = Object.values(funnel).reduce((sum, count) => sum + Number(count), 0)
    const converted = ['contract_signed', 'advance_paid', 'shoot_scheduled', 'delivered', 'closed'].reduce((sum, key) => sum + Number(funnel[key] ?? 0), 0)
    return {
      period: params.period,
      total_leads: totalLeads,
      total_bookings: bookingCount,
      conversion_rate_pct: totalLeads === 0 ? 0 : Number(((converted / totalLeads) * 100).toFixed(1)),
      funnel,
      by_source: sources.map((row: any) => ({
        source: row.source,
        count: row.count,
        converted: row.converted,
        conversion_pct: row.count === 0 ? 0 : Number(((row.converted / row.count) * 100).toFixed(1)),
      })),
      by_event_type: eventTypes.map((row: any) => ({
        event_type: row.event_type,
        count: row.count,
        revenue: money(row.revenue),
        avg_value: money(row.count === 0 ? 0 : numeric(row.revenue) / row.count),
      })),
    }
  },

  async getPerformanceAnalytics(supabase: Db, studioId: string, params: z.infer<typeof analyticsQuerySchema>) {
    const range = getDateRange(params.period)
    const [team, gallery] = await Promise.all([
      dashboardRepo.getTeamPerformanceData(supabase, studioId, range.from, range.to),
      dashboardRepo.getGalleryDeliveryStats(supabase, studioId, range.from, range.to),
    ])
    return {
      period: params.period,
      gallery: {
        delivered: gallery.delivered,
        pending: gallery.pending,
        avg_delivery_days: Number(Number(gallery.avg_delivery_days ?? 0).toFixed(1)),
        total_views: gallery.total_views,
        total_downloads: gallery.total_downloads,
      },
      team: team.map((row: any) => ({
        member_id: row.member_id,
        display_name: row.display_name,
        role: row.role,
        shoots_assigned: row.shoots_assigned,
        shoots_confirmed: row.shoots_confirmed,
        shoots_declined: row.shoots_declined,
        confirmation_rate_pct: row.shoots_assigned === 0 ? 0 : Number(((row.shoots_confirmed / row.shoots_assigned) * 100).toFixed(1)),
      })),
    }
  },

  async runDailySnapshot(supabase: Db) {
    const today = istDate()
    const studioIds = await dashboardRepo.getActiveStudios(supabase)
    for (let index = 0; index < studioIds.length; index += 10) {
      const chunk = studioIds.slice(index, index + 10)
      await Promise.all(chunk.map(async (studioId) => {
        const payload = await calcSnapshot(supabase, studioId, today)
        await dashboardRepo.upsertRevenueSnapshot(supabase, studioId, today, payload)
      }))
    }
    return { processed: studioIds.length, date: today }
  },
}
