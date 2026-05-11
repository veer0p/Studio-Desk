import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { listPayments, getPayment } from '@/lib/api/endpoints/payments';
import type { PaymentListParams } from '@/features/payments/types';

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: queryKeys.payments.list(params as Record<string, unknown>),
    queryFn: () => listPayments(params),
    staleTime: 15_000,
  });
}

export function usePayment(id: string | null) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id ?? ''),
    queryFn: () => getPayment(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}
