import { cn } from '@/lib/utils';
import type { BookingStatus } from '../types';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  new_lead:       { label: 'New lead',        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  contacted:      { label: 'Contacted',        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  proposal_sent:  { label: 'Proposal sent',    className: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  booked:         { label: 'Booked',           className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  partially_paid: { label: 'Partially paid',   className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  paid:           { label: 'Paid',             className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  shoot_completed:{ label: 'Shoot done',       className: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  delivered:      { label: 'Delivered',        className: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  closed:         { label: 'Closed',           className: 'bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400' },
  lost:           { label: 'Lost',             className: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

interface Props {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new_lead;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
