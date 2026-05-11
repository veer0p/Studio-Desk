import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '@/lib/api/endpoints/clients';
import type { ClientListParams } from '@/features/clients/types';
import type { CreateClientInput, UpdateClientInput } from '@/lib/validations/client.schema';

export function useClients(params: ClientListParams = {}) {
  return useQuery({
    queryKey: queryKeys.clients.list(params as Record<string, unknown>),
    queryFn: () => listClients(params),
    staleTime: 15_000,
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id ?? ''),
    queryFn: () => getClient(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientInput) => createClient(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) => updateClient(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}
