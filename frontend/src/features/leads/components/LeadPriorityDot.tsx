import { cn } from '@/lib/utils';
import type { LeadPriority } from '@/lib/constants/enums';

const DOT_CLASS: Record<LeadPriority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

const LABEL: Record<LeadPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export function LeadPriorityDot({
  priority,
  className,
}: {
  priority: LeadPriority;
  className?: string;
}) {
  return (
    <span
      title={LABEL[priority]}
      aria-label={LABEL[priority]}
      className={cn('block size-2 rounded-full', DOT_CLASS[priority], className)}
    />
  );
}
