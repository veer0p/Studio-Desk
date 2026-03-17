import { z } from 'zod';

// --- Shared ---
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

// --- Inquiry ---
export const inquiryFormSchema = z.object({
  full_name: z.string().min(2, 'Name is too short'),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  event_type: z.string().optional(),
  event_date: z.string().optional(),
  venue: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  message: z.string().optional(),
});

// --- Leads ---
export const createLeadSchema = z.object({
  full_name: z.string().min(2),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  status: z.string().optional(),
  source: z.string().optional(),
  event_type: z.string().optional(),
  event_date: z.string().optional(),
  venue: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['new_lead', 'contacted', 'proposal_sent', 'proposal_accepted', 'contract_signed', 'advance_paid', 'lost']).optional(),
  assigned_to: z.string().uuid().optional(),
  follow_up_at: z.string().optional(),
  notes: z.string().optional(),
  event_date_approx: z.string().optional(),
  venue: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const convertLeadSchema = z.object({
  package_id: z.string().uuid().optional(),
  event_date: z.string().min(1, 'Event date is required'),
  venue_name: z.string().min(1, 'Venue name is required'),
  venue_address: z.string().optional(),
  venue_city: z.string().min(1, 'City is required'),
  venue_state: z.string().min(1, 'State is required'),
  total_amount: z.number().min(1),
  advance_amount: z.number().min(0),
  notes: z.string().optional(),
});

// --- Clients ---
export const createClientSchema = z.object({
  full_name: z.string().min(2),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gstin: z.string().length(15).optional().or(z.literal('')),
  company_name: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// --- Proposals ---
export const createProposalSchema = z.object({
  booking_id: z.string().uuid(),
  package_id: z.string().uuid().optional(),
  line_items: z.array(z.object({
    name: z.string().min(1),
    hsn_sac_code: z.string().optional(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
  })).min(1),
  valid_until: z.string(),
  notes: z.string().optional(),
});

export const updateProposalSchema = createProposalSchema.partial();

// --- Contracts ---
export const createContractSchema = z.object({
  booking_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  custom_content_html: z.string().optional(),
});

export const signContractSchema = z.object({
  signature_data: z.string().min(10, 'Signature is too short'),
  signer_name: z.string().min(2),
});

export const revisionRequestSchema = z.object({
  revision_note: z.string().min(10, 'Please provide a detailed revision note'),
});

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type SignContractInput = z.infer<typeof signContractSchema>;
