import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  /**
   * One-line factual descriptor. ≤ 70 chars. NEVER aspirational marketing prose
   * — that belongs on the marketing site, not in the operator dashboard.
   * Good: "28 active · 4 new today", "Inquiries land here automatically"
   * Bad:  "Where every wedding begins."
   */
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — the standard header for every internal dashboard page.
 * Stacks on mobile (`<md`), goes row on `md+`. Always followed by a content
 * body inside the same `PageContainer`.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between md:pb-6',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 truncate text-sm text-muted-fg">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
