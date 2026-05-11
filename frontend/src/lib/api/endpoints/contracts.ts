import { apiGet, apiGetList, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type { ContractSummary, ContractDetail, ContractListParams } from '@/features/contracts/types';
import type { CreateContractInput, UpdateContractInput } from '@/lib/validations/contract.schema';

function toSearchParams(params: ContractListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status) out.status = params.status;
  if (params.booking_id) out.booking_id = params.booking_id;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listContracts(params: ContractListParams = {}) {
  return apiGetList<ContractSummary>('contracts', { searchParams: toSearchParams(params) });
}

export function getContract(id: string) {
  return apiGet<ContractDetail>(`contracts/${id}`);
}

export function createContract(data: CreateContractInput) {
  return apiPost<ContractDetail>('contracts', data);
}

export function updateContract(id: string, data: UpdateContractInput) {
  return apiPatch<ContractDetail>(`contracts/${id}`, data);
}

export function deleteContract(id: string) {
  return apiDelete<void>(`contracts/${id}`);
}

export function sendContract(id: string) {
  return apiPost<ContractDetail>(`contracts/${id}/send`);
}

export function remindContract(id: string) {
  return apiPost<{ reminded_at: string }>(`contracts/${id}/remind`);
}
