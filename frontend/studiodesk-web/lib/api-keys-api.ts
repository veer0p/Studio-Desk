const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  scopes: string[]
  last_used_at: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
  revoked_at: string | null
}

export interface ApiKeyCreationResult {
  key: string
  key_id: string
  key_prefix: string
  name: string
  expires_at: string | null
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const res = await fetch(`${API_BASE}/api/v1/api-keys`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch API keys' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data?.keys || []
}

export async function createApiKey(name: string, scopes: string[], expiresAt?: string | null): Promise<ApiKeyCreationResult> {
  const res = await fetch(`${API_BASE}/api/v1/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, scopes, expires_at: expiresAt || null }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create API key' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data
}

export async function revokeApiKey(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/api-keys/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to revoke key' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function updateApiKey(id: string, data: { name?: string; scopes?: string[]; expires_at?: string | null }) {
  const res = await fetch(`${API_BASE}/api/v1/api-keys/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update key' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function toggleApiKey(id: string, isActive: boolean) {
  const res = await fetch(`${API_BASE}/api/v1/api-keys/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ is_active: isActive }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to toggle key' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean
  studio_id?: string
  scopes?: string[]
}> {
  const res = await fetch(`${API_BASE}/api/v1/api-keys/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to validate key' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data
}
