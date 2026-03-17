import { z } from 'zod';

// --- Portal Auth ---

export const sendMagicLinkSchema = z.object({
  client_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
});

export const verifyMagicTokenSchema = z.object({
  token: z.string().min(1),
});

// --- Portal Questionnaire ---

export const questionnaireResponseSchema = z.object({
  must_have_shots: z.string().optional(),
  people_to_photograph: z.string().optional(),
  highlight_song: z.string().optional(),
  venue_access_notes: z.string().optional(),
  vendor_contacts: z.string().optional(),
});

// --- Portal Actions ---

export const portalSignContractSchema = z.object({
  signature_data: z.string().min(1),
  signer_name: z.string().min(1),
});

export const portalPayInvoiceSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// --- Dashboard & Settings ---

export const updateStudioSettingsSchema = z.object({
  studio: z.object({
    name: z.string().min(1).optional(),
    tagline: z.string().optional(),
    logo_url: z.string().url().optional().or(z.literal('')),
    brand_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().or(z.literal('')),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().or(z.literal('')),
    business_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_ifsc: z.string().optional(),
    invoice_prefix: z.string().optional(),
    default_advance_pct: z.number().min(1).max(99).optional(),
    default_hsn_code: z.string().optional(),
  }),
  settings: z.object({
    email_from_name: z.string().optional(),
    timezone: z.string().optional(),
    notification_prefs: z.record(z.boolean()).optional(),
    gallery_defaults: z.record(z.any()).optional(),
  }).optional(),
});

export const notificationPrefsSchema = z.record(z.boolean());

export const razorpayConnectSchema = z.object({
  key_id: z.string().min(1),
  key_secret: z.string().min(1),
});

export const whatsappSettingsSchema = z.object({
  provider: z.enum(['official', 'interakt', 'aisensy', 'whatsapp_cloud']),
  api_key: z.string().min(1),
  phone_number: z.string().min(1),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.enum([
    'bookings:read', 
    'bookings:write',
    'invoices:read', 
    'gallery:read', 
    'webhooks:write'
  ])).min(1),
  expires_at: z.string().datetime().optional(),
});

export const dataExportRequestSchema = z.object({
  request_type: z.enum(['full', 'bookings', 'clients', 'financial']),
});

export const onboardingStepSchema = z.object({
  step_number: z.number().min(1).max(5),
  time_spent_sec: z.number().optional(),
});

export const subscriptionChangeSchema = z.object({
  plan_tier: z.enum(['free', 'starter', 'pro', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'yearly']),
});

export const npsResponseSchema = z.object({
  score: z.number().min(0).max(10),
  comment: z.string().max(1000).optional(),
});

// --- Types ---

export type SendMagicLinkInput = z.infer<typeof sendMagicLinkSchema>;
export type VerifyMagicTokenInput = z.infer<typeof verifyMagicTokenSchema>;
export type QuestionnaireResponseInput = z.infer<typeof questionnaireResponseSchema>;
export type PortalSignContractInput = z.infer<typeof portalSignContractSchema>;
export type PortalPayInvoiceInput = z.infer<typeof portalPayInvoiceSchema>;
export type UpdateStudioSettingsInput = z.infer<typeof updateStudioSettingsSchema>;
export type RazorpayConnectInput = z.infer<typeof razorpayConnectSchema>;
export type WhatsappSettingsInput = z.infer<typeof whatsappSettingsSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type DataExportRequestInput = z.infer<typeof dataExportRequestSchema>;
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>;
export type SubscriptionChangeInput = z.infer<typeof subscriptionChangeSchema>;
export type NPSResponseInput = z.infer<typeof npsResponseSchema>;
