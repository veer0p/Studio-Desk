import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  sendInvoice,
  recordPayment,
  createCreditNote,
  generatePaymentLink,
} from '@/lib/api/endpoints/invoices';
import type { InvoiceListParams } from '@/features/invoices/types';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  CreditNoteInput,
} from '@/lib/validations/invoice.schema';

export function useInvoices(params: InvoiceListParams = {}) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params as Record<string, unknown>),
    queryFn: () => listInvoices(params),
    staleTime: 15_000,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id ?? ''),
    queryFn: () => getInvoice(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => createInvoice(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceInput }) => updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendInvoice(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordPaymentInput }) =>
      recordPayment(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useCreateCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreditNoteInput }) =>
      createCreditNote(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useGeneratePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => generatePaymentLink(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
    },
  });
}
