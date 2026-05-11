import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
  sendProposal,
} from '@/lib/api/endpoints/proposals';
import type { ProposalListParams } from '@/features/proposals/types';
import type { CreateProposalInput, UpdateProposalInput } from '@/lib/validations/proposal.schema';

export function useProposals(params: ProposalListParams = {}) {
  return useQuery({
    queryKey: queryKeys.proposals.list(params as Record<string, unknown>),
    queryFn: () => listProposals(params),
    staleTime: 15_000,
  });
}

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id ?? ''),
    queryFn: () => getProposal(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProposalInput) => createProposal(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProposalInput }) =>
      updateProposal(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}

export function useDeleteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProposal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}

export function useSendProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendProposal(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
    },
  });
}
