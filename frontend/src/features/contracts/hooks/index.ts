import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  sendContract,
  remindContract,
} from '@/lib/api/endpoints/contracts';
import type { ContractListParams } from '@/features/contracts/types';
import type { CreateContractInput, UpdateContractInput } from '@/lib/validations/contract.schema';

export function useContracts(params: ContractListParams = {}) {
  return useQuery({
    queryKey: queryKeys.contracts.list(params as Record<string, unknown>),
    queryFn: () => listContracts(params),
    staleTime: 15_000,
  });
}

export function useContract(id: string | null) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(id ?? ''),
    queryFn: () => getContract(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContractInput) => createContract(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractInput }) =>
      updateContract(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
}

export function useSendContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendContract(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
}

export function useRemindContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindContract(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.contracts.detail(id) });
    },
  });
}
