import crypto from 'crypto'
import { env } from '@/lib/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns 'iv:authTag:encrypted' hex string
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return ''

  const iv = crypto.randomBytes(IV_LENGTH)
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex')
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ''

  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':')
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid ciphertext format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * SHA256 hex digest for storing session tokens or API keys
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate a secure random token
 * Default 32 bytes = 64 hex chars
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}
