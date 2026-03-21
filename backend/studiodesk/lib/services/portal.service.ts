import crypto from 'crypto'
import { ServiceError } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

const TOKEN_RE = /^[0-9a-f]{64}$/i

function assertPortalToken(token: string) {
  if (!TOKEN_RE.test(token)) {
    throw new ServiceError('Invalid portal token', 'VALIDATION_ERROR', 400)
  }
}

export async function getPortalSession(token: string) {
  assertPortalToken(token)
  const admin = createAdminClient()
  const { data, error } = await (admin.from('client_portal_sessions') as any)
    .select('id, studio_id, client_id, booking_id, magic_token, token_expires_at, used_at')
    .eq('magic_token', token)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new ServiceError('Portal session not found', 'FORBIDDEN', 403)
  if (new Date(data.token_expires_at).getTime() < Date.now()) {
    throw new ServiceError('Portal session expired', 'CONFLICT', 409)
  }
  return data
}

export async function upsertPortalSession(studioId: string, clientId: string, bookingId: string) {
  const admin = createAdminClient()
  const { data: existing, error: lookupError } = await (admin.from('client_portal_sessions') as any)
    .select('id, magic_token')
    .eq('studio_id', studioId)
    .eq('client_id', clientId)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (lookupError) throw lookupError

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  if (existing) {
    const { error } = await (admin.from('client_portal_sessions') as any)
      .update({ token_expires_at: expiresAt })
      .eq('id', existing.id)
    if (error) throw error
    return { token: existing.magic_token, reused: true, expires_at: expiresAt }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const { error } = await (admin.from('client_portal_sessions') as any).insert({
    studio_id: studioId,
    client_id: clientId,
    booking_id: bookingId,
    magic_token: token,
    token_expires_at: expiresAt,
    is_used: false,
  })
  if (error) throw error
  return { token, reused: false, expires_at: expiresAt }
}

