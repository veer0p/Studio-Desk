import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>

const TODAY_SHOOT_SELECT = `
  id, title, event_type, event_date, venue_name, venue_address, status,
  clients:client_id (full_name, phone, whatsapp),
  shoot_briefs!shoot_briefs_booking_id_fkey (
    venue_access_notes, contact_on_day, contact_phone, people_to_capture
  ),
  shoot_assignments!shoot_assignments_booking_id_fkey (
    id, member_id, role, is_confirmed, confirmed_at, call_time, notes, call_location,
    member:studio_members!shoot_assignments_member_id_fkey (
      display_name, phone, whatsapp, profile_photo_url, specialization
    )
  )
`

const UPCOMING_WEEK_SELECT = `
  id, title, event_type, event_date, status,
  clients:client_id (full_name)
`

const ATTENTION_SELECTS = {
  overdueInvoices: 'due_date',
  unsignedContracts: 'sent_at',
  pendingProposals: 'valid_until',
} as const

function money(value: unknown) {
  return Number(value ?? 0)
}

function isoDate(value: unknown) {
  if (!value) return null
  return typeof value === 'string' ? value.slice(0, 10) : new Date(value as Date).toISOString().slice(0, 10)
}

function monthKey(date: string) {
  return `${date.slice(0, 7)}-01`
}

function monthLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T00:00:00.000Z`))
}

function istToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function monthBounds(year: number, month: number) {
  const mm = String(month).padStart(2, '0')
  const endDay = new Date(year, month, 0).getDate()
  return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(endDay).padStart(2, '0')}` }
}

function groupTeam(assignments: any[]) {
  return assignments
    .filter((row) => row?.member)
    .sort((a, b) => String(a.call_time ?? '').localeCompare(String(b.call_time ?? '')))
    .map((row) => ({
      member_id: row.member_id,
      name: row.member.display_name ?? '',
      role: row.role ?? 'assistant',
      status: row.call_location?.includes('"status":"declined"') ? 'declined' : row.is_confirmed ? 'confirmed' : 'pending',
    }))
}

function flattenTodayShoot(row: any) {
  const assignments = Array.isArray(row.shoot_assignments) ? row.shoot_assignments : []
  const brief = Array.isArray(row.shoot_briefs) ? row.shoot_briefs[0] : row.shoot_briefs
  const briefMeta = brief?.people_to_capture && typeof brief.people_to_capture === 'object' ? brief.people_to_capture : {}
  const callTime = assignments
    .map((assignment: any) => assignment.call_time)
    .filter(Boolean)
    .sort((a: string, b: string) => a.localeCompare(b))[0] ?? null

  return {
    id: row.id,
    title: row.title,
    event_type: row.event_type,
    client_name: row.clients?.full_name ?? '',
    client_phone: row.clients?.phone ?? null,
    client_whatsapp: row.clients?.whatsapp ?? null,
    venue_name: row.venue_name ?? null,
    call_time: briefMeta.call_time ?? callTime,
    shoot_start_time: briefMeta.shoot_start_time ?? null,
    shoot_end_time: briefMeta.shoot_end_time ?? null,
    venue_address: brief?.venue_access_notes ?? row.venue_address ?? null,
    venue_map_link: briefMeta.venue_map_link ?? null,
    assigned_team: groupTeam(assignments),
  }
}

async function countAndOldest(
  supabase: Db,
  table: string,
  column: string,
  filters: Array<[string, string, unknown] | [string, string, string, unknown]>,
  oldestColumn?: string
) {
  let query = supabase.from(table).select(column, { count: 'exact' })
  for (const filter of filters) {
    const [method, key, arg2, arg3] = filter as [string, string, unknown, unknown]
    if (method === 'not') {
      query = (query as any).not(key, arg2 as string, arg3)
      continue
    }
    query = (query as any)[method](key, arg2)
  }
  const { data, count, error } = await query.order(column, { ascending: true }).limit(1)
  if (error) throw Errors.validation(`Failed to fetch ${table}`)
  return {
    count: count ?? 0,
    oldest: oldestColumn ? isoDate((data?.[0] as Record<string, unknown> | undefined)?.[oldestColumn]) : isoDate((data?.[0] as Record<string, unknown> | undefined)?.[column]),
  }
}

function aggregateMonthRows(rows: any[]) {
  const byMonth = new Map<string, { month: string; month_start: string; collected: number; pending: number; overdue: number; days_count: number }>()
  for (const row of rows) {
    const start = monthKey(String(row.snapshot_date))
    const current = byMonth.get(start) ?? {
      month: monthLabel(start),
      month_start: start,
      collected: 0,
      pending: 0,
      overdue: 0,
      days_count: 0,
    }
    current.collected += money(row.revenue_collected)
    current.pending += money(row.revenue_pending)
    current.overdue += money(row.revenue_overdue)
    current.days_count += 1
    byMonth.set(start, current)
  }
  return [...byMonth.values()].sort((a, b) => a.month_start.localeCompare(b.month_start))
}

function dateRange(fromDate: string, toDate: string) {
  return { from: `${fromDate}T00:00:00.000Z`, to: `${toDate}T23:59:59.999Z` }
}

export const dashboardRepo = {
  async getTodayShoots(supabase: Db, studioId: string, today: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(TODAY_SHOOT_SELECT)
      .eq('studio_id', studioId)
      .eq('event_date', today)
      .is('deleted_at', null)
      .not('status', 'in', '("lost","closed")')
      .order('title', { ascending: true })
    if (error) throw Errors.validation('Failed to fetch today shoots')
    return (data ?? []).map(flattenTodayShoot)
  },

  async getAttentionItems(supabase: Db, studioId: string) {
    const [invoices, contracts, proposals, galleries, followUps] = await Promise.all([
      countAndOldest(supabase, 'invoices', ATTENTION_SELECTS.overdueInvoices, [
        ['eq', 'studio_id', studioId],
        ['eq', 'status', 'overdue'],
        ['gt', 'amount_due', 0],
      ], 'due_date'),
      countAndOldest(supabase, 'contracts', ATTENTION_SELECTS.unsignedContracts, [
        ['eq', 'studio_id', studioId],
        ['eq', 'status', 'sent'],
      ], 'sent_at'),
      countAndOldest(supabase, 'proposals', ATTENTION_SELECTS.pendingProposals, [
        ['eq', 'studio_id', studioId],
        ['eq', 'status', 'sent'],
        ['gte', 'valid_until', new Date().toISOString().slice(0, 10)],
      ], 'valid_until'),
      countAndOldest(supabase, 'galleries', 'created_at', [
        ['eq', 'studio_id', studioId],
        ['neq', 'status', 'published'],
        ['gt', 'total_photos', 0],
      ]),
      countAndOldest(supabase, 'leads', 'follow_up_at', [
        ['eq', 'studio_id', studioId],
        ['lt', 'follow_up_at', new Date().toISOString()],
        ['not', 'status', 'in', '("closed","lost","contract_signed","advance_paid")'],
      ], 'follow_up_at'),
    ])

    return {
      overdue_invoices: invoices.count,
      unsigned_contracts: contracts.count,
      pending_proposals: proposals.count,
      galleries_ready: galleries.count,
      overdue_followups: followUps.count,
      oldest_invoice_date: invoices.oldest,
      oldest_contract_date: contracts.oldest,
    }
  },

  async getMonthSnapshot(supabase: Db, studioId: string, year: number, month: number) {
    const bounds = monthBounds(year, month)
    const { data, error } = await supabase
      .from('revenue_snapshots')
      .select('*')
      .eq('studio_id', studioId)
      .gte('snapshot_date', bounds.start)
      .lte('snapshot_date', bounds.end)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch month snapshot')
    return data ? this.mapSnapshot(data) : null
  },

  async getTodaySnapshot(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('revenue_snapshots')
      .select('*')
      .eq('studio_id', studioId)
      .eq('snapshot_date', istToday())
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch today snapshot')
    return data ? this.mapSnapshot(data) : null
  },

  async getUpcomingWeekShoots(supabase: Db, studioId: string, from: string, to: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`${UPCOMING_WEEK_SELECT}, venue_name`)
      .eq('studio_id', studioId)
      .gte('event_date', from)
      .lte('event_date', to)
      .is('deleted_at', null)
      .not('status', 'in', '("lost","closed")')
      .order('event_date', { ascending: true })
      .limit(20)
    if (error) throw Errors.validation('Failed to fetch upcoming shoots')
    return (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      event_type: row.event_type,
      event_date: row.event_date,
      venue_name: row.venue_name ?? null,
      status: row.status,
      client_name: row.clients?.full_name ?? '',
    }))
  },

  async getRevenueChartData(supabase: Db, studioId: string, months: number) {
    const from = new Date()
    from.setMonth(from.getMonth() - months)
    const { data, error } = await supabase
      .from('revenue_snapshots')
      .select('snapshot_date, revenue_collected')
      .eq('studio_id', studioId)
      .gte('snapshot_date', from.toISOString().slice(0, 10))
      .order('snapshot_date', { ascending: true })
    if (error) throw Errors.validation('Failed to fetch revenue chart data')
    return aggregateMonthRows((data ?? []).map((row: any) => ({
      snapshot_date: row.snapshot_date,
      revenue_collected: row.revenue_collected,
      revenue_pending: 0,
      revenue_overdue: 0,
    })))
  },

  async getBookingFunnelData(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .eq('studio_id', studioId)
      .gte('created_at', dateRange(fromDate, toDate).from)
      .lte('created_at', dateRange(fromDate, toDate).to)
    if (error) throw Errors.validation('Failed to fetch booking funnel')
    return (data ?? []).reduce((acc: Record<string, number>, row: any) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    }, {})
  },

  async getBookingCount(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .gte('created_at', dateRange(fromDate, toDate).from)
      .lte('created_at', dateRange(fromDate, toDate).to)
      .is('deleted_at', null)
    if (error) throw Errors.validation('Failed to fetch booking count')
    return count ?? 0
  },

  async getLeadSourceData(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('source, converted_to_booking')
      .eq('studio_id', studioId)
      .gte('created_at', dateRange(fromDate, toDate).from)
      .lte('created_at', dateRange(fromDate, toDate).to)
    if (error) throw Errors.validation('Failed to fetch lead sources')
    const bySource = new Map<string, { source: string; count: number; converted: number }>()
    for (const row of data ?? []) {
      const current = bySource.get(row.source) ?? { source: row.source, count: 0, converted: 0 }
      current.count += 1
      current.converted += row.converted_to_booking ? 1 : 0
      bySource.set(row.source, current)
    }
    return [...bySource.values()].sort((a, b) => b.count - a.count)
  },

  async getEventTypeData(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('event_type, total_amount')
      .eq('studio_id', studioId)
      .gte('event_date', fromDate)
      .lte('event_date', toDate)
      .is('deleted_at', null)
      .not('status', 'in', '("lost")')
    if (error) throw Errors.validation('Failed to fetch event types')
    const byType = new Map<string, { event_type: string; count: number; revenue: number }>()
    for (const row of data ?? []) {
      const current = byType.get(row.event_type) ?? { event_type: row.event_type, count: 0, revenue: 0 }
      current.count += 1
      current.revenue += money(row.total_amount)
      byType.set(row.event_type, current)
    }
    return [...byType.values()].sort((a, b) => b.revenue - a.revenue)
  },

  async getTeamPerformanceData(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const [membersRes, assignmentsRes] = await Promise.all([
      supabase.from('studio_members').select('id, display_name, role').eq('studio_id', studioId).eq('is_active', true),
      supabase
        .from('shoot_assignments')
        .select(`
          id, member_id, role, is_confirmed, call_location,
          booking:bookings!shoot_assignments_booking_id_fkey (event_date, deleted_at)
        `)
        .eq('studio_id', studioId)
        .order('created_at', { ascending: true }),
    ])
    if (membersRes.error || assignmentsRes.error) throw Errors.validation('Failed to fetch team performance')
    const byMember = new Map<string, { member_id: string; display_name: string; role: string; shoots_assigned: number; shoots_confirmed: number; shoots_declined: number }>()
    for (const member of membersRes.data ?? []) {
      byMember.set(member.id, {
        member_id: member.id,
        display_name: member.display_name ?? '',
        role: member.role ?? 'assistant',
        shoots_assigned: 0,
        shoots_confirmed: 0,
        shoots_declined: 0,
      })
    }
    for (const row of assignmentsRes.data ?? []) {
      const eventDate = row.booking?.event_date
      if (!eventDate || eventDate < fromDate || eventDate > toDate || row.booking?.deleted_at) continue
      const current = byMember.get(row.member_id) ?? {
        member_id: row.member_id,
        display_name: '',
        role: row.role ?? 'assistant',
        shoots_assigned: 0,
        shoots_confirmed: 0,
        shoots_declined: 0,
      }
      current.shoots_assigned += 1
      current.shoots_confirmed += row.is_confirmed ? 1 : 0
      current.shoots_declined += typeof row.call_location === 'string' && row.call_location.includes('"status":"declined"') ? 1 : 0
      byMember.set(row.member_id, current)
    }
    return [...byMember.values()].sort((a, b) => b.shoots_assigned - a.shoots_assigned)
  },

  async getGalleryDeliveryStats(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from('galleries')
      .select('status, is_published, published_at, created_at, view_count, download_count')
      .eq('studio_id', studioId)
      .gte('created_at', `${fromDate}T00:00:00.000Z`)
      .lte('created_at', `${toDate}T23:59:59.999Z`)
    if (error) throw Errors.validation('Failed to fetch gallery stats')
    const delivered = (data ?? []).filter((row: any) => row.is_published || row.status === 'published')
    const pending = (data ?? []).filter((row: any) => !row.is_published && row.status !== 'published')
    const avgDays = delivered.length
      ? delivered.reduce((sum: number, row: any) => sum + ((new Date(row.published_at).getTime() - new Date(row.created_at).getTime()) / 86400000), 0) / delivered.length
      : 0
    return {
      delivered: delivered.length,
      pending: pending.length,
      avg_delivery_days: Number(avgDays.toFixed(1)),
      total_views: (data ?? []).reduce((sum: number, row: any) => sum + money(row.view_count), 0),
      total_downloads: (data ?? []).reduce((sum: number, row: any) => sum + money(row.download_count), 0),
    }
  },

  async getActiveStudios(supabase: Db) {
    const { data, error } = await supabase
      .from('studios')
      .select('id')
      .eq('is_active', true)
      .eq('subscription_status', 'active')
    if (error) throw Errors.validation('Failed to fetch studios')
    return (data ?? []).map((row: any) => row.id as string)
  },

  async upsertRevenueSnapshot(supabase: Db, studioId: string, snapshotDate: string, payload: Record<string, unknown>) {
    const { error } = await supabase
      .from('revenue_snapshots')
      .upsert({ studio_id: studioId, snapshot_date: snapshotDate, ...payload }, { onConflict: 'studio_id,snapshot_date' })
    if (error) throw Errors.validation('Failed to save revenue snapshot')
  },

  mapSnapshot(row: any) {
    return {
      id: row.id,
      studio_id: row.studio_id,
      snapshot_date: isoDate(row.snapshot_date),
      total_bookings: Number(row.total_bookings ?? 0),
      new_leads: Number(row.new_leads ?? 0),
      invoices_sent: Number(row.invoices_sent ?? 0),
      revenue_collected: money(row.revenue_collected),
      revenue_pending: money(row.revenue_pending),
      photos_delivered: Number(row.photos_delivered ?? 0),
      storage_used_gb: Number(row.storage_used_gb ?? 0),
      created_at: row.created_at,
    }
  },
}
