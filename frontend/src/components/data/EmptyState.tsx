import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  /** Real-voice copy per anti-AI rule #10. Avoid "No data available." */
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card/40 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-card bg-accent/10 text-accent">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted-fg">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
