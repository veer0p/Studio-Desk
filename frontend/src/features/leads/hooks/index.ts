import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} from '@/lib/api/endpoints/leads';
import type { LeadListParams } from '@/features/leads/types';
import type { CreateLeadInput, UpdateLeadInput, ConvertLeadInput } from '@/lib/validations/lead.schema';

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(params as Record<string, unknown>),
    queryFn: () => listLeads(params),
    staleTime: 15_000,
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id ?? ''),
    queryFn: () => getLead(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadInput) => createLead(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) => updateLead(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadInput }) => convertLead(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}
