import { createClient } from '@/lib/supabase/client'

const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

interface ApiResponse<T> {
  data: T | null
  error: string | null
  code?: string
}

interface PaginatedApiResponse<T> {
  data: T[]
  meta: {
    count: number
    page: number
    pageSize: number
    totalPages: number
  }
  error: string | null
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1/admin${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    const error: ApiResponse<null> = await res.json().catch(() => ({ data: null, error: 'Request failed' }))
    throw new Error(error.error || error.code || `HTTP ${res.status}`)
  }

  const json: ApiResponse<T> | PaginatedApiResponse<any> = await res.json()
  return json.data as T
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  const data = json.data as { admin?: AdminRecord; session_token?: string; requires_2fa?: boolean; admin_id?: string }

  if (data.requires_2fa) {
    return { requires_2fa: true, admin_id: data.admin_id! }
  }

  return { requires_2fa: false, admin: data.admin!, session_token: data.session_token! }
}

export async function adminLogin2FA(adminId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/auth/login/2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ admin_id: adminId, token }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '2FA verification failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as { admin: AdminRecord; session_token: string }
}

export async function adminLogout() {
  return fetchApi('/auth/logout', { method: 'POST' })
}

export async function getAdminMe() {
  return fetchApi<AdminRecord>('/auth/me')
}

// ── Dashboard ─────────────────────────────────────────────────────────

export async function fetchAdminDashboard() {
  return fetchApi<AdminDashboardData>('/dashboard')
}

// ── Studios ───────────────────────────────────────────────────────────

export async function fetchAdminStudios(params: {
  search?: string
  plan_tier?: string
  subscription_status?: string
  is_suspended?: boolean
  page?: number
  pageSize?: number
}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.plan_tier) qs.set('plan_tier', params.plan_tier)
  if (params.subscription_status) qs.set('subscription_status', params.subscription_status)
  if (params.is_suspended !== undefined) qs.set('is_suspended', String(params.is_suspended))
  if (params.page !== undefined) qs.set('page', String(params.page))
  if (params.pageSize !== undefined) qs.set('pageSize', String(params.pageSize))

  const res = await fetch(`${API_BASE}/api/v1/admin/studios?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch studios' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json() as PaginatedApiResponse<StudioRecord>
  return { studios: json.data, meta: json.meta }
}

export async function fetchAdminStudioDetail(id: string) {
  return fetchApi<StudioDetailData>(`/studios/${id}`)
}

export async function suspendStudio(id: string, reason: string) {
  return fetchApi<{ suspended: boolean; studio: { name: string; slug: string } }>(`/studios/${id}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export async function reactivateStudio(id: string, reason: string) {
  return fetchApi<{ reactivated: boolean; studio: { name: string; slug: string } }>(`/studios/${id}/reactivate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export async function impersonateStudio(id: string, reason: string) {
  return fetchApi<{ impersonation_id: string; studio: { name: string; slug: string }; message: string }>(
    `/studios/${id}/impersonate`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  )
}

// ── Types ─────────────────────────────────────────────────────────────

export interface AdminRecord {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  is_2fa_enabled: boolean
  login_count: number
  last_login_at: string | null
}

export interface AdminDashboardData {
  overview: {
    total_studios: number
    active_studios: number
    suspended_studios: number
    trialing_studios: number
    paid_studios: number
    recent_studios: number
    storage: { used_gb: number; limit_gb: number; usage_pct: number }
    by_tier: Record<string, number>
    plans: any[]
  }
  health: {
    unhealthy_studios: Array<{ id: string; name: string; slug: string; issue: string }>
    storage_critical: Array<{ id: string; name: string; slug: string; usage_pct: number }>
    critical_errors_24h: number
  }
}

export interface StudioRecord {
  id: string
  name: string
  slug: string
  plan_tier: string
  subscription_status: string
  is_active: boolean
  is_suspended: boolean
  storage_used_gb: number
  storage_limit_gb: number
  created_at: string
}

export interface StudioDetailData {
  studio: StudioRecord
  members: Array<{ id: string; display_name: string; email: string; role: string; is_active: boolean }>
  stats: {
    booking_count: number
    gallery_count: number
    total_revenue: number
    recent_payments: Array<{ amount: number; status: string; created_at: string }>
  }
  support_notes: Array<{ id: string; note: string; is_flagged: boolean; created_at: string }>
}

export interface PlanRecord {
  id: string
  tier: string
  name: string
  monthly_price_inr: number
  annual_price_inr: number
  max_team_members: number
  max_bookings_per_month: number | null
  storage_limit_gb: number
  features: string[]
  is_active: boolean
  created_at: string
}

export interface AuditLogEntry {
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
  platform_admins?: { name: string; email: string }
}

export interface FeatureFlag {
  id: string
  flag_name: string
  description: string | null
  is_enabled: boolean
  enabled_for_tiers: string[]
  override_studio_id: string | null
  created_at: string
  updated_at: string
}

// ── Plans ─────────────────────────────────────────────────────────────

export async function fetchAdminPlans() {
  return fetchApi<PlanRecord[]>('/plans')
}

export async function createPlan(data: Partial<PlanRecord>) {
  return fetchApi<PlanRecord>('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePlan(id: string, data: Partial<PlanRecord>) {
  return fetchApi<PlanRecord>(`/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deletePlan(id: string) {
  return fetchApi<{ deleted: boolean }>(`/plans/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchSubscriptionOverview() {
  return fetchApi<any>('/subscriptions')
}

// ── 2FA ─────────────────────────────────────────────────────────────

export async function setup2FA() {
  return fetchApi<{ secret: string; otp_uri: string }>('/2fa', {
    method: 'POST',
  })
}

export async function enable2FA(secret: string, token: string) {
  return fetchApi<{ enabled: boolean }>('/2fa', {
    method: 'PATCH',
    body: JSON.stringify({ secret, token }),
  })
}

export async function disable2FA() {
  return fetchApi<{ disabled: boolean }>('/2fa', {
    method: 'DELETE',
  })
}

// ── Audit Logs ────────────────────────────────────────────────────────

export async function fetchAuditLogs(params: {
  admin_id?: string
  entity_type?: string
  action?: string
  page?: number
  pageSize?: number
}) {
  const qs = new URLSearchParams()
  if (params.admin_id) qs.set('admin_id', params.admin_id)
  if (params.entity_type) qs.set('entity_type', params.entity_type)
  if (params.action) qs.set('action', params.action)
  if (params.page !== undefined) qs.set('page', String(params.page))
  if (params.pageSize !== undefined) qs.set('pageSize', String(params.pageSize))

  const res = await fetch(`${API_BASE}/api/v1/admin/audit-logs?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch audit logs' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json() as PaginatedApiResponse<AuditLogEntry>
  return { logs: json.data, meta: json.meta }
}

// ── Feature Flags ─────────────────────────────────────────────────────

export async function fetchFeatureFlags() {
  return fetchApi<FeatureFlag[]>('/feature-flags')
}

export async function createFeatureFlag(data: { flag_name: string; description?: string; is_enabled?: boolean }) {
  return fetchApi<FeatureFlag>('/feature-flags', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateFeatureFlag(id: string, data: Partial<FeatureFlag>) {
  return fetchApi<FeatureFlag>(`/feature-flags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteFeatureFlag(id: string) {
  return fetchApi<{ deleted: boolean; flag_name: string }>(`/feature-flags/${id}`, {
    method: 'DELETE',
  })
}
