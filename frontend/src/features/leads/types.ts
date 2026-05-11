import type { LeadStatus, LeadSource, LeadPriority, EventType } from '@/lib/constants/enums';

export interface LeadClient {
  full_name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
}

export interface LeadSummary {
  id: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  event_type: EventType | null;
  event_date_approx: string | null; // 'YYYY-MM-DD'
  venue: string | null;
  budget_min: string | null; // decimal-as-string, INR rupees
  budget_max: string | null;
  follow_up_at: string | null; // ISO datetime
  last_contacted_at: string | null;
  converted_to_booking: boolean;
  booking_id: string | null;
  notes: string | null;
  days_since_created: number;
  client: LeadClient;
  created_at: string;
  updated_at: string;
}

export interface LeadDetail extends LeadSummary {
  form_data: unknown;
  assignee_name?: string | null;
}

export interface LeadListParams {
  q?: string;
  status?: LeadStatus;
  source?: LeadSource;
  event_type?: EventType;
  assigned_to?: string;
  from?: string; // YYYY-MM-DD
  to?: string;
  page?: number;
  pageSize?: number;
}
