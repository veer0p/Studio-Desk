import { apiGet, apiGetList, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type { ClientSummary, ClientDetail, ClientListParams } from '@/features/clients/types';
import type { CreateClientInput, UpdateClientInput } from '@/lib/validations/client.schema';

function toSearchParams(params: ClientListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.q) out.search = params.q;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listClients(params: ClientListParams = {}) {
  return apiGetList<ClientSummary>('clients', { searchParams: toSearchParams(params) });
}

export function getClient(id: string) {
  return apiGet<ClientDetail>(`clients/${id}`);
}

export function createClient(data: CreateClientInput) {
  return apiPost<ClientSummary>('clients', data);
}

export function updateClient(id: string, data: UpdateClientInput) {
  return apiPatch<ClientSummary>(`clients/${id}`, data);
}

export function deleteClient(id: string) {
  return apiDelete<void>(`clients/${id}`);
}
