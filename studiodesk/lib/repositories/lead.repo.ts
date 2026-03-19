import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { Errors } from '@/lib/errors'

type LeadsInsert = Database['public']['Tables']['leads']['Insert']

const LEAD_LIST_SELECT =
  'id, event_type, event_date_approx, venue, budget_min, budget_max, status, source, priority, follow_up_at, last_contacted_at, converted_to_booking, booking_id, notes, created_at, updated_at, client_id'

export const leadRepo = {
  async getLeads(
    supabase: SupabaseClient<Database>,
    studioId: string,
    params: {
      status?: string
      source?: string
      event_type?: string
      assigned_to?: string
      search?: string
      from_date?: string
      to_date?: string
      page: number
      pageSize: number
    }
  ) {
    let clientIds: string[] | null = null
    if (params.search?.trim()) {
      const s = `*${params.search.trim()}*`
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('studio_id', studioId)
        .is('deleted_at', null)
        .or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`)
      clientIds = (clients ?? []).map((c: { id: string }) => c.id)
      if (clientIds.length === 0) return { data: [], count: 0 }
    }

    let q = supabase
      .from('leads')
      .select(`${LEAD_LIST_SELECT}, clients(full_name, phone, email, whatsapp)`, { count: 'exact' })
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false })

    if (clientIds) q = q.in('client_id', clientIds)
    if (params.status) q = q.eq('status', params.status)
    if (params.source) q = q.eq('source', params.source)
    if (params.event_type) q = q.eq('event_type', params.event_type)
    if (params.assigned_to) q = q.eq('assigned_to', params.assigned_to)
    if (params.from_date) q = q.gte('event_date_approx', params.from_date)
    if (params.to_date) q = q.lte('event_date_approx', params.to_date)

    const from = params.page * params.pageSize
    const to = from + params.pageSize - 1
    const { data, count, error } = await q.range(from, to)

    if (error) throw Errors.validation('Failed to fetch leads')
    return { data: (data ?? []) as Array<Record<string, unknown>>, count: count ?? 0 }
  },

  async getLeadById(
    supabase: SupabaseClient<Database>,
    leadId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('leads')
      .select('*, clients(full_name, phone, email, whatsapp, id)')
      .eq('id', leadId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch lead')
    return data
  },

  async createLead(supabase: SupabaseClient<Database>, data: LeadsInsert) {
    const { data: row, error } = await supabase
      .from('leads')
      .insert(data)
      .select()
      .single()

    if (error) throw Errors.validation('Failed to create lead')
    return row as Record<string, unknown>
  },

  async updateLead(
    supabase: SupabaseClient<Database>,
    leadId: string,
    studioId: string,
    data: Partial<Omit<LeadsInsert, 'id' | 'studio_id'>>
  ) {
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (!existing) throw Errors.notFound('Lead')

    const update: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
    if (data.status !== undefined) {
      update.last_contacted_at = new Date().toISOString()
    }

    const { data: row, error } = await supabase
      .from('leads')
      .update(update)
      .eq('id', leadId)
      .eq('studio_id', studioId)
      .select()
      .single()

    if (error) throw Errors.validation('Failed to update lead')
    return row as Record<string, unknown>
  },

  async softDeleteLead(
    supabase: SupabaseClient<Database>,
    leadId: string,
    studioId: string
  ) {
    const { data: lead } = await supabase
      .from('leads')
      .select('id, converted_to_booking')
      .eq('id', leadId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (!lead) throw Errors.notFound('Lead')
    if ((lead as { converted_to_booking?: boolean }).converted_to_booking) {
      throw Errors.conflict('Converted leads cannot be deleted')
    }

    const { error } = await supabase
      .from('leads')
      .update({ status: 'lost', updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete lead')
  },

  async markLeadConverted(
    supabase: SupabaseClient<Database>,
    leadId: string,
    bookingId: string,
    studioId?: string
  ) {
    let q = supabase
      .from('leads')
      .update({
        converted_to_booking: true,
        booking_id: bookingId,
        status: 'contract_signed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
    if (studioId) q = q.eq('studio_id', studioId)
    const { error } = await q

    if (error) throw Errors.validation(`Failed to mark lead converted: ${error.message}`)
  },

  async getLeadCountByStatus(
    supabase: SupabaseClient<Database>,
    studioId: string
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('leads')
      .select('status')
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to fetch lead counts')
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const s = (row as { status: string }).status ?? 'unknown'
      counts[s] = (counts[s] ?? 0) + 1
    }
    return counts
  },
}
