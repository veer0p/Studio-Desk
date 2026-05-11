/**
 * India-native formatters. Mirrors backend `lib/formatters.ts`.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_WITH_PAISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER_IN = new Intl.NumberFormat('en-IN');

/** Format rupees as ₹X,XX,XXX (Indian comma grouping). */
export function formatINR(rupees: number, opts?: { paise?: boolean }): string {
  if (!Number.isFinite(rupees)) return '—';
  return (opts?.paise ? INR_WITH_PAISE : INR).format(rupees);
}

/** Backend stores money in paise. Convert to rupees before display. */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Rupees → paise (for sending to the backend). */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Indian-comma plain number (e.g. 1,23,456). */
export function formatIndianNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return NUMBER_IN.format(n);
}

/** Indian phone — accept 10 digits (62-9 start) and format as +91 XXXXX XXXXX. */
export function formatIndianPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

const DATE_FMT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const DATETIME_FMT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** "12 Dec 2026" */
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FMT.format(date);
}

/** "12 Dec 2026, 6:30 PM" */
export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return DATETIME_FMT.format(date);
}

/** Relative time — "2 days ago", "in 3 hours" */
const RELATIVE = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });

export function formatRelative(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  if (Math.abs(diffSec) < 60) return RELATIVE.format(diffSec, 'second');
  if (Math.abs(diffSec) < 3600) return RELATIVE.format(Math.round(diffSec / 60), 'minute');
  if (Math.abs(diffSec) < 86400) return RELATIVE.format(Math.round(diffSec / 3600), 'hour');
  if (Math.abs(diffSec) < 2592000) return RELATIVE.format(Math.round(diffSec / 86400), 'day');
  if (Math.abs(diffSec) < 31536000) return RELATIVE.format(Math.round(diffSec / 2592000), 'month');
  return RELATIVE.format(Math.round(diffSec / 31536000), 'year');
}
