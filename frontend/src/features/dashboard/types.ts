export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type AttentionSeverity = 'red' | 'amber' | 'blue';

export interface DashboardGreeting {
  name: string;
  date: string;
  time_of_day: TimeOfDay;
}

export interface AttentionItem {
  type: string;
  severity: AttentionSeverity;
  title: string;
  subtitle: string;
  action_url: string;
}

export interface MonthKPIs {
  revenue_collected: string;
  revenue_pending: string;
  revenue_overdue: string;
  total_bookings: number;
  new_leads: number;
  is_estimated: boolean;
}

export interface WeekBooking {
  id: string;
  title: string;
  event_type: string;
  client_name: string;
}

export interface WeekDay {
  date: string;
  day_label: string;
  date_label: string;
  is_today: boolean;
  shoot_count: number;
  bookings: WeekBooking[];
}

export interface DashboardOverview {
  greeting: DashboardGreeting;
  attention_items: AttentionItem[];
  this_month: MonthKPIs;
  upcoming_week: { days: WeekDay[] };
}

export interface TeamMember {
  display_name: string;
  role: string;
}

export interface TodayShoot {
  id: string;
  title: string;
  event_type: string;
  client_name: string;
  client_phone: string | null;
  client_whatsapp: string | null;
  venue_name: string | null;
  call_time: string | null;
  shoot_start_time: string | null;
  shoot_end_time: string | null;
  venue_address: string | null;
  venue_map_link: string | null;
  assigned_team: TeamMember[];
}

export interface TodayDetail {
  date: string;
  shoot_count: number;
  has_shoots: boolean;
  shoots: TodayShoot[];
}
