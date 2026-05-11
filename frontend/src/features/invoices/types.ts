export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type InvoiceType = 'advance' | 'balance' | 'full' | 'credit_note';

export type GstType = 'cgst_sgst' | 'igst' | 'exempt';

export type PaymentMethod =
  | 'cash'
  | 'neft'
  | 'rtgs'
  | 'cheque'
  | 'upi'
  | 'card'
  | 'net_banking'
  | 'other';

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  sort_order: number;
  name: string;
  description: string | null;
  hsn_sac_code: string;
  quantity: string; // decimal string
  unit_price: string; // decimal string
  amount: string; // quantity * unit_price, decimal string
}

// Amounts are decimal strings from flattenInvoice / money()
export interface InvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  subtotal: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  due_date: string | null;
  paid_at: string | null;
  sent_at: string | null;
  payment_link_url: string | null;
  booking_title: string;
  event_date: string | null;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDetail extends InvoiceSummary {
  studio_id: string;
  booking_id: string;
  client_id: string;
  gst_type: GstType;
  cgst_rate: string;
  sgst_rate: string;
  igst_rate: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  hsn_sac_code: string;
  credit_note_for: string | null;
  notes: string | null;
  internal_notes: string | null;
  pdf_url: string | null;
  viewed_at: string | null;
  event_type: string | null;
  venue_name: string | null;
  line_items: InvoiceLineItem[];
}

export interface InvoiceListParams {
  status?: InvoiceStatus;
  invoice_type?: InvoiceType;
  booking_id?: string;
  page?: number;
  pageSize?: number;
}

export interface RecordedPayment {
  id: string;
  invoice_id: string;
  amount: string;
  method: PaymentMethod;
  reference_number: string | null;
  payment_date: string | null;
  bank_name: string | null;
  notes: string | null;
  created_at: string;
}
