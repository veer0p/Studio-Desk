import { cn } from '@/lib/utils';
import type { PaymentStatus, PaymentMethod } from '../types';

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  processing: { label: 'Processing', className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  captured:   { label: 'Captured',   className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  failed:     { label: 'Failed',     className: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  refunded:   { label: 'Refunded',   className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; className: string }> = {
  cash:        { label: 'Cash',        className: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  upi:         { label: 'UPI',         className: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  neft:        { label: 'NEFT',        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  rtgs:        { label: 'RTGS',        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  cheque:      { label: 'Cheque',      className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  card:        { label: 'Card',        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  net_banking: { label: 'Net banking', className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  wallet:      { label: 'Wallet',      className: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  other:       { label: 'Other',       className: 'bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400' },
};

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.pending;
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}

export function PaymentMethodBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  const cfg = PAYMENT_METHOD_CONFIG[method] ?? PAYMENT_METHOD_CONFIG.other;
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}
