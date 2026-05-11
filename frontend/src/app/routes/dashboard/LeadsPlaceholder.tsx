import { ArrowRight, Filter, Plus, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/motion/GlassCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatDate, formatINR } from '@/lib/formatters';

/**
 * Sprint 0 placeholder for /leads.
 *
 * Real module ships in Sprint 1. This page exists to:
 *   1. Verify the AppShell + page header + responsive container patterns work end-to-end
 *   2. Give the user a preview of the Sprint 1 layout shape
 *
 * Preview rows are visibly faded (55% opacity) so no-one mistakes them for live data.
 */
const PREVIEW_ROWS = [
  {
    name: 'Aanya Mehta',
    event: 'Wedding',
    date: '2026-12-14',
    value: 240000,
    source: 'Instagram',
    status: 'New',
  },
  {
    name: 'Rohan Patel',
    event: 'Pre-wedding',
    date: '2026-12-22',
    value: 85000,
    source: 'Referral',
    status: 'Contacted',
  },
  {
    name: 'Sharma family',
    event: 'Newborn',
    date: '2027-01-08',
    value: 35000,
    source: 'Website',
    status: 'Proposal sent',
  },
];

export function LeadsPlaceholder() {
  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description="Preview · Sprint 1 wires this page to /api/v1/leads"
        actions={
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-fg/90 px-4 py-2 text-sm font-medium text-bg opacity-55 shadow-elevated md:min-h-9 md:py-2"
            title="Ships in Sprint 1"
          >
            <Plus className="size-4" />
            New lead
          </button>
        }
      />

      {/* Toolbar — wraps cleanly on mobile */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-h-11 flex-1 items-center gap-2 rounded-pill border border-border/70 bg-card/60 px-4 text-sm text-muted-fg/70 sm:max-w-xs md:min-h-10">
          <Search className="size-4" />
          <span>Search leads…</span>
        </div>
        <div className="flex gap-2">
          <div className="flex min-h-11 items-center gap-2 rounded-pill border border-border/70 bg-card/60 px-4 text-sm text-muted-fg/70 md:min-h-10">
            <Filter className="size-4" />
            <span>All statuses</span>
          </div>
          <div className="hidden min-h-11 items-center gap-2 rounded-pill border border-border/70 bg-card/60 px-4 text-sm text-muted-fg/70 sm:flex md:min-h-10">
            <span>All sources</span>
          </div>
        </div>
      </div>

      {/* Mobile: card list. Desktop: data table. Same data, different layout. */}

      {/* Mobile card list */}
      <div className="mt-3 grid gap-2 md:hidden">
        {PREVIEW_ROWS.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.55, y: 0 }}
            transition={{ duration: 0.28, delay: 0.08 * i, ease: 'easeOut' }}
          >
            <GlassCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-pill bg-accent/10 font-display text-sm font-semibold text-accent">
                    {row.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-fg">
                      {row.event} · {formatDate(row.date)}
                    </p>
                  </div>
                </div>
                <span className="rounded-pill border border-border/70 bg-bg px-2 py-0.5 text-[11px] text-muted-fg">
                  {row.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-sm">
                <span className="text-muted-fg">{row.source}</span>
                <span className="font-medium tabular-nums">{formatINR(row.value)}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Desktop table */}
      <GlassCard className="mt-3 hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/70">
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Value</th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row, i) => (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.55, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.08 * i, ease: 'easeOut' }}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-pill bg-accent/10 font-display text-xs font-semibold text-accent">
                        {row.name.charAt(0)}
                      </div>
                      <span className="font-medium text-fg/90">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-fg">{row.event}</td>
                  <td className="px-5 py-4 tabular-nums text-muted-fg">{formatDate(row.date)}</td>
                  <td className="px-5 py-4 text-muted-fg">{row.source}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-pill border border-border/70 bg-bg px-2 py-0.5 text-[11px] text-muted-fg">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums">
                    {formatINR(row.value)}
                  </td>
                  <td className="px-2 py-4 text-muted-fg/60">
                    <ArrowRight className="size-3.5" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="mt-6 text-xs text-muted-fg">
        Sprint 1 replaces this with live data, debounced search, real filters, slide-over detail,
        and bulk actions.
      </p>
    </PageContainer>
  );
}
