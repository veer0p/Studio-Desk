export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled';

export interface ContractSummary {
  id: string;
  booking_id: string;
  booking_title: string;
  event_type: string | null;
  event_date: string | null;
  client_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  status: ContractStatus;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
}

export interface ContractDetail extends ContractSummary {
  template_id: string | null;
  content_html: string;
  notes: string | null;
  signed_ip: string | null;
  signed_pdf_url: string | null;
}

export interface ContractListParams {
  status?: ContractStatus;
  booking_id?: string;
  page?: number;
  pageSize?: number;
}
