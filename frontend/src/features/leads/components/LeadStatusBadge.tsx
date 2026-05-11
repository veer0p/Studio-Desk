import { cn } from '@/lib/utils';
import { LEAD_STATUS_LABEL, type LeadStatus } from '@/lib/constants/enums';

const STATUS_CLASS: Record<LeadStatus, string> = {
  new_lead: 'bg-accent/10 text-accent border-accent/20',
  contacted: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  proposal_sent: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
  contract_signed: 'bg-cyan-600/10 text-cyan-700 border-cyan-600/20 dark:text-cyan-400',
  advance_paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  shoot_scheduled: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  delivered: 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400',
  closed: 'bg-muted/60 text-muted-fg border-border/50',
  lost: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight',
        STATUS_CLASS[status],
        className,
      )}
    >
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}
