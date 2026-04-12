const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export interface ReferralCode {
  id: string
  code: string
  reward_type: string
  reward_value: number
  max_uses: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface ReferralData {
  code: ReferralCode | null
  stats: {
    total_redemptions: number
    total_rewards: number
  }
  redemptions: Array<{
    id: string
    referred_studio_name: string
    created_at: string
    rewarded: boolean
  }>
}

export async function fetchReferralCode(): Promise<ReferralData> {
  const res = await fetch(`${API_BASE}/api/v1/referral`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch referral code' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as ReferralData
}

export async function generateReferralCode(): Promise<{ code: string }> {
  const res = await fetch(`${API_BASE}/api/v1/referral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to generate code' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as { code: string }
}

export async function redeemReferralCode(code: string, newStudioId: string): Promise<{ success: boolean; reward: string }> {
  const res = await fetch(`${API_BASE}/api/v1/referral/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code, new_studio_id: newStudioId }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Redemption failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as { success: boolean; reward: string }
}
