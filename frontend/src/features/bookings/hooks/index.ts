import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listBookings,
  getBooking,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingActivity,
  getShootBrief,
  upsertShootBrief,
} from '@/lib/api/endpoints/bookings';
import type { BookingListParams } from '@/features/bookings/types';
import type { CreateBookingInput, UpdateBookingInput, UpdateStatusInput } from '@/lib/validations/booking.schema';

export function useBookings(params: BookingListParams = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params as Record<string, unknown>),
    queryFn: () => listBookings(params),
    staleTime: 15_000,
  });
}

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ''),
    queryFn: () => getBooking(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useBookingActivity(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.activity(id ?? ''),
    queryFn: () => getBookingActivity(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useShootBrief(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.shootBrief(id ?? ''),
    queryFn: () => getShootBrief(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) => createBooking(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingInput }) => updateBooking(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusInput }) => updateBookingStatus(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpsertShootBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof upsertShootBrief>[1] }) =>
      upsertShootBrief(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.shootBrief(id) });
    },
  });
}
