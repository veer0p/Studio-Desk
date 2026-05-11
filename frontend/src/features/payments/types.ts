export type PaymentStatus = 'pending' | 'processing' | 'captured' | 'failed' | 'refunded';

export type PaymentMethod =
  | 'cash'
  | 'neft'
  | 'rtgs'
  | 'cheque'
  | 'upi'
  | 'card'
  | 'net_banking'
  | 'wallet'
  | 'other';

export interface PaymentSummary {
  id: string;
  studio_id: string;
  invoice_id: string | null;
  booking_id: string | null;
  amount: string; // decimal string from money()
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  reference_number: string | null;
  payment_date: string | null;
  bank_name: string | null;
  notes: string | null;
  captured_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  invoice_number: string | null;
  booking_title: string | null;
}

export type PaymentDetail = PaymentSummary;

export interface PaymentListParams {
  invoice_id?: string;
  booking_id?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  page?: number;
  pageSize?: number;
}
