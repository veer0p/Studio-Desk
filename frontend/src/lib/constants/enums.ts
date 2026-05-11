/**
 * Domain enums — mirrored from `backend/studiodesk/types/index.ts`.
 * When the backend adds a value, sync this file.
 */

export const USER_ROLES = ['owner', 'photographer', 'videographer', 'editor', 'assistant'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_TYPES = [
  'wedding',
  'pre_wedding',
  'engagement',
  'portrait',
  'birthday',
  'corporate',
  'product',
  'maternity',
  'newborn',
  'other',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const LEAD_STATUSES = [
  'new_lead',
  'contacted',
  'proposal_sent',
  'contract_signed',
  'advance_paid',
  'shoot_scheduled',
  'delivered',
  'closed',
  'lost',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const GST_TYPES = ['cgst_sgst', 'igst', 'exempt'] as const;
export type GstType = (typeof GST_TYPES)[number];

export const PAYMENT_METHODS = [
  'upi',
  'card',
  'net_banking',
  'wallet',
  'cash',
  'neft',
  'rtgs',
  'cheque',
  'other',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'captured',
  'failed',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const LEAD_SOURCES = [
  'inquiry_form',
  'referral',
  'instagram',
  'facebook',
  'google',
  'walk_in',
  'phone',
  'other',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_PRIORITIES = ['high', 'medium', 'low'] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

/** Human-readable labels for UI. Indian English voice. */
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new_lead: 'New lead',
  contacted: 'Contacted',
  proposal_sent: 'Proposal sent',
  contract_signed: 'Contract signed',
  advance_paid: 'Advance paid',
  shoot_scheduled: 'Shoot scheduled',
  delivered: 'Delivered',
  closed: 'Closed',
  lost: 'Lost',
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  wedding: 'Wedding',
  pre_wedding: 'Pre-wedding',
  engagement: 'Engagement',
  portrait: 'Portrait',
  birthday: 'Birthday',
  corporate: 'Corporate',
  product: 'Product',
  maternity: 'Maternity',
  newborn: 'Newborn',
  other: 'Other',
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  inquiry_form: 'Inquiry form',
  referral: 'Referral',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  walk_in: 'Walk-in',
  phone: 'Phone',
  other: 'Other',
};

export const LEAD_PRIORITY_LABEL: Record<LeadPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  net_banking: 'Net banking',
  wallet: 'Wallet',
  cash: 'Cash',
  neft: 'NEFT',
  rtgs: 'RTGS',
  cheque: 'Cheque',
  other: 'Other',
};
