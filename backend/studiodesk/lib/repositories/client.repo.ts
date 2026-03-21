import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'

type ClientsInsert = Database['public']['Tables']['clients']['Insert']

const CLIENT_LIST_COLUMNS =
  'id, full_name, email, phone, whatsapp, city, state, company_name, gstin, tags, created_at, updated_at'
const CLIENT_DETAIL_COLUMNS =
  'id, full_name, email, phone, whatsapp, address, city, state, state_id, pincode, company_name, gstin, notes, tags, created_at, updated_at'

export const clientRepo = {
  async getClients(
    supabase: any,
    studioId: string,
    params: { search?: string; page: number; pageSize: number }
  ) {
    let q = supabase
      .from('clients')
      .select(CLIENT_LIST_COLUMNS, { count: 'exact' })
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (params.search?.trim()) {
      const s = `%${params.search.trim()}%`
      q = q.or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`)
    }

    const from = params.page * params.pageSize
    const to = from + params.pageSize - 1
    const { data, count, error } = await q.range(from, to)

    if (error) throw Errors.validation('Failed to fetch clients')
    return { data: (data ?? []) as Array<any>, count: count ?? 0 }
  },

  async getClientById(
    supabase: any,
    clientId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('clients')
      .select(CLIENT_DETAIL_COLUMNS)
      .eq('id', clientId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch client')
    return data
  },

  async getClientByPhone(
    supabase: any,
    phone: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, full_name, phone, email')
      .eq('phone', phone)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch client by phone')
    return data
  },

  async getClientBookingHistory(
    supabase: any,
    clientId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, title, event_type, event_date, status, total_amount, amount_paid, amount_pending')
      .eq('client_id', clientId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .order('event_date', { ascending: false })

    if (error) throw Errors.validation('Failed to fetch booking history')
    return (data ?? []) as Array<any>
  },

  async getClientStats(
    supabase: any,
    clientId: string,
    studioId: string
  ): Promise<{ total_bookings: number; total_revenue: number; total_paid: number }> {
    const base = supabase
      .from('bookings')
      .select('id, total_amount, amount_paid')
      .eq('client_id', clientId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)

    const [countRes, rowsRes] = await Promise.all([
      (supabase as any).from('bookings').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('studio_id', studioId).is('deleted_at', null),
      base,
    ])

    const count = countRes.count ?? 0
    const rows = (rowsRes.data ?? []) as Array<{ total_amount?: number; amount_paid?: number }>
    const total_revenue = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0)
    const total_paid = rows.reduce((s, r) => s + Number(r.amount_paid ?? 0), 0)
    return { total_bookings: count, total_revenue, total_paid }
  },

  async createClient(
    supabase: any,
    studioId: string,
    data: Omit<ClientsInsert, 'id' | 'studio_id'>
  ) {
    const { data: row, error } = await supabase
      .from('clients')
      .insert({ studio_id: studioId, ...data } as ClientsInsert)
      .select(CLIENT_LIST_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to create client')
    return row as any
  },

  async updateClient(
    supabase: any,
    clientId: string,
    studioId: string,
    data: Partial<Omit<ClientsInsert, 'id' | 'studio_id'>>
  ) {
    const existing = await this.getClientById(supabase, clientId, studioId)
    if (!existing) throw Errors.notFound('Client')

    const { data: row, error } = await supabase
      .from('clients')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)
      .select(CLIENT_LIST_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to update client')
    return row as any
  },

  async softDeleteClient(
    supabase: any,
    clientId: string,
    studioId: string
  ) {
    const { data: active } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('client_id', clientId)
      .eq('studio_id', studioId)
      .is('deleted_at', null)

    const hasActive = (active ?? []).some((b: { status?: string }) => b.status !== 'closed' && b.status !== 'lost')
    if (hasActive) {
      throw Errors.conflict('Client has active bookings and cannot be deleted')
    }

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete client')
  },
}
