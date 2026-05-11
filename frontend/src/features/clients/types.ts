export interface ClientSummary {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  company_name: string | null;
  gstin: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ClientBooking {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  status: string;
  total_amount: string; // decimal-as-string
  amount_paid: string;
  amount_pending: string;
}

export interface ClientStats {
  total_bookings: number;
  total_revenue: string; // decimal-as-string
  total_paid: string;
}

export interface ClientDetail extends ClientSummary {
  address: string | null;
  pincode: string | null;
  notes: string | null;
  stats: ClientStats;
  bookings: ClientBooking[];
}

export interface ClientListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}
