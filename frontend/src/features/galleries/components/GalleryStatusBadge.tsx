import type { GalleryStatus } from '../types';

const STATUS_CONFIG: Record<GalleryStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-border/60 text-muted-fg',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  expired: {
    label: 'Expired',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
  },
};

export function GalleryStatusBadge({ status }: { status: GalleryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
