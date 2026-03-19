import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'
import { getFinancialYearRange } from '@/lib/gst/calculator'

type Db = SupabaseClient<any>

const LIST_SELECT = `
  id, invoice_number, invoice_type, status, subtotal, total_amount, amount_paid, amount_due,
  due_date, paid_at, sent_at, payment_link_url, created_at, updated_at,
  bookings:booking_id (title, event_date),
  clients:client_id (full_name, phone, email)
`

const DETAIL_SELECT = `
  id, studio_id, booking_id, client_id, invoice_number, invoice_type, status, subtotal, total_amount,
  amount_paid, amount_due, gst_type, cgst_rate, sgst_rate, igst_rate, cgst_amount, sgst_amount,
  igst_amount, hsn_sac_code, place_of_supply, place_of_supply_state_id, credit_note_for, due_date,
  paid_at, razorpay_order_id, razorpay_payment_link_id, payment_link_url, payment_link_expires_at,
  sent_at, viewed_at, access_token, pdf_url, pdf_generated_at, notes, internal_notes, created_at,
  updated_at, bookings:booking_id (title, event_type, event_date, venue_name), clients:client_id (full_name, phone, email)
`

const TOKEN_SELECT = `
  id, studio_id, booking_id, client_id, invoice_number, invoice_type, status, subtotal, total_amount,
  amount_paid, amount_due, gst_type, cgst_amount, sgst_amount, igst_amount, due_date, sent_at, viewed_at,
  payment_link_url, payment_link_expires_at, access_token, notes, created_at,
  studio:studios (name, logo_url, brand_color, phone, email),
  booking:bookings (title, event_type, event_date, venue_name),
  client:clients (full_name, email, phone)
`

function money(value: unknown) {
  return Number(value ?? 0).toFixed(2)
}

function dateOnly(value: unknown) {
  if (!value) return null
  return typeof value === 'string' ? value.slice(0, 10) : new Date(value as Date).toISOString().slice(0, 10)
}

function flattenInvoice(row: any) {
  return {
    ...row,
    subtotal: money(row.subtotal),
    total_amount: money(row.total_amount),
    amount_paid: money(row.amount_paid),
    amount_due: money(row.amount_due),
    cgst_rate: money(row.cgst_rate),
    sgst_rate: money(row.sgst_rate),
    igst_rate: money(row.igst_rate),
    cgst_amount: money(row.cgst_amount),
    sgst_amount: money(row.sgst_amount),
    igst_amount: money(row.igst_amount),
    due_date: dateOnly(row.due_date),
    booking_title: row.bookings?.title ?? row.booking?.title ?? '',
    event_date: dateOnly(row.bookings?.event_date ?? row.booking?.event_date),
    event_type: row.bookings?.event_type ?? row.booking?.event_type ?? null,
    venue_name: row.bookings?.venue_name ?? row.booking?.venue_name ?? null,
    client_name: row.clients?.full_name ?? row.client?.full_name ?? '',
    client_phone: row.clients?.phone ?? row.client?.phone ?? null,
    client_email: row.clients?.email ?? row.client?.email ?? null,
    studio_name: row.studio?.name ?? '',
    studio_logo_url: row.studio?.logo_url ?? null,
    studio_brand_color: row.studio?.brand_color ?? '#1A3C5E',
    studio_phone: row.studio?.phone ?? null,
    studio_email: row.studio?.email ?? null,
  }
}

function periodRange(period: 'this_month' | 'last_month' | 'this_quarter' | 'this_fy') {
  const now = new Date()
  if (period === 'this_fy') return getFinancialYearRange()
  if (period === 'last_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    }
  }
  if (period === 'this_quarter') {
    const startMonth = Math.floor(now.getMonth() / 3) * 3
    return {
      start: new Date(now.getFullYear(), startMonth, 1),
      end: new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59),
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
  }
}

export const invoiceRepo = {
  async getInvoices(supabase: Db, studioId: string, params: any) {
    let query = supabase.from('invoices').select(LIST_SELECT, { count: 'exact' }).eq('studio_id', studioId)
    if (params.status) query = query.eq('status', params.status)
    if (params.invoice_type) query = query.eq('invoice_type', params.invoice_type)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)
    if (params.from_date) query = query.gte('created_at', `${params.from_date}T00:00:00.000Z`)
    if (params.to_date) query = query.lte('created_at', `${params.to_date}T23:59:59.999Z`)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)
    if (error) throw Errors.validation('Failed to fetch invoices')
    return { data: (data ?? []).map(flattenInvoice), count: count ?? 0 }
  },

  async getInvoiceById(supabase: Db, invoiceId: string, studioId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(DETAIL_SELECT)
      .eq('id', invoiceId)
      .eq('studio_id', studioId)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch invoice')
    return data ? flattenInvoice(data) : null
  },

  async getInvoiceByToken(supabase: Db, token: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(TOKEN_SELECT)
      .eq('access_token', token)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch invoice')
    return data ? flattenInvoice(data) : null
  },

  async getInvoiceLineItems(supabase: Db, invoiceId: string) {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .select('id, invoice_id, studio_id, sort_order, name, description, hsn_sac_code, quantity, unit_price, total_price, created_at')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true })
    if (error) throw Errors.validation('Failed to fetch invoice line items')
    return (data ?? []).map((item: any) => ({
      ...item,
      quantity: money(item.quantity),
      unit_price: money(item.unit_price),
      total_price: money(item.total_price),
    }))
  },

  async createInvoice(supabase: Db, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('invoices')
      .insert(data)
      .select('id, invoice_number, access_token')
      .single()
    if (error) throw Errors.validation('Failed to create invoice')
    return row as { id: string; invoice_number: string; access_token: string }
  },

  async createLineItems(supabase: Db, items: Array<Record<string, unknown>>) {
    const { data, error } = await supabase
      .from('invoice_line_items')
      .insert(items)
      .select('id, invoice_id, studio_id, sort_order, name, description, hsn_sac_code, quantity, unit_price, total_price, created_at')
    if (error) throw Errors.validation('Failed to create invoice line items')
    return data ?? []
  },

  async updateInvoice(supabase: Db, invoiceId: string, studioId: string, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('invoices')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .eq('studio_id', studioId)
      .select('id')
      .maybeSingle()
    if (error || !row) throw Errors.notFound('Invoice')
  },

  async updateInvoiceStatus(supabase: Db, invoiceId: string, status: string, extraFields?: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status, ...extraFields, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select('id')
      .maybeSingle()
    if (error || !data) throw Errors.validation('Failed to update invoice status')
  },

  async updateInvoiceRazorpay(supabase: Db, invoiceId: string, data: Record<string, unknown>) {
    const { error } = await supabase
      .from('invoices')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
    if (error) throw Errors.validation('Failed to update payment link')
  },

  async markInvoiceSent(supabase: Db, invoiceId: string) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: now, updated_at: now })
      .eq('id', invoiceId)
      .eq('status', 'draft')
      .select('id')
      .maybeSingle()
    if (error || !data) throw Errors.validation('Failed to mark invoice sent')
  },

  async markInvoiceViewed(supabase: Db, invoiceId: string) {
    const { error } = await supabase
      .from('invoices')
      .update({ viewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .is('viewed_at', null)
    if (error) throw Errors.validation('Failed to mark invoice viewed')
  },

  async getOutstandingInvoices(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(LIST_SELECT)
      .eq('studio_id', studioId)
      .in('status', ['sent', 'partially_paid', 'overdue'])
      .gt('amount_due', 0)
      .order('due_date', { ascending: true, nullsFirst: false })
    if (error) throw Errors.validation('Failed to fetch outstanding invoices')
    return (data ?? []).map(flattenInvoice)
  },

  async getFinancialSummary(supabase: Db, studioId: string, period: 'this_month' | 'last_month' | 'this_quarter' | 'this_fy') {
    const range = periodRange(period)
    const fromIso = range.start.toISOString()
    const toIso = range.end.toISOString()
    const [{ data: payments }, { data: outstanding }, { data: overdue }, { count: bookings }, { count: leads }] =
      await Promise.all([
        supabase.from('payments').select('amount').eq('studio_id', studioId).eq('status', 'captured').gte('captured_at', fromIso).lte('captured_at', toIso),
        supabase.from('invoices').select('amount_due').eq('studio_id', studioId).in('status', ['sent', 'partially_paid', 'overdue']).gt('amount_due', 0),
        supabase.from('invoices').select('total_amount').eq('studio_id', studioId).eq('status', 'overdue').gt('amount_due', 0),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).gte('event_date', dateOnly(range.start) ?? '').lte('event_date', dateOnly(range.end) ?? ''),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('studio_id', studioId).gte('created_at', fromIso).lte('created_at', toIso),
      ])
    const revenueCollected = (payments ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0)
    const revenuePending = (outstanding ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_due ?? 0), 0)
    const revenueOverdue = (overdue ?? []).reduce((sum: number, row: any) => sum + Number(row.total_amount ?? 0), 0)
    const denominator = revenueCollected + revenuePending
    return {
      period,
      date_range: { from: dateOnly(range.start), to: dateOnly(range.end) },
      revenue_collected: money(revenueCollected),
      revenue_pending: money(revenuePending),
      revenue_overdue: money(revenueOverdue),
      total_bookings: bookings ?? 0,
      new_leads: leads ?? 0,
      collection_rate_pct: denominator > 0 ? Number(((revenueCollected / denominator) * 100).toFixed(1)) : 0,
    }
  },

  async batchMarkOverdue(supabase: Db, studioId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'overdue', updated_at: new Date().toISOString() })
      .eq('studio_id', studioId)
      .in('status', ['sent', 'partially_paid'])
      .lt('due_date', new Date().toISOString().slice(0, 10))
      .not('due_date', 'is', null)
      .select('id')
    if (error) throw Errors.validation('Failed to mark overdue invoices')
    return { count: data?.length ?? 0 }
  },
}
