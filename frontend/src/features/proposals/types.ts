export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type GstType = 'none' | 'cgst_sgst' | 'igst';

export interface ProposalLineItem {
  id: string;
  sort_order: number;
  item_type: string;
  name: string;
  description: string | null;
  hsn_sac_code: string | null;
  quantity: string; // decimal-as-string
  unit_price: string;
  total_price: string;
  addon_id: string | null;
}

export interface ProposalSummary {
  id: string;
  booking_id: string;
  booking_title: string;
  event_type: string;
  event_date: string | null;
  client_id: string;
  client_name: string;
  client_phone: string | null;
  version: number;
  status: ProposalStatus;
  subtotal: string;
  total_amount: string;
  valid_until: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface ProposalDetail extends ProposalSummary {
  gst_type: GstType;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  notes: string | null;
  is_expired: boolean;
  line_items: ProposalLineItem[];
  pdf_url: string | null;
}

export interface ProposalListParams {
  status?: ProposalStatus;
  booking_id?: string;
  page?: number;
  pageSize?: number;
}

// Non-paginated response — see api-issues.md #1
export interface ProposalListResponse {
  items: ProposalSummary[];
  total: number;
}
