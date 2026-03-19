/** GSTIN 15th character check digit (GST portal algorithm). */
const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function isValidGstinChecksum(gstin: string): boolean {
  const val = gstin.toUpperCase()
  if (val.length !== 15) return false
  let sum = 0
  let factor = 1
  for (let i = 0; i < 14; i++) {
    const codePoint = val.charCodeAt(i)
    let digit = codePoint < 58 ? codePoint - 48 : codePoint - 55
    digit *= factor
    digit = Math.floor(digit / 36) + (digit % 36)
    sum += digit
    factor = factor === 2 ? 1 : 2
  }
  const check = (36 - (sum % 36)) % 36
  return val[14] === GSTIN_CHARSET[check]
}
