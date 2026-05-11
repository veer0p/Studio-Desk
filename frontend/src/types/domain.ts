/**
 * Domain types mirrored from backend. Modules extend these with their own
 * detail shapes inside `src/features/<module>/types.ts`.
 */

import type {
  EventType,
  GstType,
  InvoiceStatus,
  LeadStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '@/lib/constants/enums';

export interface StudioMember {
  id: string;
  studio_id: string;
  user_id: string;
  role: UserRole;
  display_name: string;
  phone: string | null;
  whatsapp: string | null;
  specialization: string[] | null;
  is_active: boolean;
  accepted_at: string | null;
  created_at: string;
}

export interface Studio {
  id: string;
  name: string;
  slug: string;
  brand_color: string | null;
  logo_url: string | null;
  gstin: string | null;
  storage_used_gb: number;
  storage_limit_gb: number;
  created_at: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    designation: string | null;
  };
  studio: Studio | null;
  member: StudioMember | null;
}

export type { EventType, GstType, InvoiceStatus, LeadStatus, PaymentMethod, PaymentStatus, UserRole };
