import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>
type Channel = 'whatsapp' | 'email' | 'both'
type Period = 'today' | 'this_week' | 'this_month' | 'last_month'

const DB_TYPE_BY_LOGICAL: Record<string, string> = {
  shoot_reminder: 'shoot_reminder_client',
}

const LOGICAL_TYPE_BY_DB: Record<string, string> = {
  shoot_reminder_client: 'shoot_reminder',
}

const SETTINGS_SELECT = `
  id, studio_id, automation_type, is_enabled, trigger_offset_days,
  trigger_delay_hours, send_email, send_whatsapp, send_sms, custom_subject,
  custom_message, email_template_id, whatsapp_template_id, created_at, updated_at
`

const LOG_SELECT = `
  id, studio_id, booking_id, lead_id, client_id, automation_type, channel, status,
  recipient_phone, recipient_email, subject, message_body, provider_message_id,
  provider_response, scheduled_for, sent_at, failed_at, failure_reason, retry_count,
  created_at, client:clients(full_name, phone, email)
`

const WHATSAPP_SELECT = `
  id, studio_id, automation_type, template_name, provider_template_id, category,
  language, status, body_text, variables, is_active, created_at, updated_at
`

export const AUTOMATION_SETTINGS_META: Record<string, { label: string; description: string; trigger: string; send_time: string | null }> = {
  lead_acknowledgment: { label: 'Lead Acknowledgment', description: 'Sent when a new inquiry is submitted via your form', trigger: 'On form submission', send_time: null },
  lead_follow_up: { label: 'Lead Follow-up', description: 'Sent X days after lead with no status change', trigger: 'X days after lead created', send_time: '10:00' },
  proposal_sent: { label: 'Proposal Sent', description: 'Sent immediately after a proposal is shared', trigger: 'On proposal sent', send_time: null },
  proposal_reminder: { label: 'Proposal Reminder', description: 'Sent before a proposal expires', trigger: 'X days before valid_until', send_time: '10:00' },
  contract_sent: { label: 'Contract Sent', description: 'Sent immediately after a contract is shared', trigger: 'On contract sent', send_time: null },
  contract_reminder: { label: 'Contract Reminder', description: 'Sent when a signed contract is still pending', trigger: 'X days after sent', send_time: '10:00' },
  contract_signed: { label: 'Contract Signed', description: 'Sent after a client signs the contract', trigger: 'On contract signed', send_time: null },
  advance_payment_reminder: { label: 'Advance Payment Reminder', description: 'Sent before advance payment is due', trigger: 'X days before advance due', send_time: '10:00' },
  balance_payment_reminder: { label: 'Balance Payment Reminder', description: 'Sent before the balance is due', trigger: 'X days before balance due', send_time: '10:00' },
  payment_overdue_reminder: { label: 'Payment Overdue Reminder', description: 'Sent after payment becomes overdue', trigger: 'X days after due date', send_time: '10:00' },
  payment_received: { label: 'Payment Received', description: 'Sent when a payment is captured', trigger: 'On payment captured', send_time: null },
  gallery_ready: { label: 'Gallery Ready', description: 'Sent when a gallery is published', trigger: 'On gallery published', send_time: null },
  gallery_reminder: { label: 'Gallery Reminder', description: 'Sent before a gallery expires', trigger: 'X days before gallery expires', send_time: '10:00' },
  shoot_reminder: { label: 'Shoot Reminder', description: 'Sent before a shoot date', trigger: 'X days before shoot date', send_time: '10:00' },
  post_shoot_followup: { label: 'Post Shoot Follow-up', description: 'Sent after the shoot is completed', trigger: 'X days after shoot', send_time: '11:00' },
}

export const DEFAULT_AUTOMATION_SETTINGS = [
  { automation_type: 'lead_acknowledgment', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'lead_follow_up', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'proposal_sent', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'proposal_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'contract_sent', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'contract_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'contract_signed', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'advance_payment_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'balance_payment_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'payment_overdue_reminder', is_enabled: true, channel: 'both', delay_days: 1, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'payment_received', is_enabled: true, channel: 'whatsapp', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'gallery_ready', is_enabled: true, channel: 'both', delay_days: 0, delay_hours: 0, send_time: null },
  { automation_type: 'gallery_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 3, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'shoot_reminder', is_enabled: true, channel: 'whatsapp', delay_days: 2, delay_hours: 0, send_time: '10:00' },
  { automation_type: 'post_shoot_followup', is_enabled: false, channel: 'whatsapp', delay_days: 1, delay_hours: 0, send_time: '11:00' },
] as const

function nowIso() {
  return new Date().toISOString()
}

function rangeFor(period: Period) {
  const now = new Date()
  if (period === 'last_month') return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) }
  if (period === 'this_week') {
    const day = now.getDay() || 7
    const from = new Date(now)
    from.setDate(now.getDate() - day + 1)
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  if (period === 'this_month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
  return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) }
}

function channelFromFlags(row: any): Channel {
  if (row.send_email && row.send_whatsapp) return 'both'
  if (row.send_email) return 'email'
  return 'whatsapp'
}

function toDbAutomationType(type: string) {
  return DB_TYPE_BY_LOGICAL[type] ?? type
}

function toLogicalAutomationType(row: any) {
  const hinted = row?.provider_response?.logical_automation_type
  if (typeof hinted === 'string' && hinted.length > 0) return hinted
  return LOGICAL_TYPE_BY_DB[row.automation_type] ?? row.automation_type
}

function shapeSetting(row: any) {
  const automationType = toLogicalAutomationType(row)
  const meta = AUTOMATION_SETTINGS_META[automationType] ?? { label: automationType, description: '', trigger: '', send_time: null }
  return {
    id: row.id,
    automation_type: automationType,
    label: meta.label,
    description: meta.description,
    trigger: meta.trigger,
    is_enabled: Boolean(row.is_enabled),
    channel: channelFromFlags(row),
    delay_days: Number(row.trigger_offset_days ?? 0),
    delay_hours: Number(row.trigger_delay_hours ?? 0),
    send_time: meta.send_time,
    custom_subject: row.custom_subject ?? null,
    custom_message: row.custom_message ?? null,
    email_template_id: row.email_template_id ?? null,
    whatsapp_template_id: row.whatsapp_template_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function shapeLog(row: any) {
  const automationType = toLogicalAutomationType(row)
  return {
    id: row.id,
    automation_type: automationType,
    channel: row.channel,
    status: row.status,
    recipient_name: row.client?.full_name ?? '',
    recipient_phone: row.recipient_phone ?? null,
    recipient_email: row.recipient_email ?? null,
    message_preview: String(row.message_body ?? row.subject ?? '').slice(0, 200),
    provider_message_id: row.provider_message_id ?? null,
    error_message: row.failure_reason ?? null,
    scheduled_at: row.scheduled_for ?? null,
    sent_at: row.sent_at ?? null,
    booking_id: row.booking_id ?? null,
    lead_id: row.lead_id ?? null,
    created_at: row.created_at,
  }
}

function settingsPayload(studioId: string, setting: Record<string, unknown>, seed = false) {
  const payload: Record<string, unknown> = {
    studio_id: studioId,
    automation_type: toDbAutomationType(String(setting.automation_type)),
  }
  if (seed || setting.is_enabled !== undefined) payload.is_enabled = setting.is_enabled ?? true
  if (seed || setting.delay_days !== undefined) payload.trigger_offset_days = setting.delay_days ?? 0
  if (seed || setting.delay_hours !== undefined) payload.trigger_delay_hours = setting.delay_hours ?? 0
  if (seed || setting.channel !== undefined) {
    const channel = String(setting.channel ?? 'whatsapp') as Channel
    payload.send_email = channel === 'email' || channel === 'both'
    payload.send_whatsapp = channel === 'whatsapp' || channel === 'both'
    payload.send_sms = false
  }
  if (setting.custom_subject !== undefined) payload.custom_subject = setting.custom_subject
  if (setting.custom_message !== undefined) payload.custom_message = setting.custom_message
  if (setting.email_template_id !== undefined) payload.email_template_id = setting.email_template_id
  if (setting.whatsapp_template_id !== undefined) payload.whatsapp_template_id = setting.whatsapp_template_id
  return payload
}

function statusCounts(rows: Array<{ status: string; channel: string; automation_type: string }>) {
  const totals = { sent: 0, failed: 0, pending: 0 }
  const byChannel = { whatsapp: 0, email: 0, both: 0 }
  const byType: Record<string, number> = {}
  for (const row of rows) {
    const automationType = toLogicalAutomationType(row)
    if (row.status in totals) totals[row.status as keyof typeof totals] += 1
    if (row.channel in byChannel) byChannel[row.channel as keyof typeof byChannel] += 1
    byType[automationType] = (byType[automationType] ?? 0) + 1
  }
  const totalDelivered = totals.sent + totals.failed
  return {
    total_sent: totals.sent,
    total_failed: totals.failed,
    delivery_rate_pct: totalDelivered > 0 ? Number(((totals.sent / totalDelivered) * 100).toFixed(1)) : 0,
    by_channel: byChannel,
    by_status: totals,
    by_type: byType,
  }
}

export const automationRepo = {
  async getSettings(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('automation_settings')
      .select(SETTINGS_SELECT)
      .eq('studio_id', studioId)
      .order('automation_type', { ascending: true })
    if (error) throw Errors.validation('Failed to fetch automation settings')
    return (data ?? []).map(shapeSetting)
  },

  async getSettingByType(supabase: Db, studioId: string, automationType: string) {
    const { data, error } = await supabase
      .from('automation_settings')
      .select(SETTINGS_SELECT)
      .eq('studio_id', studioId)
      .eq('automation_type', toDbAutomationType(automationType))
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch automation setting')
    return data ? shapeSetting(data) : null
  },

  async upsertSettings(supabase: Db, studioId: string, settings: Array<Record<string, unknown>>) {
    const { data, error } = await supabase
      .from('automation_settings')
      .upsert(settings.map((setting) => settingsPayload(studioId, setting)), { onConflict: 'studio_id,automation_type' })
      .select(SETTINGS_SELECT)
    if (error) throw Errors.validation('Failed to update automation settings')
    return (data ?? []).map(shapeSetting)
  },

  async ensureDefaultSettings(supabase: Db, studioId: string, defaults: Array<Record<string, unknown>> = DEFAULT_AUTOMATION_SETTINGS as unknown as Array<Record<string, unknown>>) {
    const { count, error } = await supabase
      .from('automation_settings')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
    if (error) throw Errors.validation('Failed to check automation settings')
    if ((count ?? 0) > 0) return
    await supabase
      .from('automation_settings')
      .insert(defaults.map((setting) => settingsPayload(studioId, setting, true)))
  },

  async getAutomationLog(supabase: Db, studioId: string, params: Record<string, any>) {
    let query = supabase.from('automation_log').select(LOG_SELECT, { count: 'exact' }).eq('studio_id', studioId)
    if (params.automation_type) query = query.eq('automation_type', toDbAutomationType(params.automation_type))
    if (params.channel) query = query.eq('channel', params.channel)
    if (params.status) query = query.eq('status', params.status)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)
    if (params.lead_id) query = query.eq('lead_id', params.lead_id)
    if (params.from_date) query = query.gte('created_at', `${params.from_date}T00:00:00.000Z`)
    if (params.to_date) query = query.lte('created_at', `${params.to_date}T23:59:59.999Z`)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)
    if (error) throw Errors.validation('Failed to fetch automation log')
    return { data: (data ?? []).map(shapeLog), count: count ?? 0 }
  },

  async createLogEntry(supabase: Db, data: Record<string, unknown>) {
    const automationType = String(data.automation_type)
    const dbAutomationType = toDbAutomationType(automationType)
    const providerResponse =
      dbAutomationType === automationType
        ? data.provider_response ?? null
        : {
            ...(typeof data.provider_response === 'object' && data.provider_response !== null
              ? (data.provider_response as Record<string, unknown>)
              : {}),
            logical_automation_type: automationType,
          }
    const payload = {
      studio_id: data.studio_id,
      booking_id: data.booking_id ?? null,
      lead_id: data.lead_id ?? null,
      client_id: data.client_id ?? null,
      automation_type: dbAutomationType,
      channel: data.channel,
      status: data.status ?? 'pending',
      recipient_phone: data.recipient_phone ?? null,
      recipient_email: data.recipient_email ?? null,
      subject: data.subject ?? null,
      message_body: data.message_body ?? data.message_preview ?? '',
      provider_message_id: data.provider_message_id ?? null,
      provider_response: providerResponse,
      scheduled_for: data.scheduled_for ?? data.scheduled_at ?? null,
      sent_at: data.sent_at ?? null,
      failed_at: data.failed_at ?? null,
      failure_reason: data.failure_reason ?? data.error_message ?? null,
      retry_count: data.retry_count ?? 0,
      created_at: data.created_at ?? nowIso(),
    }
    const { data: row, error } = await supabase.from('automation_log').insert(payload).select(LOG_SELECT).single()
    if (error || !row) throw Errors.validation('Failed to create automation log')
    return shapeLog(row)
  },

  async updateLogStatus(supabase: Db, logId: string, status: string, extraFields: Record<string, unknown> = {}) {
    const now = nowIso()
    const payload: Record<string, unknown> = { ...extraFields, status }
    if ('error_message' in payload && !('failure_reason' in payload)) payload.failure_reason = payload.error_message
    if ('message_preview' in payload && !('message_body' in payload)) payload.message_body = payload.message_preview
    if (status === 'sent' && payload.sent_at == null) payload.sent_at = now
    if (status === 'failed' && payload.failed_at == null) payload.failed_at = now
    delete payload.error_message
    delete payload.message_preview
    const { data, error } = await supabase
      .from('automation_log')
      .update(payload)
      .eq('id', logId)
      .select(LOG_SELECT)
      .maybeSingle()
    if (error || !data) throw Errors.validation('Failed to update automation log')
    return shapeLog(data)
  },

  async getDeliveryStats(supabase: Db, studioId: string, period: Period) {
    const range = rangeFor(period)
    const { data, error } = await supabase
      .from('automation_log')
      .select('status, channel, automation_type, created_at, provider_response')
      .eq('studio_id', studioId)
      .gte('created_at', range.from.toISOString())
      .lte('created_at', range.to.toISOString())
    if (error) throw Errors.validation('Failed to fetch automation stats')
    return { period, ...statusCounts(data ?? []) }
  },

  async getWhatsAppTemplates(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select(WHATSAPP_SELECT)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('template_name', { ascending: true })
    if (error) throw Errors.validation('Failed to fetch WhatsApp templates')
    return (data ?? []).map((row: any) => ({
      id: row.id,
      automation_type: toLogicalAutomationType(row),
      label: row.template_name,
      type: 'custom',
      preview: String(row.body_text ?? '').slice(0, 200),
      variables: row.variables ?? [],
      channel: 'whatsapp',
      language: row.language,
      status: row.status,
      provider_template_id: row.provider_template_id ?? null,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  },
}
