import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'

export type ProposalRow = Database['public']['Tables']['proposals']['Row']
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert']
export type ProposalUpdate = Database['public']['Tables']['proposals']['Update']
export type ProposalLineItemRow = Database['public']['Tables']['proposal_line_items']['Row']
export type ProposalLineItemInsert = Database['public']['Tables']['proposal_line_items']['Insert']

const PROPOSAL_SUMMARY_COLUMNS = `
  id, booking_id, client_id, version, status,
  subtotal, total_amount, valid_until,
  sent_at, viewed_at, accepted_at, created_at,
  bookings:booking_id (title, event_type, event_date),
  clients:client_id (full_name, phone)
`

const PROPOSAL_DETAIL_COLUMNS = `
  *,
  bookings:booking_id (title, event_type, event_date),
  clients:client_id (full_name, phone)
`

export const proposalRepo = {
  async getProposals(
    supabase: any,
    studioId: string,
    params: {
      status?: string
      booking_id?: string
      page: number
      pageSize: number
    }
  ) {
    let query = supabase
      .from('proposals')
      .select(PROPOSAL_SUMMARY_COLUMNS, { count: 'exact' })
      .eq('studio_id', studioId)

    if (params.status) query = query.eq('status', params.status)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)

    if (error) throw error

    return {
      data: (data || []).map((row: any) => ({
        ...row,
        booking_title: row.bookings?.title,
        event_type: row.bookings?.event_type,
        event_date: row.bookings?.event_date,
        client_name: row.clients?.full_name,
        client_phone: row.clients?.phone,
        // Remove nested objects after flattening
        bookings: undefined,
        clients: undefined,
      })),
      count: count || 0,
    }
  },

  async getProposalById(supabase: any, proposalId: string, studioId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .select(PROPOSAL_DETAIL_COLUMNS)
      .eq('id', proposalId)
      .eq('studio_id', studioId)
      .single()

    if (error || !data) return null

    const row = data as any
    return {
      ...row,
      booking_title: row.bookings?.title,
      event_type: row.bookings?.event_type,
      event_date: row.bookings?.event_date,
      client_name: row.clients?.full_name,
      client_phone: row.clients?.phone,
      bookings: undefined,
      clients: undefined,
    }
  },

  async getProposalLineItems(supabase: any, proposalId: string) {
    const { data, error } = await supabase
      .from('proposal_line_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getProposalByToken(supabase: any, token: string) {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        studio:studios (name, logo_url, brand_color, phone, email),
        client:clients (full_name),
        booking:bookings (title, event_type, event_date, venue_name)
      `)
      .eq('access_token', token)
      .single()

    if (error || !data) return null

    const row = data as any
    return {
      ...row,
      studio: row.studio,
      client_name: row.client?.full_name,
      booking: row.booking,
    }
  },

  async createProposal(supabase: any, data: ProposalInsert) {
    const { data: created, error } = await supabase
      .from('proposals')
      .insert(data as any)
      .select('id, access_token')
      .single()

    if (error) throw error
    return created
  },

  async createLineItems(supabase: any, items: ProposalLineItemInsert[]) {
    const { data, error } = await supabase
      .from('proposal_line_items')
      .insert(items)
      .select()

    if (error) throw error
    return data
  },

  async updateProposal(
    supabase: any,
    proposalId: string,
    studioId: string,
    data: ProposalUpdate
  ) {
    const { data: updated, error } = await supabase
      .from('proposals')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .eq('studio_id', studioId)
      .select()
      .single()

    if (error || !updated) throw Errors.notFound('Proposal')
    return updated as ProposalRow
  },

  async deleteLineItems(supabase: any, proposalId: string) {
    const { error } = await supabase
      .from('proposal_line_items')
      .delete()
      .eq('proposal_id', proposalId)

    if (error) throw error
  },

  async softDeleteProposal(supabase: any, proposalId: string, studioId: string) {
    // 1. Check status first
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('status')
      .eq('id', proposalId)
      .eq('studio_id', studioId)
      .single()

    if (fetchError || !proposal) throw Errors.notFound('Proposal')
    if (proposal.status !== 'draft') {
      throw Errors.conflict('Only draft proposals can be deleted. Sent proposals cannot be deleted.')
    }

    // 2. Hard delete for drafts as per rules (no financial record yet)
    const { error: deleteItemsError } = await supabase
      .from('proposal_line_items')
      .delete()
      .eq('proposal_id', proposalId)
    
    if (deleteItemsError) throw deleteItemsError

    const { error: deleteError } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposalId)
      .eq('studio_id', studioId)

    if (deleteError) throw deleteError
  },

  async markProposalSent(supabase: any, proposalId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single()

    if (error) throw error
    return data as ProposalRow
  },

  async markProposalViewed(supabase: any, proposalId: string) {
    const { error } = await supabase
      .from('proposals')
      .update({
        viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .is('viewed_at', null)

    if (error) throw error
  },

  async markProposalAccepted(supabase: any, proposalId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .eq('status', 'sent')
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') throw Errors.conflict('Only sent proposals can be accepted')
      throw error
    }
    return data as ProposalRow
  },

  async markProposalRejected(supabase: any, proposalId: string, reason?: string) {
    const { error } = await supabase
      .from('proposals')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .eq('status', 'sent')

    if (error) throw error
  },

  async checkExpiredProposals(supabase: any, studioId: string) {
    const { error } = await supabase
      .from('proposals')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('studio_id', studioId)
      .eq('status', 'sent')
      .lt('valid_until', new Date().toISOString().split('T')[0])

    if (error) throw error
  },
}
