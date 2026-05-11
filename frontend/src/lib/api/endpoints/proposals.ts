import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type {
  ProposalSummary,
  ProposalDetail,
  ProposalListParams,
  ProposalListResponse,
} from '@/features/proposals/types';
import type { CreateProposalInput, UpdateProposalInput } from '@/lib/validations/proposal.schema';

function toSearchParams(params: ProposalListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status) out.status = params.status;
  if (params.booking_id) out.booking_id = params.booking_id;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

// GET /proposals returns { items, total } via Response.ok, not Response.paginated.
// Using apiGet with custom type. See api-issues.md #1.
export function listProposals(params: ProposalListParams = {}) {
  return apiGet<ProposalListResponse>('proposals', { searchParams: toSearchParams(params) });
}

export function getProposal(id: string) {
  return apiGet<ProposalDetail>(`proposals/${id}`);
}

export function createProposal(data: CreateProposalInput) {
  return apiPost<ProposalDetail>('proposals', data);
}

export function updateProposal(id: string, data: UpdateProposalInput) {
  return apiPatch<ProposalDetail>(`proposals/${id}`, data);
}

export function deleteProposal(id: string) {
  return apiDelete<{ deleted: boolean }>(`proposals/${id}`);
}

export function sendProposal(id: string) {
  return apiPost<ProposalDetail>(`proposals/${id}/send`);
}

// Satisfies TS: keep aligned with ProposalSummary export
export type { ProposalSummary };
