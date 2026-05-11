import { cn } from '@/lib/utils';
import type { ProposalStatus } from '../types';

const STYLES: Record<ProposalStatus, string> = {
  draft: 'bg-border/60 text-muted-fg',
  sent: 'bg-accent/10 text-accent',
  accepted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  expired: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
};

const LABEL: Record<ProposalStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        STYLES[status] ?? 'bg-border/60 text-muted-fg',
      )}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
