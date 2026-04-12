export type ApiResponse<T> = {
  data: T | null
  error: string | null
  code?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    count: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export type StudioContext = {
  studioId: string
  memberId: string
  role: UserRole
}

export type UserRole = 'owner' | 'photographer' | 'videographer' | 'editor' | 'assistant'

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
  | 'other'

export type LeadStatus =
  | 'new_lead'
  | 'contacted'
  | 'proposal_sent'
  | 'contract_signed'
  | 'advance_paid'
  | 'shoot_scheduled'
  | 'delivered'
  | 'closed'
  | 'lost'

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'

export type GstType = 'cgst_sgst' | 'igst' | 'exempt'

export type PaymentMethod =
  | 'upi'
  | 'card'
  | 'net_banking'
  | 'wallet'
  | 'cash'
  | 'neft'
  | 'rtgs'
  | 'cheque'
  | 'other'

export type PaymentStatus = 'pending' | 'processing' | 'captured' | 'failed' | 'refunded'

// Admin types
export type {
  AdminRole,
  PlatformAdmin,
  AdminSession,
  AdminLoginInput,
  AdminLoginResult,
  AdminContext,
  AuditLogEntry,
  FeatureFlag,
  PlatformSetting,
  SupportNote,
  StudioImpersonation,
} from './admin'
