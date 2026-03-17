/**
 * Common types used across the application.
 */

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  code?: string;
}

export interface ApiError {
  error: string;
  code: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface StudioContext {
  studioId: string;
  memberId: string;
  role: UserRole;
}

// These should match your DB enums exactly
export type UserRole = 'owner' | 'photographer' | 'videographer' | 'editor' | 'assistant';

export type EventType = 
  | 'wedding' 
  | 'engagement' 
  | 'pre_wedding' 
  | 'birthday' 
  | 'corporate' 
  | 'other';

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'proposal_sent' 
  | 'contract_sent' 
  | 'won' 
  | 'lost' 
  | 'spam';

export type InvoiceStatus = 
  | 'draft' 
  | 'sent' 
  | 'partially_paid' 
  | 'paid' 
  | 'void' 
  | 'overdue'
  | 'cancelled';

export type GstType = 'cgst_sgst' | 'igst' | 'exempt';

export type InvoiceType = 'advance' | 'balance' | 'full' | 'credit_note';

export type PaymentMethod = 
  | 'upi' 
  | 'card' 
  | 'net_banking' 
  | 'cash' 
  | 'neft' 
  | 'rtgs' 
  | 'cheque' 
  | 'other';

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string;
  client_id: string;
  studio_id: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  gst_total: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  notes?: string;
  items: InvoiceItem[];
  gst_type: GstType;
  signed_url?: string;
  razorpay_link_id?: string;
  razorpay_link_url?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsn_sac?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference_number?: string;
  payment_date: string;
  notes?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  status: 'captured' | 'failed' | 'refunded';
  created_at: string;
}
export interface StudioMember {
  id: string;
  studio_id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  specializations: string[];
  phone?: string;
  whatsapp?: string;
  bio?: string;
  day_rate?: number;
  avatar_url?: string;
  joined_at: string;
  last_active_at?: string;
}

export interface Assignment {
  id: string;
  booking_id: string;
  member_id: string;
  role: string;
  call_time?: string;
  call_location?: string;
  day_rate?: number;
  is_confirmed: boolean;
  notes?: string;
  shoot_brief?: string;
  payment_status: 'pending' | 'paid';
  payment_reference?: string;
  paid_at?: string;
  created_at: string;
  member?: Partial<StudioMember>;
}

export interface Unavailability {
  id: string;
  member_id: string;
  date: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export type AutomationType = 
  | 'lead_acknowledgment'
  | 'contract_reminder'
  | 'advance_payment_reminder'
  | 'shoot_reminder_client'
  | 'shoot_assignment_team'
  | 'gallery_ready'
  | 'balance_payment_reminder'
  | 'review_request';

export interface AutomationSetting {
  id: string;
  studio_id: string;
  type: AutomationType;
  is_enabled: boolean;
  channels: {
    email: boolean;
    whatsapp: boolean;
  };
  timing_days: number;
  email_template_id?: string;
  whatsapp_template_id?: string;
  last_sent_at?: string;
}

export type TemplateStatus = 'pending_approval' | 'approved' | 'rejected' | 'disabled';

export interface Template {
  id: string;
  studio_id: string;
  name: string;
  type: 'email' | 'whatsapp';
  automation_type: AutomationType;
  subject?: string; // For email
  body: string;
  is_default: boolean;
  status: TemplateStatus;
  rejection_reason?: string;
  variable_mapping?: Record<string, string>; // For WhatsApp numbered vars
  last_modified_at: string;
}

export type NotificationType = 
  | 'new_lead' 
  | 'proposal_accepted' 
  | 'contract_signed' 
  | 'payment_received' 
  | 'team_confirmed' 
  | 'gallery_viewed' 
  | 'storage_warning' 
  | 'system';

export interface Notification {
  id: string;
  studio_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface BookingCalendarEntry {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  call_time?: string;
  venue_city?: string;
  assignments: AssignmentSummary[];
}

export interface AssignmentSummary {
  member_name: string;
  role: string;
  is_confirmed: boolean;
  avatar_url?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
