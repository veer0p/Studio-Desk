import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type {
  BookingDetail,
  BookingListParams,
  BookingListResponse,
  BookingActivity,
  ShootBrief,
} from '@/features/bookings/types';
import type { CreateBookingInput, UpdateBookingInput, UpdateStatusInput } from '@/lib/validations/booking.schema';

function toSearchParams(params: BookingListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status) out.status = params.status;
  if (params.event_type) out.event_type = params.event_type;
  if (params.search) out.search = params.search;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

// GET /bookings returns { data, count } via Response.ok, not Response.paginated.
// Using apiGet with custom type. See api-issues.md #3.
export function listBookings(params: BookingListParams = {}) {
  return apiGet<BookingListResponse>('bookings', { searchParams: toSearchParams(params) });
}

export function getBooking(id: string) {
  return apiGet<BookingDetail>(`bookings/${id}`);
}

export function createBooking(data: CreateBookingInput) {
  return apiPost<BookingDetail>('bookings', data);
}

export function updateBooking(id: string, data: UpdateBookingInput) {
  return apiPatch<BookingDetail>(`bookings/${id}`, data);
}

export function updateBookingStatus(id: string, data: UpdateStatusInput) {
  return apiPatch<BookingDetail>(`bookings/${id}/status`, data);
}

export function deleteBooking(id: string) {
  return apiDelete<{ success: boolean }>(`bookings/${id}`);
}

export function getBookingActivity(id: string) {
  return apiGet<BookingActivity[]>(`bookings/${id}/activity`);
}

export function getShootBrief(id: string) {
  return apiGet<ShootBrief | null>(`bookings/${id}/shoot-brief`);
}

export function upsertShootBrief(id: string, data: Partial<Omit<ShootBrief, 'id' | 'booking_id' | 'created_at' | 'updated_at'>>) {
  return apiPost<ShootBrief>(`bookings/${id}/shoot-brief`, data);
}
