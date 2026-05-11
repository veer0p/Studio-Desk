import { apiGet, apiGetList, apiPost, apiPatch } from '@/lib/api/client';
import type {
  InvoiceSummary,
  InvoiceDetail,
  InvoiceListParams,
  RecordedPayment,
} from '@/features/invoices/types';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  CreditNoteInput,
} from '@/lib/validations/invoice.schema';

function toSearchParams(params: InvoiceListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status) out.status = params.status;
  if (params.invoice_type) out.invoice_type = params.invoice_type;
  if (params.booking_id) out.booking_id = params.booking_id;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listInvoices(params: InvoiceListParams = {}) {
  return apiGetList<InvoiceSummary>('invoices', { searchParams: toSearchParams(params) });
}

export function getInvoice(id: string) {
  return apiGet<InvoiceDetail>(`invoices/${id}`);
}

export function createInvoice(data: CreateInvoiceInput) {
  return apiPost<InvoiceDetail>('invoices', data);
}

export function updateInvoice(id: string, data: UpdateInvoiceInput) {
  return apiPatch<InvoiceDetail>(`invoices/${id}`, data);
}

export function sendInvoice(id: string) {
  return apiPost<InvoiceDetail>(`invoices/${id}/send`);
}

export function recordPayment(id: string, data: RecordPaymentInput) {
  return apiPost<RecordedPayment>(`invoices/${id}/record-payment`, data);
}

export function createCreditNote(id: string, data: CreditNoteInput) {
  return apiPost<InvoiceDetail>(`invoices/${id}/credit-note`, data);
}

export function generatePaymentLink(id: string) {
  return apiPost<{ payment_link_url: string }>(`invoices/${id}/payment-link`);
}
