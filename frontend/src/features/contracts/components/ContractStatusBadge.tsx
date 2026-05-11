import { cn } from '@/lib/utils';
import type { ContractStatus } from '../types';

const STYLES: Record<ContractStatus, string> = {
  draft: 'bg-border/60 text-muted-fg',
  sent: 'bg-accent/10 text-accent',
  signed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

const LABEL: Record<ContractStatus, string> = {
  draft: 'Draft',
  sent: 'Awaiting signature',
  signed: 'Signed',
  cancelled: 'Cancelled',
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
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
