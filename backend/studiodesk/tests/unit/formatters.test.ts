import { describe, it, expect } from 'vitest'
import {
  formatINR,
  formatINRShort,
  formatIndianDate,
} from '@/lib/formatters'

describe('Formatters', () => {
  describe('formatINR', () => {
    it('formats numbers to INR correctly', () => {
      expect(formatINR(12500).replace(/\u00A0/g, '')).toBe('₹12,500.00')
      expect(formatINR(0).replace(/\u00A0/g, '')).toBe('₹0.00')
      expect(formatINR(1500000).replace(/\u00A0/g, '')).toBe('₹15,00,000.00')
    })
  })

  describe('formatINRShort', () => {
    it('formats large amounts to short form', () => {
      expect(formatINRShort(1500000)).toBe('₹15L')
      expect(formatINRShort(50000)).toBe('₹50K')
      expect(formatINRShort(125000)).toBe('₹1.3L')
      expect(formatINRShort(500)).toBe('₹500')
    })
  })

  describe('formatIndianDate', () => {
    it('formats date correctly', () => {
      const date = new Date(2025, 2, 15) // 15 Mar 2025
      expect(formatIndianDate(date)).toBe('15 Mar 2025')
    })
  })
})
