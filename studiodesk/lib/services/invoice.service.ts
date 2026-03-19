import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'
import { invoiceRepo } from '@/lib/repositories/invoice.repo'
import { paymentRepo } from '@/lib/repositories/payment.repo'
import { calculateInvoiceTotals, detectGstType } from '@/lib/gst/calculator'
import { createPaymentLink, rupeesToPaise } from '@/lib/razorpay/client'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'
import { sendEmail } from '@/lib/resend/client'

type Db = SupabaseClient<any>

function amount(value: unknown) {
  return Number(value ?? 0).toFixed(2)
}

function num(value: unknown) {
  return Number.parseFloat(String(value ?? 0))
}

function activityType(invoiceType: string, kind: 'invoice' | 'payment') {
  if (invoiceType === 'advance') return kind === 'invoice' ? 'advance_invoice_sent' : 'advance_payment_received'
  return kind === 'invoice' ? 'balance_invoice_sent' : 'balance_payment_received'
}

async function getBookingAndStudio(supabase: Db, bookingId: string, studioId: string) {
  const [bookingRes, studioRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, client_id, venue_state_id, status, studio_id, deleted_at, title')
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .maybeSingle(),
    supabase.from('studios').select('id, name, state_id').eq('id', studioId).single(),
  ])
  if (bookingRes.error) throw Errors.validation('Failed to fetch booking')
  if (!bookingRes.data || bookingRes.data.deleted_at) throw Errors.notFound('Booking')
  if (studioRes.error || !studioRes.data) throw Errors.notFound('Studio')
  return { booking: bookingRes.data, studio: studioRes.data }
}

async function getClient(supabase: Db, clientId: string, studioId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('id, full_name, email, phone, state, state_id')
    .eq('id', clientId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw Errors.validation('Failed to fetch client')
  if (!data) throw Errors.notFound('Client')
  return data
}

function logInsert(supabase: Db, table: string, payload: Record<string, unknown>) {
  supabase.from(table).insert(payload).then(() => {}).catch(() => {})
}

export const InvoiceService = {
  async getInvoices(supabase: Db, studioId: string, params: any) {
    invoiceRepo.batchMarkOverdue(supabase, studioId).catch((err) =>
      logError({ message: 'invoice_overdue_mark_failed', context: { studioId, err: String(err) } })
    )
    return invoiceRepo.getInvoices(supabase, studioId, params)
  },

  async getInvoiceById(supabase: Db, invoiceId: string, studioId: string) {
    const [invoice, lineItems] = await Promise.all([
      invoiceRepo.getInvoiceById(supabase, invoiceId, studioId),
      invoiceRepo.getInvoiceLineItems(supabase, invoiceId),
    ])
    if (!invoice) throw Errors.notFound('Invoice')
    return { ...invoice, line_items: lineItems }
  },

  async createInvoice(supabase: Db, studioId: string, data: any, userId: string) {
    const { booking, studio } = await getBookingAndStudio(supabase, data.booking_id, studioId)
    const clientId = data.client_id ?? booking.client_id
    const client = await getClient(supabase, clientId, studioId)
    if (['closed', 'lost'].includes(booking.status)) throw Errors.conflict('Cannot create invoice for a closed booking')
    if (!data.line_items?.length) throw Errors.validation('At least one line item is required')
    if (data.line_items.length > 20) throw Errors.validation('No more than 20 line items are allowed')
    const gstType =
      data.gst_type ??
      detectGstType(String(studio.state_id ?? ''), booking.venue_state_id ? String(booking.venue_state_id) : String(client.state_id ?? ''))
    const totals = calculateInvoiceTotals(
      data.line_items.map((item: any) => ({ quantity: num(item.quantity), unit_price: num(item.unit_price) })),
      gstType
    )
    if (data.invoice_type === 'advance') {
      const { count, error } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('booking_id', data.booking_id)
        .eq('invoice_type', 'advance')
        .neq('status', 'cancelled')
      if (error) throw Errors.validation('Failed to validate advance invoices')
      if ((count ?? 0) > 0) throw Errors.conflict('An advance invoice already exists for this booking')
    }
    if (data.invoice_type === 'credit_note') {
      if (!data.credit_note_for) throw Errors.validation('Credit note invoice requires credit_note_for')
      const original = await invoiceRepo.getInvoiceById(supabase, data.credit_note_for, studioId)
      if (!original) throw Errors.notFound('Invoice')
    }
    const created = await invoiceRepo.createInvoice(supabase, {
      studio_id: studioId,
      booking_id: data.booking_id,
      client_id: clientId,
      invoice_type: data.invoice_type,
      status: 'draft',
      subtotal: amount(totals.subtotal),
      gst_type: gstType,
      cgst_rate: gstType === 'cgst_sgst' ? '9.00' : '0.00',
      sgst_rate: gstType === 'cgst_sgst' ? '9.00' : '0.00',
      igst_rate: gstType === 'igst' ? '18.00' : '0.00',
      cgst_amount: amount(totals.cgst),
      sgst_amount: amount(totals.sgst),
      igst_amount: amount(totals.igst),
      total_amount: amount(totals.grandTotal),
      hsn_sac_code: data.hsn_sac_code ?? '998389',
      place_of_supply: client.state ?? null,
      place_of_supply_state_id: client.state_id ?? null,
      credit_note_for: data.credit_note_for ?? null,
      due_date: data.due_date ?? null,
      notes: data.notes ?? null,
      internal_notes: data.internal_notes ?? null,
    })
    await invoiceRepo.createLineItems(
      supabase,
      data.line_items.map((item: any, index: number) => ({
        invoice_id: created.id,
        studio_id: studioId,
        sort_order: item.sort_order ?? index,
        name: item.name,
        description: item.description ?? null,
        hsn_sac_code: item.hsn_sac_code ?? data.hsn_sac_code ?? '998389',
        quantity: amount(item.quantity),
        unit_price: amount(item.unit_price),
      }))
    )
    logInsert(supabase, 'audit_logs', {
      studio_id: studioId,
      user_id: userId,
      action: 'create',
      entity_type: 'invoices',
      entity_id: created.id,
      entity_snapshot: { booking_id: data.booking_id, invoice_type: data.invoice_type },
    })
    return this.getInvoiceById(supabase, created.id, studioId)
  },

  async updateInvoice(supabase: Db, invoiceId: string, studioId: string, data: any, userId: string) {
    const current = await invoiceRepo.getInvoiceById(supabase, invoiceId, studioId)
    if (!current) throw Errors.notFound('Invoice')
    if (current.status === 'cancelled') throw Errors.conflict('Cancelled invoices cannot be updated')
    await invoiceRepo.updateInvoice(supabase, invoiceId, studioId, {
      notes: data.notes,
      internal_notes: data.internal_notes,
      due_date: data.due_date ?? null,
    })
    logInsert(supabase, 'audit_logs', {
      studio_id: studioId,
      user_id: userId,
      action: 'update',
      entity_type: 'invoices',
      entity_id: invoiceId,
      entity_snapshot: { fields_changed: Object.keys(data) },
    })
    return this.getInvoiceById(supabase, invoiceId, studioId)
  },

  async sendInvoice(supabase: Db, invoiceId: string, studioId: string, userId: string) {
    const invoice = await this.getInvoiceById(supabase, invoiceId, studioId)
    if (invoice.status === 'paid') throw Errors.conflict('Paid invoices cannot be resent')
    if (invoice.status === 'cancelled') throw Errors.conflict('Cancelled invoices cannot be sent')
    if (invoice.status === 'draft') {
      await invoiceRepo.markInvoiceSent(supabase, invoiceId)
    } else {
      await invoiceRepo.updateInvoiceStatus(supabase, invoiceId, invoice.status, { sent_at: new Date().toISOString() })
    }
    const updated = await this.getInvoiceById(supabase, invoiceId, studioId)
    const studio = await supabase.from('studios').select('name').eq('id', studioId).single()
    const studioName = studio.data?.name ?? 'Studio'
    const invoiceUrl = `${env.NEXT_PUBLIC_APP_URL}/invoices/view/${updated.access_token}`
    const payButton = updated.payment_link_url ? `<p><a href="${updated.payment_link_url}">Pay Now</a></p>` : ''
    if (updated.client_email) {
      sendEmail({
        to: updated.client_email,
        subject: `Invoice ${updated.invoice_number} from ${studioName} - INR ${updated.total_amount}`,
        html: `<p>Invoice ${updated.invoice_number}</p><p>Amount: INR ${updated.total_amount}</p><p>Due: ${updated.due_date ?? 'On receipt'}</p><p><a href="${invoiceUrl}">View Invoice</a></p>${payButton}`,
        studioId,
      }).catch(() => {})
      logInsert(supabase, 'email_delivery_logs', {
        studio_id: studioId,
        to_email: updated.client_email,
        from_email: 'noreply@studiodesk.test',
        subject: `Invoice ${updated.invoice_number} from ${studioName}`,
        template_type: updated.invoice_type === 'advance' ? 'advance_payment_reminder' : 'balance_payment_reminder',
        status: 'queued',
      })
    }
    logInsert(supabase, 'automation_log', {
      studio_id: studioId,
      booking_id: updated.booking_id,
      client_id: updated.client_id,
      automation_type: updated.invoice_type === 'advance' ? 'advance_payment_reminder' : 'balance_payment_reminder',
      channel: 'email',
      status: 'sent',
      recipient_email: updated.client_email,
      message_body: `Invoice ${updated.invoice_number}`,
    })
    logInsert(supabase, 'booking_activity_feed', {
      studio_id: studioId,
      booking_id: updated.booking_id,
      event_type: activityType(updated.invoice_type, 'invoice'),
      actor_id: userId,
      actor_type: 'member',
    })
    return updated
  },

  async generatePaymentLink(supabase: Db, invoiceId: string, studioId: string) {
    const invoice = await this.getInvoiceById(supabase, invoiceId, studioId)
    if (invoice.status === 'paid') throw Errors.conflict('Invoice is already paid')
    if (invoice.status === 'cancelled') throw Errors.conflict('Cancelled invoices cannot accept payments')
    if (invoice.payment_link_url && invoice.payment_link_expires_at && new Date(invoice.payment_link_expires_at) > new Date()) {
      return { payment_link_url: invoice.payment_link_url }
    }
    const amountDue = num(invoice.amount_due)
    const amountPaise = rupeesToPaise(amountDue)
    if (amountPaise <= 0) throw Errors.validation('Invoice has no outstanding amount')
    const started = Date.now()
    const requestPayload = {
      amount_rupees: amountDue,
      currency: 'INR',
      description: `${invoice.invoice_number} - ${invoice.booking_title}`,
      customer: {
        name: invoice.client_name,
        email: invoice.client_email ?? undefined,
        contact: invoice.client_phone ? `+91${invoice.client_phone}` : undefined,
      },
      expire_by: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000),
      notify: { email: Boolean(invoice.client_email), sms: false },
    }
    try {
      const link = await createPaymentLink(requestPayload)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await invoiceRepo.updateInvoiceRazorpay(supabase, invoiceId, {
        razorpay_payment_link_id: link.payment_link_id,
        payment_link_url: link.short_url,
        payment_link_expires_at: expiresAt,
      })
      paymentRepo.logPaymentGateway(createAdminClient(), {
        studio_id: studioId,
        operation: 'create_payment_link',
        request_payload: requestPayload,
        response_payload: link,
        http_status_code: 200,
        response_time_ms: Date.now() - started,
        success: true,
      })
      return { payment_link_url: link.short_url }
    } catch (error) {
      paymentRepo.logPaymentGateway(createAdminClient(), {
        studio_id: studioId,
        operation: 'create_payment_link',
        request_payload: requestPayload,
        response_payload: {},
        http_status_code: 500,
        response_time_ms: Date.now() - started,
        success: false,
        error_description: String(error),
      })
      throw error
    }
  },

  async recordManualPayment(supabase: Db, invoiceId: string, studioId: string, data: any, userId: string) {
    const invoice = await this.getInvoiceById(supabase, invoiceId, studioId)
    if (invoice.status === 'paid') throw Errors.conflict('Invoice is already fully paid')
    if (invoice.status === 'cancelled') throw Errors.conflict('Cannot record payment on cancelled invoice')
    const paidAmount = num(data.amount)
    if (paidAmount <= 0) throw Errors.validation('Payment amount must be greater than zero')
    if (paidAmount > num(invoice.amount_due)) {
      throw Errors.validation(`Payment amount exceeds outstanding balance of INR ${invoice.amount_due}`)
    }
    const payment = await paymentRepo.createPayment(supabase, {
      studio_id: studioId,
      invoice_id: invoiceId,
      booking_id: invoice.booking_id,
      amount: amount(data.amount),
      currency: 'INR',
      method: data.method,
      status: 'captured',
      reference_number: data.reference_number ?? null,
      payment_date: data.payment_date ?? new Date().toISOString().slice(0, 10),
      bank_name: data.bank_name ?? null,
      notes: data.notes ?? null,
      captured_at: new Date().toISOString(),
    })
    logInsert(supabase, 'booking_activity_feed', {
      studio_id: studioId,
      booking_id: invoice.booking_id,
      event_type: activityType(invoice.invoice_type, 'payment'),
      actor_id: userId,
      actor_type: 'member',
      metadata: { amount: amount(data.amount), method: data.method },
    })
    if (invoice.client_email) {
      sendEmail({
        to: invoice.client_email,
        subject: `Payment received for invoice ${invoice.invoice_number}`,
        html: `<p>We received INR ${amount(data.amount)} via ${data.method}.</p><p>Reference: ${data.reference_number ?? 'N/A'}</p>`,
        studioId,
      }).catch(() => {})
    }
    return payment
  },

  async createCreditNote(supabase: Db, invoiceId: string, studioId: string, data: any, userId: string) {
    const invoice = await this.getInvoiceById(supabase, invoiceId, studioId)
    if (invoice.status !== 'paid') throw Errors.conflict('Credit notes can only be created for paid invoices')
    const amountValue = num(data.amount)
    if (amountValue <= 0) throw Errors.validation('Credit note amount must be greater than zero')
    if (amountValue > num(invoice.total_amount)) throw Errors.validation('Credit note amount cannot exceed original invoice total')
    return this.createInvoice(
      supabase,
      studioId,
      {
        booking_id: invoice.booking_id,
        client_id: invoice.client_id,
        invoice_type: 'credit_note',
        gst_type: invoice.gst_type,
        hsn_sac_code: invoice.hsn_sac_code,
        notes: data.reason,
        credit_note_for: invoiceId,
        line_items: [{ name: `Credit Note - ${invoice.invoice_number}`, quantity: '1', unit_price: amount(data.amount), sort_order: 0 }],
      },
      userId
    )
  },

  async viewInvoice(token: string) {
    const supabase = createAdminClient()
    const invoice = await invoiceRepo.getInvoiceByToken(supabase, token)
    if (!invoice) throw Errors.notFound('Invoice')
    invoiceRepo.markInvoiceViewed(supabase, invoice.id).catch(() => {})
    const lineItems = await invoiceRepo.getInvoiceLineItems(supabase, invoice.id)
    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_type: invoice.invoice_type,
      status: invoice.status,
      subtotal: invoice.subtotal,
      cgst_amount: invoice.cgst_amount,
      sgst_amount: invoice.sgst_amount,
      igst_amount: invoice.igst_amount,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      due_date: invoice.due_date,
      payment_link_url: invoice.payment_link_url,
      sent_at: invoice.sent_at,
      viewed_at: invoice.viewed_at,
      notes: invoice.notes,
      line_items: lineItems,
      studio: {
        name: invoice.studio_name,
        logo_url: invoice.studio_logo_url,
        brand_color: invoice.studio_brand_color,
        phone: invoice.studio_phone,
        email: invoice.studio_email,
      },
      client_name: invoice.client_name,
      booking: {
        title: invoice.booking_title,
        event_type: invoice.event_type,
        event_date: invoice.event_date,
        venue_name: invoice.venue_name,
      },
    }
  },

  async getFinancialSummary(supabase: Db, studioId: string, period: any) {
    return invoiceRepo.getFinancialSummary(supabase, studioId, period)
  },

  async getOutstandingInvoices(supabase: Db, studioId: string) {
    return invoiceRepo.getOutstandingInvoices(supabase, studioId)
  },
}
