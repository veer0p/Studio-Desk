import { createAdminClient } from '@/lib/supabase/admin'
import {
  BOOKING_INVOICE_NEW_ID,
  BOOKING_INVOICE_DUP_ID,
  BOOKING_INVOICE_PAID_ID,
  BOOKING_INVOICE_OVERDUE_ID,
  BOOKING_INVOICE_LINK_ID,
  CLIENT_ANITA_ID,
  CLIENT_DEV_ID,
  CLIENT_MEERA_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  INVOICE_CREDIT_NOTE_ID,
  INVOICE_CREDIT_NOTE_TOKEN,
  INVOICE_DRAFT_ID,
  INVOICE_DRAFT_TOKEN,
  INVOICE_LINK_ID,
  INVOICE_LINK_TOKEN,
  INVOICE_OVERDUE_ID,
  INVOICE_OVERDUE_TOKEN,
  INVOICE_PAID_ID,
  INVOICE_PAID_TOKEN,
  INVOICE_SENT_ID,
  INVOICE_SENT_TOKEN,
  PACKAGE_CORPORATE_ID,
  PACKAGE_PORTRAIT_ID,
  PACKAGE_WEDDING_ID,
  PAYMENT_MANUAL_ID,
  PAYMENT_RAZORPAY_ID,
  STUDIO_A_ID,
} from '../../../supabase/seed'

function addDays(n: number) {
  const value = new Date()
  value.setDate(value.getDate() + n)
  return value
}

export async function resetInvoiceFixtures() {
  const admin = createAdminClient()
  const sentAt = addDays(-2).toISOString()
  const paidAt = addDays(-1).toISOString()
  const futureDue = addDays(7).toISOString().slice(0, 10)
  const overdueDate = addDays(-5).toISOString().slice(0, 10)
  const linkExpiry = addDays(7).toISOString()

  await (admin.from('payments') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('refunds') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('invoice_line_items') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('invoices') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('payment_gateway_logs') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('webhook_logs') as any).delete().eq('provider', 'razorpay')
  await (admin.from('automation_log') as any).delete().eq('studio_id', STUDIO_A_ID).in('automation_type', ['advance_payment_reminder', 'balance_payment_reminder'])
  await (admin.from('email_delivery_logs') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('booking_activity_feed') as any).delete().eq('studio_id', STUDIO_A_ID).in('event_type', ['advance_invoice_sent', 'advance_payment_received', 'balance_invoice_sent', 'balance_payment_received'])
  await (admin.from('studios') as any)
    .update({ invoice_sequence: 0, invoice_prefix: 'XYZ' })
    .eq('id', STUDIO_A_ID)

  await (admin.from('bookings') as any).upsert(
    [
      { id: BOOKING_INVOICE_NEW_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_MEERA_ID, title: 'Meera Patel - Portrait Session', event_type: 'portrait', event_date: addDays(20).toISOString().slice(0, 10), venue_name: 'Studio One, Surat', venue_state_id: 7, total_amount: 18000, advance_amount: 5000, amount_paid: 0, gst_type: 'cgst_sgst', status: 'contract_signed', package_id: PACKAGE_PORTRAIT_ID, package_snapshot: { id: PACKAGE_PORTRAIT_ID, name: 'Portrait Premium', turnaround_days: 10 } },
      { id: BOOKING_INVOICE_DUP_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_PRIYA_ID, title: 'Priya Sharma - Advance Billing', event_type: 'wedding', event_date: addDays(45).toISOString().slice(0, 10), venue_name: 'Emerald Banquet, Surat', venue_state_id: 7, total_amount: 85000, advance_amount: 25500, amount_paid: 0, gst_type: 'cgst_sgst', status: 'contract_signed', package_id: PACKAGE_WEDDING_ID, package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 } },
      { id: BOOKING_INVOICE_PAID_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_RAJ_ID, title: 'Raj Kumar - Paid Corporate Event', event_type: 'corporate', event_date: addDays(10).toISOString().slice(0, 10), venue_name: 'Convention Centre, Ahmedabad', venue_state_id: 7, total_amount: 25500, advance_amount: 25500, amount_paid: 25500, gst_type: 'cgst_sgst', status: 'advance_paid', package_id: PACKAGE_CORPORATE_ID, package_snapshot: { id: PACKAGE_CORPORATE_ID, name: 'Corporate Event', turnaround_days: 7 } },
      { id: BOOKING_INVOICE_OVERDUE_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_ANITA_ID, title: 'Anita Shah - Overdue Balance', event_type: 'portrait', event_date: addDays(-2).toISOString().slice(0, 10), venue_name: 'Lake View Resort, Ahmedabad', venue_state_id: 7, total_amount: 59500, advance_amount: 10000, amount_paid: 0, gst_type: 'cgst_sgst', status: 'contract_signed', package_id: PACKAGE_PORTRAIT_ID, package_snapshot: { id: PACKAGE_PORTRAIT_ID, name: 'Portrait Premium', turnaround_days: 10 } },
      { id: BOOKING_INVOICE_LINK_ID, studio_id: STUDIO_A_ID, client_id: CLIENT_DEV_ID, title: 'Dev Agarwal - Payment Link Invoice', event_type: 'corporate', event_date: addDays(25).toISOString().slice(0, 10), venue_name: 'Business Hub, Surat', venue_state_id: 7, total_amount: 50000, advance_amount: 10000, amount_paid: 10000, gst_type: 'cgst_sgst', status: 'contract_signed', package_id: PACKAGE_CORPORATE_ID, package_snapshot: { id: PACKAGE_CORPORATE_ID, name: 'Corporate Event', turnaround_days: 7 } },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('invoices') as any).upsert(
    [
      { id: INVOICE_DRAFT_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_DUP_ID, client_id: CLIENT_PRIYA_ID, invoice_number: 'XYZ-SEED-DRAFT', invoice_type: 'advance', status: 'draft', subtotal: 30000, gst_type: 'exempt', cgst_rate: 0, sgst_rate: 0, igst_rate: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, total_amount: 30000, amount_paid: 0, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, access_token: INVOICE_DRAFT_TOKEN, notes: 'Draft advance invoice' },
      { id: INVOICE_SENT_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_DUP_ID, client_id: CLIENT_PRIYA_ID, invoice_number: 'XYZ-SEED-SENT', invoice_type: 'advance', status: 'sent', subtotal: 25500, gst_type: 'exempt', cgst_rate: 0, sgst_rate: 0, igst_rate: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, total_amount: 25500, amount_paid: 0, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, due_date: futureDue, sent_at: sentAt, razorpay_order_id: 'order_seed_webhook', access_token: INVOICE_SENT_TOKEN },
      { id: INVOICE_PAID_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_PAID_ID, client_id: CLIENT_RAJ_ID, invoice_number: 'XYZ-SEED-PAID', invoice_type: 'advance', status: 'paid', subtotal: 21610.17, gst_type: 'cgst_sgst', cgst_rate: 9, sgst_rate: 9, igst_rate: 0, cgst_amount: 1944.92, sgst_amount: 1944.91, igst_amount: 0, total_amount: 25500, amount_paid: 25500, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, due_date: futureDue, paid_at: paidAt, access_token: INVOICE_PAID_TOKEN },
      { id: INVOICE_OVERDUE_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_OVERDUE_ID, client_id: CLIENT_ANITA_ID, invoice_number: 'XYZ-SEED-OVERDUE', invoice_type: 'balance', status: 'overdue', subtotal: 50423.73, gst_type: 'cgst_sgst', cgst_rate: 9, sgst_rate: 9, igst_rate: 0, cgst_amount: 4538.14, sgst_amount: 4538.13, igst_amount: 0, total_amount: 59500, amount_paid: 0, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, due_date: overdueDate, sent_at: sentAt, access_token: INVOICE_OVERDUE_TOKEN },
      { id: INVOICE_LINK_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_LINK_ID, client_id: CLIENT_DEV_ID, invoice_number: 'XYZ-SEED-LINK', invoice_type: 'advance', status: 'sent', subtotal: 42372.88, gst_type: 'cgst_sgst', cgst_rate: 9, sgst_rate: 9, igst_rate: 0, cgst_amount: 3813.56, sgst_amount: 3813.56, igst_amount: 0, total_amount: 50000, amount_paid: 10000, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, due_date: futureDue, sent_at: sentAt, razorpay_payment_link_id: 'plink_seed_001', payment_link_url: 'https://rzp.io/i/seed-link-001', payment_link_expires_at: linkExpiry, access_token: INVOICE_LINK_TOKEN },
      { id: INVOICE_CREDIT_NOTE_ID, studio_id: STUDIO_A_ID, booking_id: BOOKING_INVOICE_PAID_ID, client_id: CLIENT_RAJ_ID, invoice_number: 'XYZ-SEED-CN', invoice_type: 'credit_note', status: 'paid', subtotal: 5000, gst_type: 'exempt', cgst_rate: 0, sgst_rate: 0, igst_rate: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, total_amount: 5000, amount_paid: 5000, hsn_sac_code: '998389', place_of_supply: 'Gujarat', place_of_supply_state_id: 7, credit_note_for: INVOICE_PAID_ID, paid_at: paidAt, access_token: INVOICE_CREDIT_NOTE_TOKEN },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('invoice_line_items') as any).insert([
    { invoice_id: INVOICE_DRAFT_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance Photography', quantity: 1, unit_price: 30000, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_SENT_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance Photography', quantity: 1, unit_price: 25500, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_PAID_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Corporate Advance', quantity: 1, unit_price: 21610.17, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_OVERDUE_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Balance Payment', quantity: 1, unit_price: 50423.73, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_LINK_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance with Payment Link', quantity: 1, unit_price: 42372.88, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_CREDIT_NOTE_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Credit Note - XYZ-SEED-PAID', quantity: 1, unit_price: 5000, hsn_sac_code: '998389' },
  ])

  await (admin.from('payments') as any).upsert(
    [
      { id: PAYMENT_MANUAL_ID, studio_id: STUDIO_A_ID, invoice_id: INVOICE_PAID_ID, booking_id: BOOKING_INVOICE_PAID_ID, amount: 25500, currency: 'INR', method: 'cash', status: 'captured', payment_date: new Date().toISOString().slice(0, 10), captured_at: paidAt, notes: 'Seed manual payment' },
      { id: PAYMENT_RAZORPAY_ID, studio_id: STUDIO_A_ID, invoice_id: INVOICE_LINK_ID, booking_id: BOOKING_INVOICE_LINK_ID, amount: 10000, currency: 'INR', method: 'upi', status: 'captured', razorpay_payment_id: 'pay_seed_001', razorpay_order_id: 'order_seed_001', payment_date: new Date().toISOString().slice(0, 10), captured_at: paidAt },
    ],
    { onConflict: 'id' }
  )
}
