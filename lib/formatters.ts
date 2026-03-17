import { format, formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

/**
 * formatINR
 * 
 * Formats a number or string as Indian Rupee (INR) 
 * Example: 12500 -> ₹12,500.00
 */
export function formatINR(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * formatINRShort
 * 
 * Short currency formatting for Indian context
 * Example: 120000 -> ₹1.2L, 15000 -> ₹15K, 999 -> ₹999
 */
export function formatINRShort(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toString()}`;
}

/**
 * formatIndianDate
 * 
 * Example: '2025-03-15' -> 15 Mar 2025
 */
export function formatIndianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

/**
 * formatIndianDateTime
 * 
 * Example: 15 Mar 2025, 2:30 PM
 */
export function formatIndianDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, h:mm a');
}

/**
 * formatRelativeTime
 * 
 * Example: 2 hours ago, 3 days ago
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}
