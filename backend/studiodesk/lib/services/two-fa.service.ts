import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import * as crypto from 'crypto'

type Db = SupabaseClient<Database>

/**
 * Simple TOTP implementation using HMAC-SHA1 (RFC 6238).
 * No external dependencies needed.
 */
function generateSecret(length = 20): string {
  return crypto.randomBytes(length).toString('base32').replace(/=/g, '')
}

function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  const key = base32ToBuffer(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const timeCounter = Math.floor(epoch / timeStep)
  const timeBuffer = Buffer.alloc(8)
  timeBuffer.writeBigInt64BE(BigInt(timeCounter))

  const hmac = crypto.createHmac('sha1', key)
  hmac.update(timeBuffer)
  const hmacResult = hmac.digest()

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0f
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)

  const otp = binary % Math.pow(10, digits)
  return otp.toString().padStart(digits, '0')
}

function verifyTOTP(secret: string, token: string, window = 1): boolean {
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = 30

  for (let i = -window; i <= window; i++) {
    const timeCounter = Math.floor(epoch / timeStep) + i
    const timeBuffer = Buffer.alloc(8)
    timeBuffer.writeBigInt64BE(BigInt(timeCounter))

    const key = base32ToBuffer(secret)
    const hmac = crypto.createHmac('sha1', key)
    hmac.update(timeBuffer)
    const hmacResult = hmac.digest()

    const offset = hmacResult[hmacResult.length - 1] & 0x0f
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff)

    const otp = binary % Math.pow(10, 6)
    const expected = otp.toString().padStart(6, '0')
    if (expected === token) return true
  }
  return false
}

function base32ToBuffer(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of base32.toUpperCase()) {
    const val = alphabet.indexOf(char)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function generateOTPURI(secret: string, accountName: string, issuer: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Two-Factor Authentication (TOTP) service for platform admins.
 */
export const TwoFAService = {
  generateSecret(adminId: string, email: string): { secret: string; otpUri: string } {
    const secret = generateSecret(20)
    const otpUri = generateOTPURI(secret, email, 'StudioDesk Admin')
    return { secret, otpUri }
  },

  verify(secret: string, token: string): boolean {
    return verifyTOTP(secret, token)
  },

  async enable(supabase: Db, adminId: string, secret: string): Promise<void> {
    const { error } = await supabase
      .from('platform_admins')
      .update({ totp_secret: secret, is_2fa_enabled: true })
      .eq('id', adminId)
    if (error) throw Errors.validation('Failed to enable 2FA')
  },

  async disable(supabase: Db, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('platform_admins')
      .update({ totp_secret: null, is_2fa_enabled: false })
      .eq('id', adminId)
    if (error) throw Errors.validation('Failed to disable 2FA')
  },

  verifyForLogin(totpSecret: string | null, token: string): boolean {
    if (!totpSecret) return false
    return TwoFAService.verify(totpSecret, token)
  },

  isRequired(role: string, isEnabled: boolean): boolean {
    if (role === 'super_admin') return true
    return isEnabled
  },
}
