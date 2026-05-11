import { apiGet, apiGetList, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type { LeadSummary, LeadDetail, LeadListParams } from '@/features/leads/types';
import type { CreateLeadInput, UpdateLeadInput, ConvertLeadInput } from '@/lib/validations/lead.schema';

function toSearchParams(params: LeadListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.q) out.search = params.q;
  if (params.status) out.status = params.status;
  if (params.source) out.source = params.source;
  if (params.event_type) out.event_type = params.event_type;
  if (params.assigned_to) out.assigned_to = params.assigned_to;
  if (params.from) out.from_date = params.from;
  if (params.to) out.to_date = params.to;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listLeads(params: LeadListParams = {}) {
  return apiGetList<LeadSummary>('leads', { searchParams: toSearchParams(params) });
}

export function getLead(id: string) {
  return apiGet<LeadDetail>(`leads/${id}`);
}

export function createLead(data: CreateLeadInput) {
  return apiPost<LeadDetail>('leads', data);
}

export function updateLead(id: string, data: UpdateLeadInput) {
  return apiPatch<LeadDetail>(`leads/${id}`, data);
}

export function deleteLead(id: string) {
  return apiDelete<void>(`leads/${id}`);
}

export function convertLead(id: string, data: ConvertLeadInput) {
  return apiPost<{ booking_id: string }>(`leads/${id}/convert`, data);
}
