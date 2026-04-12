import { z } from 'zod'

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const auditLogQuerySchema = z.object({
  admin_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  action: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const studioListQuerySchema = z.object({
  search: z.string().optional(),
  plan_tier: z.string().optional(),
  subscription_status: z.string().optional(),
  is_suspended: z.coerce.boolean().optional(),
  page: z.coerce.number().min(0).default(0),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const createFeatureFlagSchema = z.object({
  flag_name: z.string().min(1).regex(/^[a-z_]+$/, 'Must be lowercase with underscores'),
  description: z.string().optional().nullable(),
  is_enabled: z.boolean().default(false),
  enabled_for_tiers: z.array(z.string()).default([]).nullable(),
  override_studio_id: z.string().uuid().optional().nullable(),
})

export const updateFeatureFlagSchema = z.object({
  flag_name: z.string().min(1).regex(/^[a-z_]+$/, 'Must be lowercase with underscores').optional(),
  description: z.string().nullable().optional(),
  is_enabled: z.boolean().optional(),
  enabled_for_tiers: z.array(z.string()).nullable().optional(),
  override_studio_id: z.string().uuid().nullable().optional(),
})

export const updatePlatformSettingSchema = z.object({
  value: z.string().optional(),
  value_json: z.any().optional(),
})

export const suspendStudioSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

export const impersonateStudioSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

export const createSupportNoteSchema = z.object({
  note: z.string().min(1).max(5000),
  is_flagged: z.boolean().default(false),
})

// 2FA schemas
export const setup2FASchema = z.object({
  // No input needed — server generates secret
})

export const verify2FASchema = z.object({
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d{6}$/),
})

export const enable2FASchema = z.object({
  secret: z.string().min(1),
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d{6}$/),
})

export const login2FASchema = z.object({
  admin_id: z.string().uuid(),
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d{6}$/),
  session_token: z.string().optional(), // Temp session from first login step
})

export type CreateSupportNoteInput = z.infer<typeof createSupportNoteSchema>
export type Setup2FAInput = z.infer<typeof setup2FASchema>
export type Verify2FAInput = z.infer<typeof verify2FASchema>
export type Enable2FAInput = z.infer<typeof enable2FASchema>
export type Login2FAInput = z.infer<typeof login2FASchema>
