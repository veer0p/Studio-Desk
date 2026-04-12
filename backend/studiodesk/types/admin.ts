export type AdminRole = 'super_admin' | 'support_agent' | 'billing_admin' | 'readonly_analyst'

export type PlatformAdmin = {
  id: string
  user_id: string
  name: string
  email: string
  role: AdminRole
  is_active: boolean
  is_2fa_enabled: boolean
  last_login_at: string | null
  login_count: number
  notes: string | null
}

export type AdminSession = {
  id: string
  session_token: string
  ip_address: string
  user_agent: string | null
  created_at: string
  last_active_at: string
  expires_at: string
  revoked_at: string | null
}

export type AdminLoginInput = {
  email: string
  password: string
}

export type AdminLoginResult = {
  admin: PlatformAdmin
  session: AdminSession
}

export type AdminContext = {
  admin: PlatformAdmin
  session_token: string
}

export type AuditLogEntry = {
  id: string
  admin_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type FeatureFlag = {
  id: string
  flag_name: string
  description: string | null
  is_enabled: boolean
  enabled_for_tiers: string[]
  override_studio_id: string | null
  created_at: string
  updated_at: string
}

export type PlatformSetting = {
  id: string
  key: string
  value: string | null
  value_json: Record<string, unknown> | null
  description: string | null
  is_public: boolean
  updated_at: string
}

export type SupportNote = {
  id: string
  studio_id: string
  admin_id: string
  note: string
  is_flagged: boolean
  created_at: string
  updated_at: string
}

export type StudioImpersonation = {
  id: string
  admin_id: string
  studio_id: string
  reason: string
  started_at: string
  ended_at: string | null
  ip_address: string | null
  actions_taken: string[]
}
