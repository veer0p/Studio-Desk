import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'

export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type BookingRow = Database['public']['Tables']['bookings']['Row']

export const bookingRepo = {
  async getBookings(
    supabase: SupabaseClient<Database>,
    studioId: string,
    params: {
      status?: string
      event_type?: string
      search?: string
      from_date?: string
      to_date?: string
      page: number
      pageSize: number
    }
  ) {
    let query = supabase
      .from('bookings')
      .select(`
        id, title, event_type, event_date, venue_name, status,
        total_amount, amount_paid, amount_pending, advance_amount,
        lead_id, package_id, created_at, updated_at,
        clients:client_id (full_name, phone, email),
        service_packages:package_id (name)
      `, { count: 'exact' })
      .eq('studio_id', studioId)
      .is('deleted_at', null)

    if (params.status) query = query.eq('status', params.status)
    if (params.event_type) query = query.eq('event_type', params.event_type)
    if (params.from_date) query = query.gte('event_date', params.from_date)
    if (params.to_date) query = query.lte('event_date', params.to_date)

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,clients.full_name.ilike.%${params.search}%`)
    }

    const from = params.page * params.pageSize
    const to = from + params.pageSize - 1

    const { data, error, count } = await query
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: data.map(b => ({
        ...b,
        client_name: (b.clients as any)?.full_name,
        client_phone: (b.clients as any)?.phone,
        client_email: (b.clients as any)?.email,
        package_name: (b.service_packages as any)?.name,
        clients: undefined,
        service_packages: undefined
      })),
      count: count || 0
    }
  },

  async getBookingById(supabase: SupabaseClient<Database>, bookingId: string, studioId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients:client_id (full_name, phone, email),
        service_packages:package_id (name)
      `)
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .single()

    if (error) return null

    return {
      ...data,
      client_name: (data.clients as any)?.full_name,
      client_phone: (data.clients as any)?.phone,
      client_email: (data.clients as any)?.email,
      package_name: (data.service_packages as any)?.name,
      clients: undefined,
      service_packages: undefined
    }
  },

  async createBooking(supabase: SupabaseClient<Database>, data: BookingInsert) {
    const { data: row, error } = await supabase
      .from('bookings')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return row
  },

  async updateBooking(supabase: SupabaseClient<Database>, bookingId: string, studioId: string, data: BookingUpdate) {
    const { data: row, error } = await supabase
      .from('bookings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') throw Errors.notFound('Booking')
      throw error
    }
    return row
  },

  async softDeleteBooking(supabase: SupabaseClient<Database>, bookingId: string, studioId: string) {
    const { data: current } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .single()

    if (!current) throw Errors.notFound('Booking')

    const deletableStatuses = ['new_lead', 'contacted', 'lost']
    if (!deletableStatuses.includes(current.status)) {
      throw Errors.conflict('Only new leads and lost bookings can be deleted. Close the booking instead.')
    }

    const { error } = await supabase
      .from('bookings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('studio_id', studioId)

    if (error) throw error
  },

  async updateBookingStatus(supabase: SupabaseClient<Database>, bookingId: string, studioId: string, status: string) {
    const { data: row, error } = await supabase
      .from('bookings')
      .update({ status: status as any, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') throw Errors.notFound('Booking')
      throw error
    }
    return row
  },

  async getActivityFeed(supabase: SupabaseClient<Database>, bookingId: string, studioId: string) {
    const { data, error } = await supabase
      .from('booking_activity_feed')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return data.map((item) => ({
      ...item,
      actor_name: (item as any).actor_name ?? 'System',
    }))
  },

  async logActivity(supabase: SupabaseClient<Database>, data: {
    studio_id: string
    booking_id: string
    event_type: string
    actor_id?: string
    actor_type?: 'member' | 'client' | 'system'
    metadata?: object
  }) {
    // Uses admin level context if possible, but here we just use what's passed
    // Since it's fire-and-forget, we catch errors internally
    supabase
      .from('booking_activity_feed')
      .insert({
        studio_id: data.studio_id,
        booking_id: data.booking_id,
        event_type: data.event_type as any,
        actor_id: data.actor_id,
        actor_type: data.actor_type || 'system',
        metadata: data.metadata || {}
      })
      .then(({ error }) => {
        if (error) console.error('[logActivity] Failed:', error)
      })
  },

  async getBookingsByEventDate(supabase: SupabaseClient<Database>, studioId: string, from: string, to: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, title, event_type, event_date, venue_name, status, client_id')
      .eq('studio_id', studioId)
      .gte('event_date', from)
      .lte('event_date', to)
      .is('deleted_at', null)
      .not('status', 'eq', 'lost')
      .order('event_date', { ascending: true })

    if (error) throw error
    return data
  },

  async getPipelineCounts(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, total_amount')
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .not('status', 'eq', 'lost')

    if (error) throw error

    const stats: Record<string, { count: number, total_value: number }> = {}
    data.forEach(b => {
      if (!stats[b.status]) stats[b.status] = { count: 0, total_value: 0 }
      stats[b.status].count++
      stats[b.status].total_value += b.total_amount
    })

    return stats
  }
}
