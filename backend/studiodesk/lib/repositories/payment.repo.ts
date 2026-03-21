import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

type Db = SupabaseClient<any>

function money(value: unknown) {
  return Number(value ?? 0).toFixed(2)
}

function flatten(row: any) {
  return {
    ...row,
    amount: money(row.amount),
    invoice_number: row.invoice?.invoice_number ?? null,
    booking_title: row.booking?.title ?? null,
  }
}

export const paymentRepo = {
  async getPayments(supabase: Db, studioId: string, params: any) {
    let query = supabase
      .from('payments')
      .select('id, studio_id, invoice_id, booking_id, amount, currency, method, status, razorpay_payment_id, razorpay_order_id, razorpay_signature, reference_number, payment_date, bank_name, notes, captured_at, failed_at, failure_reason, created_at, updated_at, invoice:invoices!payments_invoice_id_fkey(invoice_number), booking:bookings!payments_booking_id_fkey(title)', { count: 'exact' })
      .eq('studio_id', studioId)
    if (params.invoice_id) query = query.eq('invoice_id', params.invoice_id)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)
    if (params.status) query = query.eq('status', params.status)
    if (params.method) query = query.eq('method', params.method)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)
    if (error) throw Errors.validation('Failed to fetch payments')
    return { data: (data ?? []).map(flatten), count: count ?? 0 }
  },

  async getPaymentById(supabase: Db, paymentId: string, studioId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('id, studio_id, invoice_id, booking_id, amount, currency, method, status, razorpay_payment_id, razorpay_order_id, razorpay_signature, reference_number, payment_date, bank_name, notes, captured_at, failed_at, failure_reason, created_at, updated_at, invoice:invoices!payments_invoice_id_fkey(invoice_number), booking:bookings!payments_booking_id_fkey(title)')
      .eq('id', paymentId)
      .eq('studio_id', studioId)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch payment')
    return data ? flatten(data) : null
  },

  async getPaymentByRazorpayId(supabase: Db, razorpayPaymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch payment')
    return data
  },

  async createPayment(supabase: Db, data: any) {
    const { data: row, error } = await (supabase as any).from('payments').insert(data as any).select('*').single()
    if (error) throw Errors.validation('Failed to create payment')
    return flatten(row)
  },

  async updatePaymentStatus(supabase: Db, paymentId: string, status: string, extraFields?: any) {
    const { error } = await supabase
      .from('payments')
      .update({ status, ...extraFields, updated_at: new Date().toISOString() })
      .eq('id', paymentId)
    if (error) throw Errors.validation('Failed to update payment')
  },

  async createRefund(supabase: Db, data: any) {
    const { data: row, error } = await (supabase as any).from('refunds').insert(data as any).select('*').single()
    if (error) throw Errors.validation('Failed to create refund')
    return row
  },

  async logWebhook(supabase: Db, data: any) {
    const insert = async (payload: any) => {
      const { data: row, error } = await (supabase as any).from('webhook_logs').insert(payload as any).select('id').single()
      if (error) throw error
      return row?.id as string
    }
    try {
      return await insert(data)
    } catch {
      try {
        if (data.idempotency_key) {
          return await insert({ ...data, idempotency_key: `${String(data.idempotency_key)}:${Date.now()}` })
        }
      } catch {}
      return null
    }
  },

  async updateWebhookLog(supabase: Db, logId: string | null, data: any) {
    if (!logId) return
    try {
      await (supabase as any).from('webhook_logs').update(data as any).eq('id', logId)
    } catch {}
  },

  async checkWebhookIdempotency(supabase: Db, idempotencyKey: string) {
    if (!idempotencyKey) return false
    const { data } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .eq('processing_status', 'processed')
      .maybeSingle()
    return Boolean(data)
  },

  async logPaymentGateway(supabase: Db, data: any) {
    try {
      await (supabase as any).from('payment_gateway_logs').insert(data as any)
    } catch {}
  },

  admin() {
    return createAdminClient()
  },
}
