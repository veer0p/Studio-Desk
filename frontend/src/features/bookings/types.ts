export type BookingStatus =
  | 'new_lead'
  | 'contacted'
  | 'proposal_sent'
  | 'booked'
  | 'partially_paid'
  | 'paid'
  | 'shoot_completed'
  | 'delivered'
  | 'closed'
  | 'lost';

export type EventType =
  | 'wedding'
  | 'pre_wedding'
  | 'engagement'
  | 'portrait'
  | 'birthday'
  | 'corporate'
  | 'product'
  | 'maternity'
  | 'newborn'
  | 'other';

export type GstType = 'none' | 'cgst_sgst' | 'igst';

export interface BookingSummary {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string | null;
  venue_name: string | null;
  status: BookingStatus;
  total_amount: number;
  amount_paid: number;
  amount_pending: number;
  advance_amount: number;
  lead_id: string | null;
  package_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  package_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingDetail extends BookingSummary {
  client_id: string;
  gst_type: GstType;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  subtotal: number;
  notes: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  venue_pincode: string | null;
  event_end_date: string | null;
  package_snapshot: {
    id: string;
    name: string;
    base_price: number;
    line_items: unknown[];
  } | null;
  amount_paid: number;
  deleted_at: string | null;
}

export interface BookingActivity {
  id: string;
  event_type: string;
  actor_id: string | null;
  actor_type: 'member' | 'system' | 'client';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ShootBrief {
  id: string;
  booking_id: string;
  shot_list: string | null;
  mood_board_url: string | null;
  special_requests: string | null;
  location_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingListResponse {
  data: BookingSummary[];
  count: number;
}

export interface BookingListParams {
  status?: BookingStatus;
  event_type?: EventType;
  search?: string;
  page?: number;
  pageSize?: number;
}
