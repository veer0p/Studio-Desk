import { cn } from '@/lib/utils';
import type { InvoiceStatus, InvoiceType } from '../types';

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:          { label: 'Draft',          className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  sent:           { label: 'Sent',           className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  partially_paid: { label: 'Partial',        className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  paid:           { label: 'Paid',           className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  overdue:        { label: 'Overdue',        className: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  cancelled:      { label: 'Cancelled',      className: 'bg-slate-50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500' },
};

export const INVOICE_TYPE_CONFIG: Record<InvoiceType, { label: string; className: string }> = {
  advance:     { label: 'Advance',     className: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  balance:     { label: 'Balance',     className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  full:        { label: 'Full',        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  credit_note: { label: 'Credit note', className: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
};

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const cfg = INVOICE_STATUS_CONFIG[status] ?? INVOICE_STATUS_CONFIG.draft;
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}

export function InvoiceTypeBadge({ type, className }: { type: InvoiceType; className?: string }) {
  const cfg = INVOICE_TYPE_CONFIG[type] ?? INVOICE_TYPE_CONFIG.full;
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  );
}
