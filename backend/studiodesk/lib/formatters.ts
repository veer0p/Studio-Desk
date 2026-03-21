import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format amount to Indian Rupees (INR) with 2 decimal places
 * Example: 12500 -> "₹12,500.00"
 */
export function formatINR(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

/**
 * Short Indian Rupees format
 * Example: 1500000 -> "₹15L", 50000 -> "₹50K", 500 -> "₹500"
 */
export function formatINRShort(amount: number): string {
  const absAmount = Math.abs(amount)
  if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`
  }
  if (absAmount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`
  }
  return `₹${amount}`
}

const IST_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
}

/**
 * Format date to Indian standard format
 * Example: "15 Mar 2025"
 */
export function formatIndianDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

/**
 * Format datetime to Indian standard format
 * Example: "15 Mar 2025, 2:30 PM"
 */
export function formatIndianDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, h:mm a')
}

/**
 * Format relative time
 * Example: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}
