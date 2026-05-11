import { apiGet, apiGetList } from '@/lib/api/client';
import type { PaymentSummary, PaymentDetail, PaymentListParams } from '@/features/payments/types';

function toSearchParams(params: PaymentListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.invoice_id) out.invoice_id = params.invoice_id;
  if (params.booking_id) out.booking_id = params.booking_id;
  if (params.status) out.status = params.status;
  if (params.method) out.method = params.method;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listPayments(params: PaymentListParams = {}) {
  return apiGetList<PaymentSummary>('payments', { searchParams: toSearchParams(params) });
}

export function getPayment(id: string) {
  return apiGet<PaymentDetail>(`payments/${id}`);
}
