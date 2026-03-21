import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { leadRepo } from '@/lib/repositories/lead.repo'
import { clientRepo } from '@/lib/repositories/client.repo'
import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'
import { logError } from '@/lib/logger'
import type {
  CreateLeadInput,
  UpdateLeadInput,
  ConvertLeadInput,
  InquiryFormInput,
} from '@/lib/validations/lead.schema'

const PRIORITY_MAP: Record<number, string> = { 1: 'high', 2: 'medium', 3: 'low' }
const PRIORITY_REVERSE: Record<string, number> = { high: 1, medium: 2, low: 3 }

const STATUS_ORDER: Record<string, number> = {
  new_lead: 0, contacted: 1, proposal_sent: 2, contract_signed: 3,
  advance_paid: 4, shoot_scheduled: 5, delivered: 6, closed: 7, lost: -1,
}

export interface LeadSummary {
  id: string
  status: string
  source: string
  priority: string
  event_type: string | null
  event_date_approx: string | null
  venue: string | null
  budget_min: string | null
  budget_max: string | null
  follow_up_at: string | null
  last_contacted_at: string | null
  converted_to_booking: boolean
  booking_id: string | null
  notes: string | null
  days_since_created: number
  client: { full_name: string; phone: string | null; email: string | null; whatsapp: string | null }
  created_at: string
  updated_at: string
}

export interface LeadDetail extends LeadSummary {
  form_data: unknown
  assignee_name?: string | null
}

function dateStr(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v)
  return s.slice(0, 10) || null
}

function mapLeadListRow(row: Record<string, unknown>): LeadSummary {
  const clients = row.clients as Record<string, unknown> | undefined
  const created = row.created_at ? new Date(row.created_at as string) : new Date()
  const days = Math.floor((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000))
  const priorityNum = Number(row.priority ?? 2)
  return {
    id: String(row.id),
    status: String(row.status ?? ''),
    source: String(row.source ?? ''),
    priority: PRIORITY_MAP[priorityNum] ?? 'medium',
    event_type: row.event_type != null ? String(row.event_type) : null,
    event_date_approx: dateStr(row.event_date_approx),
    venue: row.venue != null ? String(row.venue) : null,
    budget_min: row.budget_min != null ? String(row.budget_min) : null,
    budget_max: row.budget_max != null ? String(row.budget_max) : null,
    follow_up_at: row.follow_up_at ? new Date(row.follow_up_at as string).toISOString() : null,
    last_contacted_at: row.last_contacted_at ? new Date(row.last_contacted_at as string).toISOString() : null,
    converted_to_booking: Boolean(row.converted_to_booking),
    booking_id: row.booking_id != null ? String(row.booking_id) : null,
    notes: row.notes != null ? String(row.notes) : null,
    days_since_created: days,
    client: {
      full_name: clients?.full_name != null ? String(clients.full_name) : '',
      phone: clients?.phone != null ? String(clients.phone) : null,
      email: clients?.email != null ? String(clients.email) : null,
      whatsapp: clients?.whatsapp != null ? String(clients.whatsapp) : null,
    },
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : '',
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : '',
  }
}

function formatEventType(et: string | null): string {
  if (!et) return 'Event'
  return et.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export const LeadService = {
  async getLeads(
    supabase: any,
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
    const { data, count } = await leadRepo.getLeads(supabase, studioId, params)
    return { data: data.map((r) => mapLeadListRow(r)), count }
  },

  async getLeadById(
    supabase: any,
    leadId: string,
    studioId: string
  ): Promise<LeadDetail> {
    const row = await leadRepo.getLeadById(supabase, leadId, studioId)
    if (!row) throw Errors.notFound('Lead')
    const r = row as Record<string, unknown>
    const base = mapLeadListRow(r)
    const created = r.created_at ? new Date(r.created_at as string) : new Date()
    const days = Math.floor((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000))
    return {
      ...base,
      days_since_created: days,
      form_data: r.form_data ?? null,
    }
  },

  async createLeadManual(
    supabase: any,
    studioId: string,
    data: CreateLeadInput
  ): Promise<LeadDetail> {
    let clientId: string

    if (data.client_id) {
      const client = await clientRepo.getClientById(supabase, data.client_id, studioId)
      if (!client) throw Errors.validation('Client not found')
      clientId = data.client_id
    } else {
      const existing = await clientRepo.getClientByPhone(supabase, data.phone, studioId)
      if (existing) {
        clientId = (existing as { id: string }).id
      } else {
        const created = await clientRepo.createClient(supabase, studioId, {
          full_name: data.full_name,
          phone: data.phone,
          email: data.email ?? null,
          whatsapp: data.whatsapp ?? null,
        } as any)
        clientId = (created as { id: string }).id
      }
    }

    const priorityNum = PRIORITY_REVERSE[data.priority ?? 'medium'] ?? 2
    const row = await leadRepo.createLead(supabase, {
      studio_id: studioId,
      client_id: clientId,
      event_type: (data.event_type as any) ?? null,
      event_date_approx: data.event_date_approx ? new Date(data.event_date_approx) : null,
      venue: data.venue ?? null,
      budget_min: data.budget_min != null ? parseFloat(data.budget_min) : null,
      budget_max: data.budget_max != null ? parseFloat(data.budget_max) : null,
      status: 'new_lead',
      source: (data.source as any) ?? 'phone',
      priority: priorityNum,
      notes: data.notes ?? null,
      form_data: {},
      assigned_to: data.assigned_to ?? null,
    } as any)

    return this.getLeadById(supabase, (row as { id: string }).id, studioId)
  },

  async processInquiryForm(
    studioSlug: string,
    formData: InquiryFormInput,
    ipAddress: string
  ): Promise<{ lead_id: string }> {
    const admin = createAdminClient()

    const { data: studio } = await (admin.from('studios') as any).select('id, name').eq('slug', studioSlug).eq('is_active', true).is('deleted_at', null).maybeSingle()
    if (!studio) throw Errors.notFound('Studio')

    const rateKey = `inquiry:${studioSlug}:${ipAddress}`
    const { checkInquiryRateLimit } = await import('@/lib/rate-limit')
    await checkInquiryRateLimit(rateKey)

    let clientId: string
    const existing = await clientRepo.getClientByPhone(admin, formData.phone, (studio as { id: string }).id)
    if (existing) {
      clientId = (existing as { id: string }).id
    } else {
      const created = await clientRepo.createClient(admin, (studio as { id: string }).id, {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email ?? null,
        whatsapp: formData.phone,
      } as any)
      clientId = (created as { id: string }).id
    }

    const sanitized = { ...formData }
    if (typeof sanitized.message === 'string') {
      sanitized.message = sanitized.message.replace(/<[^>]*>/g, '').slice(0, 1000)
    }

    // @ts-expect-error: residual strict constraint
    const row = await leadRepo.createLead(admin, {
      studio_id: (studio as { id: string }).id,
      client_id: clientId,
      event_type: (formData.event_type as any) ?? 'other',
      event_date_approx: formData.event_date ? new Date(formData.event_date) : null,
      venue: formData.venue ?? null,
      budget_min: formData.budget_min != null ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max != null ? parseFloat(formData.budget_max) : null,
      status: 'new_lead',
      source: 'inquiry_form',
      priority: 2,
      form_data: sanitized as any,
    } as any)

    (admin.from('automation_log') as any)
      .insert({
        studio_id: (studio as { id: string }).id,
        // @ts-expect-error: residual strict constraint
        lead_id: (row as { id: string }).id,
        automation_type: 'lead_acknowledgment',
        channel: 'email',
        status: 'sent',
      })
      .then(({ error }: any) => {
        if (error) logError({ message: '[LeadService] automation_log insert failed', context: { error: String(error) } }).catch(() => {})
      })

    return { lead_id: (row as { id: string }).id }
  },

  async updateLead(
    supabase: any,
    leadId: string,
    studioId: string,
    data: UpdateLeadInput
  ): Promise<LeadDetail> {
    if (data.status != null) {
      const current = await leadRepo.getLeadById(supabase, leadId, studioId)
      if (current) {
        const cur = (current as { status: string }).status
        const next = data.status
        if (next !== 'lost') {
          const curOrder = STATUS_ORDER[cur] ?? -2
          const nextOrder = STATUS_ORDER[next] ?? -2
          if (nextOrder >= 0 && curOrder >= 0 && nextOrder < curOrder) {
            throw Errors.validation('Invalid status transition')
          }
        }
      }
    }
    if (data.follow_up_at) {
      const d = new Date(data.follow_up_at)
      if (d <= new Date()) throw Errors.validation('follow_up_at must be a future date')
    }

    const payload: Record<string, unknown> = {}
    if (data.status != null) payload.status = data.status
    if (data.priority != null) payload.priority = PRIORITY_REVERSE[data.priority] ?? 2
    if (data.event_date_approx != null) payload.event_date_approx = new Date(data.event_date_approx)
    if (data.venue != null) payload.venue = data.venue
    if (data.budget_min != null) payload.budget_min = parseFloat(data.budget_min)
    if (data.budget_max != null) payload.budget_max = parseFloat(data.budget_max)
    if (data.follow_up_at != null) payload.follow_up_at = new Date(data.follow_up_at)
    if (data.notes != null) payload.notes = data.notes
    if (data.assigned_to !== undefined) payload.assigned_to = data.assigned_to

    await leadRepo.updateLead(supabase, leadId, studioId, payload as any)
    return this.getLeadById(supabase, leadId, studioId)
  },

  async deleteLead(
    supabase: any,
    leadId: string,
    studioId: string
  ): Promise<void> {
    await leadRepo.softDeleteLead(supabase, leadId, studioId)
  },

  async convertLeadToBooking(
    supabase: any,
    leadId: string,
    studioId: string,
    data: ConvertLeadInput,
    userId: string
  ): Promise<{ booking_id: string }> {
    const lead = await leadRepo.getLeadById(supabase, leadId, studioId)
    if (!lead) throw Errors.notFound('Lead')
    const l = lead as Record<string, unknown>
    if (l.converted_to_booking) throw Errors.conflict('Lead already converted to a booking')
    if (l.status === 'lost') throw Errors.conflict('Lost leads cannot be converted')

    const clientId = l.client_id as string
    const clients = l.clients as Record<string, unknown> | undefined
    const clientName = clients?.full_name != null ? String(clients.full_name) : 'Client'
    const eventType = (l.event_type as string) ?? 'other'
    const eventDateApprox = l.event_date_approx ? new Date(l.event_date_approx as string) : new Date(data.event_date)

    const title = data.title ?? `${clientName} - ${formatEventType(eventType)}`
    const eventDate = data.event_date ? new Date(data.event_date) : eventDateApprox
    const totalAmount = data.total_amount != null ? parseFloat(data.total_amount) : 0
    const advanceAmount = data.advance_amount != null ? parseFloat(data.advance_amount) : 0

    // Insert only non-generated columns (balance_amount, amount_pending, gst_total are GENERATED ALWAYS in DB).
    const admin = createAdminClient()
    const { data: booking, error: insertErr } = await (admin.from('bookings') as any)
      .insert({
        studio_id: studioId,
        client_id: clientId,
        lead_id: leadId,
        title,
        event_type: eventType as any,
        event_date: eventDate,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        status: 'contract_signed',
        package_id: data.package_id ?? null,
        gst_type: (data.gst_type as any) ?? 'cgst_sgst',
        subtotal: totalAmount,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        // @ts-expect-error: residual strict constraint
        notes: data.notes ?? null,
      } as any)
      .select('id')
      .single()

    if (insertErr) throw Errors.validation(`Failed to create booking: ${insertErr.message}`)

    try {
      await leadRepo.markLeadConverted(admin, leadId, (booking as { id: string }).id, studioId)
    } catch (e) {
      await (admin.from('bookings') as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', (booking as { id: string }).id)
      throw e
    }

    (admin.from('booking_activity_feed') as any)
      .insert({
        studio_id: studioId,
        booking_id: (booking as { id: string }).id,
        event_type: 'lead_converted',
        actor_id: userId,
        actor_type: 'user',
        metadata: { lead_id: leadId, source: l.source },
      } as any)
      .then(({ error }: any) => {
        if (error) logError({ message: '[LeadService] booking_activity_feed insert failed', context: { error: String(error) } }).catch(() => {})
      })

    return { booking_id: (booking as { id: string }).id }
  },
}
