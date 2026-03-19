import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

const SUMMARY_SELECT = `
  id, booking_id, client_id, template_id, status, sent_at, viewed_at, signed_at,
  reminder_sent_at, created_at, updated_at,
  bookings:booking_id (title, event_type, event_date),
  clients:client_id (full_name, phone, email)
`

const DETAIL_SELECT = `
  id, studio_id, booking_id, client_id, template_id, status, content_html, notes,
  sent_at, viewed_at, signed_at, reminder_sent_at, access_token, signed_ip,
  signed_user_agent, signed_pdf_url, created_at, updated_at,
  bookings:booking_id (title, event_type, event_date),
  clients:client_id (full_name, phone, email)
`

const TOKEN_SELECT = `
  id, studio_id, booking_id, client_id, template_id, status, content_html, signed_at,
  signature_data, signed_ip, signed_user_agent, sent_at, viewed_at, reminder_sent_at,
  access_token, signed_pdf_url, notes, created_at, updated_at,
  studio:studios (name, logo_url, brand_color, phone, email, gstin),
  client:clients (full_name, email, phone, whatsapp),
  booking:bookings (title, event_type, event_date, venue_name)
`

const TEMPLATE_SELECT =
  'id, studio_id, name, event_type, content_html, version, is_default, is_active, created_at, updated_at'

function flattenContract(row: any) {
  return {
    ...row,
    booking_title: row.bookings?.title ?? row.booking?.title ?? '',
    event_type: row.bookings?.event_type ?? row.booking?.event_type ?? null,
    event_date: row.bookings?.event_date ?? row.booking?.event_date ?? null,
    venue_name: row.booking?.venue_name ?? null,
    client_name: row.clients?.full_name ?? row.client?.full_name ?? '',
    client_phone: row.clients?.phone ?? row.client?.phone ?? null,
    client_email: row.clients?.email ?? row.client?.email ?? null,
    studio_name: row.studio?.name ?? '',
    studio_logo_url: row.studio?.logo_url ?? null,
    studio_brand_color: row.studio?.brand_color ?? null,
    studio_phone: row.studio?.phone ?? null,
    studio_email: row.studio?.email ?? null,
    studio_gstin: row.studio?.gstin ?? null,
  }
}

async function getContractStatus(
  supabase: SupabaseClient<any>,
  contractId: string,
  studioId: string
) {
  const { data, error } = await supabase
    .from('contracts')
    .select('status')
    .eq('id', contractId)
    .eq('studio_id', studioId)
    .maybeSingle()

  if (error) throw Errors.validation('Failed to fetch contract')
  return data as { status: string } | null
}

export const contractRepo = {
  async getContracts(
    supabase: SupabaseClient<any>,
    studioId: string,
    params: { status?: string; booking_id?: string; page: number; pageSize: number }
  ) {
    let query = supabase.from('contracts').select(SUMMARY_SELECT, { count: 'exact' }).eq('studio_id', studioId)
    if (params.status) query = query.eq('status', params.status)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)

    if (error) throw Errors.validation('Failed to fetch contracts')
    return { data: (data ?? []).map(flattenContract), count: count ?? 0 }
  },

  async getContractById(supabase: SupabaseClient<any>, contractId: string, studioId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(DETAIL_SELECT)
      .eq('id', contractId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch contract')
    return data ? flattenContract(data) : null
  },

  async getContractByToken(supabase: SupabaseClient<any>, token: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(TOKEN_SELECT)
      .eq('access_token', token)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch contract')
    return data ? flattenContract(data) : null
  },

  async createContract(supabase: SupabaseClient<any>, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('contracts')
      .insert(data)
      .select('id, access_token')
      .single()

    if (error) throw Errors.validation('Failed to create contract')
    return row as { id: string; access_token: string }
  },

  async updateContract(
    supabase: SupabaseClient<any>,
    contractId: string,
    studioId: string,
    data: Record<string, unknown>
  ) {
    const current = await getContractStatus(supabase, contractId, studioId)
    if (!current) throw Errors.notFound('Contract')
    if (current.status !== 'draft') {
      throw Errors.conflict('Sent and signed contracts cannot be edited.')
    }
    const { data: row, error } = await supabase
      .from('contracts')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', contractId)
      .eq('studio_id', studioId)
      .select('id')
      .single()

    if (error || !row) throw Errors.validation('Failed to update contract')
    return row
  },

  async markContractSent(supabase: SupabaseClient<any>, contractId: string) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'sent', sent_at: now, updated_at: now })
      .eq('id', contractId)
      .select('id')
      .single()

    if (error || !data) throw Errors.validation('Failed to update contract')
    return data
  },

  async markContractViewed(supabase: SupabaseClient<any>, contractId: string) {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('contracts')
      .update({ viewed_at: now, updated_at: now })
      .eq('id', contractId)
      .is('viewed_at', null)

    if (error) throw Errors.validation('Failed to update contract')
  },

  async markContractSigned(
    supabase: SupabaseClient<any>,
    contractId: string,
    signatureData: string,
    ipAddress: string,
    userAgent: string
  ) {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: signatureData,
        signed_ip: ipAddress,
        signed_user_agent: userAgent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .eq('status', 'sent')
      .select('id, booking_id, signed_at')
      .maybeSingle()

    if (error) throw Errors.validation('Failed to sign contract')
    if (!data) {
      throw Errors.conflict('Contract cannot be signed in its current state')
    }
    return data as { id: string; booking_id: string; signed_at: string }
  },

  async updateReminderSent(supabase: SupabaseClient<any>, contractId: string) {
    const remindedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('contracts')
      .update({ reminder_sent_at: remindedAt, updated_at: remindedAt })
      .eq('id', contractId)
      .select('reminder_sent_at')
      .single()

    if (error) throw Errors.validation('Failed to update reminder')
    return data as { reminder_sent_at: string }
  },

  async softDeleteContract(supabase: SupabaseClient<any>, contractId: string, studioId: string) {
    const current = await getContractStatus(supabase, contractId, studioId)
    if (!current) throw Errors.notFound('Contract')
    if (current.status !== 'draft') {
      throw Errors.conflict('Only draft contracts can be deleted')
    }
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete contract')
  },

  async getTemplates(supabase: SupabaseClient<any>, studioId: string) {
    const { data, error } = await supabase
      .from('contract_templates')
      .select(TEMPLATE_SELECT)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('event_type', { ascending: true, nullsLast: true })

    if (error) throw Errors.validation('Failed to fetch contract templates')
    return data ?? []
  },

  async getTemplateById(supabase: SupabaseClient<any>, templateId: string, studioId: string) {
    const { data, error } = await supabase
      .from('contract_templates')
      .select(TEMPLATE_SELECT)
      .eq('id', templateId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch contract template')
    return data
  },

  async createTemplate(supabase: SupabaseClient<any>, data: Record<string, unknown>) {
    if (data.is_default) {
      await supabase
        .from('contract_templates')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('studio_id', data.studio_id)
    }
    const { data: row, error } = await supabase
      .from('contract_templates')
      .insert(data)
      .select(TEMPLATE_SELECT)
      .single()

    if (error) throw Errors.validation('Failed to create contract template')
    return row
  },

  async updateTemplate(
    supabase: SupabaseClient<any>,
    templateId: string,
    studioId: string,
    data: Record<string, unknown>
  ) {
    const current = await this.getTemplateById(supabase, templateId, studioId)
    if (!current) throw Errors.notFound('Contract template')
    if (data.is_default) {
      await supabase
        .from('contract_templates')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('studio_id', studioId)
        .neq('id', templateId)
    }
    const { data: row, error } = await supabase
      .from('contract_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', templateId)
      .eq('studio_id', studioId)
      .select(TEMPLATE_SELECT)
      .single()

    if (error || !row) throw Errors.validation('Failed to update contract template')
    return row
  },

  async softDeleteTemplate(supabase: SupabaseClient<any>, templateId: string, studioId: string) {
    const { count, error: countError } = await supabase
      .from('contracts')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .eq('template_id', templateId)
      .eq('status', 'draft')

    if (countError) throw Errors.validation('Failed to check contract template usage')
    if ((count ?? 0) > 0) {
      throw Errors.conflict('Template is used by draft contracts. Delete those contracts first.')
    }
    const { error } = await supabase
      .from('contract_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', templateId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete contract template')
  },

  async getDefaultTemplate(supabase: SupabaseClient<any>, studioId: string, eventType: string | null) {
    const { data, error } = await supabase
      .from('contract_templates')
      .select(TEMPLATE_SELECT)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .or(eventType ? `event_type.eq.${eventType},event_type.is.null` : 'event_type.is.null')
      .order('event_type', { ascending: false, nullsLast: true })
      .order('is_default', { ascending: false })
      .limit(10)

    if (error) throw Errors.validation('Failed to fetch contract template')
    if (!data?.length) return null
    return data.sort((a: any, b: any) => {
      const aRank = a.event_type === eventType ? 0 : 1
      const bRank = b.event_type === eventType ? 0 : 1
      if (aRank !== bRank) return aRank - bRank
      return Number(Boolean(b.is_default)) - Number(Boolean(a.is_default))
    })[0]
  },

  async ensureDefaultTemplates(
    supabase: SupabaseClient<any>,
    studioId: string,
    templates: Array<Record<string, unknown>>
  ) {
    const { count, error } = await supabase
      .from('contract_templates')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to check contract templates')
    if ((count ?? 0) > 0) return
    const { error: insertError } = await supabase
      .from('contract_templates')
      .insert(templates.map((template) => ({ studio_id: studioId, ...template })))

    if (insertError) throw Errors.validation('Failed to seed contract templates')
  },
}
