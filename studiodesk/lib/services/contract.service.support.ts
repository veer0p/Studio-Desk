import { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend/client'
import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'
import { formatINR, formatIndianDate } from '@/lib/formatters'

export type Db = SupabaseClient<any>
export type BookingRow = Record<string, any>
export type ClientRow = Record<string, any>
export type StudioRow = Record<string, any>

export interface ContractSummary {
  id: string
  booking_id: string
  booking_title: string
  event_type: string | null
  event_date: string | null
  client_id: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  status: 'draft' | 'sent' | 'signed' | 'cancelled'
  sent_at: string | null
  viewed_at: string | null
  signed_at: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at?: string
}

export interface ContractDetail extends ContractSummary {
  studio_id?: string
  template_id: string | null
  content_html: string
  notes: string | null
  signed_ip: string | null
  signed_pdf_url: string | null
  access_token?: string
  studio_name?: string
  studio_email?: string | null
}

export interface PublicContractView {
  id: string
  status: string
  content_html: string
  signed_at: string | null
  studio: { name: string; logo_url: string | null; brand_color: string; phone: string | null; email: string | null }
  client_name: string
  booking: { title: string; event_type: string | null; event_date: string | null; venue_name: string | null }
}

export interface ContractTemplate {
  id: string
  name: string
  event_type: string | null
  content_html: string
  version: number
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

function packageName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return ''
  return String((snapshot as Record<string, unknown>).name ?? '')
}

function amountValue(value: unknown) {
  return formatINR(Number(value ?? 0)).replace(/^\u20b9\s?/, '')
}

export function sanitizeHtml(html: string) {
  return html.replace(SCRIPT_RE, '').replace(/\u20b9\s*\u20b9/g, '\u20b9').trim()
}

export function toDateString(value: unknown) {
  if (!value) return null
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value)
}

export function replaceVariables(html: string, vars: Record<string, string>) {
  let output = html
  for (const [key, value] of Object.entries(vars)) {
    output = output.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return sanitizeHtml(output)
}

export function buildVariables(booking: BookingRow, client: ClientRow, studio: StudioRow) {
  return {
    client_name: String(client.full_name ?? ''),
    event_date: formatIndianDate(booking.event_date),
    venue: String(booking.venue_name ?? 'TBD'),
    event_type: String(booking.event_type ?? 'other').replace(/_/g, ' '),
    package_name: packageName(booking.package_snapshot),
    total_amount: amountValue(booking.total_amount),
    advance_amount: amountValue(booking.advance_amount),
    balance_amount: amountValue(booking.balance_amount ?? Number(booking.total_amount ?? 0) - Number(booking.advance_amount ?? 0)),
    studio_name: String(studio.name ?? ''),
    studio_phone: String(studio.phone ?? ''),
    studio_email: String(studio.email ?? ''),
    turnaround_days: '30',
    today_date: formatIndianDate(new Date()),
  }
}

export async function getBookingAndStudio(supabase: Db, bookingId: string, studioId: string) {
  const bookingQuery = supabase
    .from('bookings')
    .select('id, event_type, title, venue_name, event_date, total_amount, advance_amount, balance_amount, package_snapshot, client_id, studio_id')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .maybeSingle()
  const studioQuery = supabase.from('studios').select('id, name, logo_url, brand_color, phone, email, gstin').eq('id', studioId).maybeSingle()
  const [{ data: booking, error: bookingError }, { data: studio, error: studioError }] = await Promise.all([bookingQuery, studioQuery])
  if (bookingError || !booking) throw Errors.notFound('Booking')
  if (studioError || !studio) throw Errors.notFound('Studio')
  return { booking, studio }
}

export async function getClient(supabase: Db, clientId: string, studioId: string) {
  const { data, error } = await supabase.from('clients').select('id, full_name, email, phone, whatsapp').eq('id', clientId).eq('studio_id', studioId).maybeSingle()
  if (error || !data) throw Errors.notFound('Client')
  return data
}

export async function getStudioInfo(supabase: Db, studioId: string) {
  const { data, error } = await supabase.from('studios').select('id, name, email').eq('id', studioId).maybeSingle()
  if (error || !data) throw Errors.notFound('Studio')
  return data
}

export async function logInsert(supabase: Db, table: string, payload: Record<string, unknown>) {
  await supabase.from(table).insert(payload).then(() => {}).catch(() => {})
}

export async function sendContractEmail(studioId: string, to: string | null, subject: string, html: string) {
  if (!to) return
  await sendEmail({ to, subject, html, studioId }).catch(() => {})
}

export async function notifyContractSend(
  supabase: Db,
  contract: ContractDetail,
  studioName: string,
  userId: string,
  reminder = false
) {
  const contractUrl = `${env.NEXT_PUBLIC_APP_URL}/contracts/sign/${contract.access_token}`
  const subject = `${reminder ? 'Reminder: ' : ''}Please sign your photography agreement with ${studioName}`
  const html = `<p>Hi ${contract.client_name},</p><p>Your agreement for <strong>${contract.booking_title}</strong> is ready.</p><p>Event date: ${contract.event_date ?? 'TBD'}</p><p><a href="${contractUrl}">Review & Sign Contract</a></p><p>Please sign before the event date.</p>`
  sendContractEmail(contract.studio_id ?? '', contract.client_email, subject, html)
  logInsert(supabase, 'automation_log', {
    studio_id: contract.studio_id,
    booking_id: contract.booking_id,
    client_id: contract.client_id,
    automation_type: reminder ? 'contract_reminder' : 'custom',
    channel: 'email',
    status: 'sent',
    recipient_email: contract.client_email,
    subject,
    message_body: html,
    sent_at: new Date().toISOString(),
  })
  if (contract.client_phone) {
    logInsert(supabase, 'automation_log', {
      studio_id: contract.studio_id,
      booking_id: contract.booking_id,
      client_id: contract.client_id,
      automation_type: reminder ? 'contract_reminder' : 'custom',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: contract.client_phone,
      message_body: `Hi ${contract.client_name}, review and sign your contract: ${contractUrl}`,
    })
  }
  logInsert(supabase, 'booking_activity_feed', {
    studio_id: contract.studio_id,
    booking_id: contract.booking_id,
    event_type: reminder ? 'contract_reminded' : 'contract_sent',
    actor_id: userId,
    actor_type: 'member',
  })
}
