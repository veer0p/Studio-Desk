import { z } from 'zod';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

// --- Team & Invitations ---
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'freelancer', 'editor']),
  display_name: z.string().optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(20),
  user_id: z.string().uuid().optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'freelancer', 'editor']).optional(),
  display_name: z.string().optional(),
  phone: phoneSchema.optional(),
  whatsapp: phoneSchema.optional(),
  specialization: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

// --- Availability ---
export const unavailabilitySchema = z.object({
  unavailable_date: z.string(),
  reason: z.string().optional(),
  all_day: z.boolean().default(true),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

// --- Assignments ---
export const createAssignmentSchema = z.object({
  booking_id: z.string().uuid(),
  member_id: z.string().uuid(),
  role: z.string().min(1),
  call_time: z.string(),
  call_location: z.string().optional(),
  day_rate: z.number().min(0).optional(),
  notes: z.string().optional(),
  force: z.boolean().default(false),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const freelancerPaymentSchema = z.object({
  amount: z.number().min(0),
  payment_method: z.string().min(1),
  reference_number: z.string().optional(),
  paid_at: z.string().optional(),
  notes: z.string().optional(),
});

// --- Automations ---
export const updateAutomationSettingsSchema = z.object({
  automations: z.array(z.object({
    automation_type: z.string(),
    is_enabled: z.boolean(),
    send_email: z.boolean(),
    send_whatsapp: z.boolean(),
    trigger_delay_hours: z.number().int().min(0),
    email_template_id: z.string().uuid().optional().nullable(),
    whatsapp_template_id: z.string().uuid().optional().nullable(),
  })),
});

export const createEmailTemplateSchema = z.object({
  automation_type: z.string(),
  name: z.string().min(1),
  subject: z.string().min(1),
  html_body: z.string().min(10),
  text_body: z.string().optional(),
});

export const registerWhatsappTemplateSchema = z.object({
  automation_type: z.string(),
  template_name: z.string().min(1),
  body_text: z.string().min(1),
  variables: z.array(z.string()).optional(),
});

export const triggerAutomationSchema = z.object({
  automation_type: z.string(),
  booking_id: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp']).optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type UnavailabilityInput = z.infer<typeof unavailabilitySchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type FreelancerPaymentInput = z.infer<typeof freelancerPaymentSchema>;
export type UpdateAutomationSettingsInput = z.infer<typeof updateAutomationSettingsSchema>;
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type TriggerAutomationInput = z.infer<typeof triggerAutomationSchema>;
