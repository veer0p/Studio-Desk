import { describe, it, expect } from 'vitest'
import {
  rupeesToPaise,
  paiseToRupees,
} from '@/lib/razorpay/client'

describe('Razorpay Utilities', () => {
  describe('rupeesToPaise', () => {
    it('converts basic rupee amounts correctly', () => {
      expect(rupeesToPaise(1250)).toBe(125000)
      expect(rupeesToPaise(1)).toBe(100)
    })

    it('handles floating point amounts correctly', () => {
      expect(rupeesToPaise(1250.50)).toBe(125050)
      expect(rupeesToPaise(0.01)).toBe(1)
      expect(rupeesToPaise(0.05)).toBe(5)
    })
  })

  describe('paiseToRupees', () => {
    it('converts paise back to rupees', () => {
      expect(paiseToRupees(125000)).toBe(1250)
      expect(paiseToRupees(100)).toBe(1)
      expect(paiseToRupees(1)).toBe(0.01)
    })
  })
})
