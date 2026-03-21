import { describe, it, expect } from 'vitest'
import {
  encrypt,
  decrypt,
  generateSecureToken,
  hashToken,
} from '@/lib/crypto'

describe('Crypto Utilities', () => {
  it('performs encryption and decryption roundtrip', () => {
    const plaintext = 'Secret message 123'
    const encrypted = encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.split(':')).toHaveLength(3)
    
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('produces different outputs for the same plaintext (random IV)', () => {
    const plaintext = 'Same text'
    const enc1 = encrypt(plaintext)
    const enc2 = encrypt(plaintext)
    expect(enc1).not.toBe(enc2)
  })

  it('throws on tampered ciphertext', () => {
    const encrypted = encrypt('test')
    const tampered = encrypted.substring(0, encrypted.length - 5) + 'abcde'
    expect(() => decrypt(tampered)).toThrow()
  })

  it('generates secure tokens of correct length', () => {
    const token1 = generateSecureToken() // default 32 bytes = 64 hex
    expect(token1).toHaveLength(64)
    
    const token2 = generateSecureToken(16) // 16 bytes = 32 hex
    expect(token2).toHaveLength(32)
  })

  it('generates consistent hashes', () => {
    const token = 'my-token'
    const hash1 = hashToken(token)
    const hash2 = hashToken(token)
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })
})
