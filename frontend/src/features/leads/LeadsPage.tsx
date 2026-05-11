import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Phone, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { LeadStatusBadge } from './components/LeadStatusBadge';
import { LeadPriorityDot } from './components/LeadPriorityDot';
import { LeadSlideOver } from './LeadSlideOver';
import { NewLeadDialog } from './NewLeadDialog';
import { useLeads } from './hooks';
import type { LeadSummary, LeadListParams } from './types';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  type LeadStatus,
  type LeadSource,
} from '@/lib/constants/enums';
import { formatINR, formatDate } from '@/lib/formatters';
import { useDebounce } from '@/lib/hooks/useDebounce';

function avatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function budgetRange(min: string | null, max: string | null) {
  if (!min && !max) return null;
  const lo = min ? formatINR(parseFloat(min)) : null;
  const hi = max ? formatINR(parseFloat(max)) : null;
  if (lo && hi) return `${lo}–${hi}`;
  if (lo) return `${lo}+`;
  return hi;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start gap-3">
        <div className="size-9 animate-pulse rounded-full bg-border/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-24 animate-pulse rounded bg-border/40" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-border/40" />
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-16 animate-pulse rounded bg-border/40" />
        <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[180, 100, 90, 80, 80, 120, 100].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 animate-pulse rounded bg-border/50"
            style={{ width: w }}
          />
        </td>
      ))}
      <td className="px-3 py-3.5">
        <div className="size-4 animate-pulse rounded bg-border/40" />
      </td>
    </tr>
  );
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function LeadCard({ lead, onClick }: { lead: LeadSummary; onClick: () => void }) {
  const budget = budgetRange(lead.budget_min, lead.budget_max);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-card/70 p-4 text-left transition-colors hover:bg-card active:bg-bg"
      style={{ minHeight: 80 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-sm font-semibold text-accent">
            {avatarInitial(lead.client.full_name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{lead.client.full_name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-fg">
              {lead.event_type
                ? `${LEAD_STATUS_LABEL[lead.status as LeadStatus] ? '' : ''}${lead.event_type.replace(/_/g, ' ')}`
                : 'No event type'}
              {lead.event_date_approx && (
                <>
                  <span>·</span>
                  <span>{formatDate(lead.event_date_approx)}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <LeadStatusBadge status={lead.status as LeadStatus} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-fg">
          <LeadPriorityDot priority={lead.priority as import('@/lib/constants/enums').LeadPriority} />
          {LEAD_SOURCE_LABEL[lead.source as LeadSource]}
        </span>
        {budget ? (
          <span className="text-xs font-medium tabular-nums text-fg/80">{budget}</span>
        ) : (
          <span className="text-xs text-muted-fg/50">No budget</span>
        )}
      </div>
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function LeadRow({ lead, onClick }: { lead: LeadSummary; onClick: () => void }) {
  const budget = budgetRange(lead.budget_min, lead.budget_max);
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-xs font-semibold text-accent">
            {avatarInitial(lead.client.full_name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{lead.client.full_name}</p>
            {lead.client.phone && (
              <a
                href={`tel:${lead.client.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-muted-fg hover:text-accent"
              >
                <Phone className="size-3" />
                {lead.client.phone}
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg lg:table-cell">
        {lead.event_type ? lead.event_type.replace(/_/g, ' ') : '–'}
      </td>
      <td className="hidden px-4 py-3.5 text-sm tabular-nums text-muted-fg lg:table-cell">
        {lead.event_date_approx ? formatDate(lead.event_date_approx) : '–'}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg xl:table-cell">
        {LEAD_SOURCE_LABEL[lead.source as LeadSource] ?? lead.source}
      </td>
      <td className="hidden px-4 py-3.5 xl:table-cell">
        <div className="flex items-center gap-2">
          <LeadPriorityDot priority={lead.priority as import('@/lib/constants/enums').LeadPriority} />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <LeadStatusBadge status={lead.status as LeadStatus} />
      </td>
      <td className="px-4 py-3.5 text-right text-sm tabular-nums text-muted-fg">
        {budget ?? <span className="text-border">–</span>}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Filter select ────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 rounded-full border border-border/70 bg-card/70 px-4 text-sm text-fg/80 focus:outline-none focus:ring-2 focus:ring-accent/40 md:min-h-10"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const debouncedSearch = useDebounce(localSearch, 300);

  const status = (searchParams.get('status') as LeadStatus) || undefined;
  const source = (searchParams.get('source') as LeadSource) || undefined;
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');

  // ?new=1 → open dialog (set by ⌘K "New lead" command)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewLeadOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sync debounced search → URL (replace so back button doesn't fight with typing)
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) {
          next.set('q', debouncedSearch);
          next.set('page', '0');
        } else {
          next.delete('q');
        }
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, setSearchParams]);

  const params: LeadListParams = {
    q: searchParams.get('q') ?? undefined,
    status,
    source,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError, refetch } = useLeads(params);

  // Keyboard shortcuts (n = new lead)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'n') {
        e.preventDefault();
        setNewLeadOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openLead = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('id', id);
        return next;
      });
    },
    [setSearchParams],
  );

  const closeLead = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('id');
      return next;
    });
  }, [setSearchParams]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        next.set('page', '0');
        return next;
      });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (p: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      });
    },
    [setSearchParams],
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 20;

  const activeCount = total;
  const descriptor =
    isLoading
      ? 'Loading…'
      : `${activeCount} lead${activeCount !== 1 ? 's' : ''} · page ${page + 1} of ${totalPages}`;

  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewLeadOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New lead
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 text-sm sm:max-w-xs md:min-h-10">
          <Search className="size-4 shrink-0 text-muted-fg/60" />
          <input
            type="search"
            placeholder="Search leads…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent text-fg placeholder:text-muted-fg/60 focus:outline-none"
          />
        </label>

        <div className="flex gap-2">
          <FilterSelect
            value={status ?? ''}
            onChange={(v) => setFilter('status', v)}
            placeholder="All statuses"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={source ?? ''}
            onChange={(v) => setFilter('source', v)}
            placeholder="All sources"
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABEL[s]}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isError ? (
          <ErrorState
            title="Couldn't load leads"
            description="Check your connection and try again. If the backend is not running, start it first."
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <>
            {/* Mobile skeletons */}
            <div className="grid gap-2 md:hidden">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            {/* Desktop skeleton */}
            <GlassCard className="hidden overflow-hidden md:block">
              <table className="w-full">
                <tbody>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </tbody>
              </table>
            </GlassCard>
          </>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Plus className="size-6" />}
            title="No leads yet"
            description={
              status || source || (searchParams.get('q') ?? '')
                ? 'No leads match your filters — try clearing them.'
                : 'Your first potential client is one conversation away. Add a lead to get started.'
            }
            action={
              !status && !source && !searchParams.get('q') ? (
                <button
                  type="button"
                  onClick={() => setNewLeadOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Add first lead
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="grid gap-2 md:hidden">
              {rows.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={() => openLead(lead.id)} />
              ))}
            </div>

            {/* Desktop: table */}
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Lead</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Event</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Source</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Pri.</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Budget</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((lead) => (
                      <LeadRow key={lead.id} lead={lead} onClick={() => openLead(lead.id)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-fg">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="min-h-9 rounded-input border border-border/70 bg-card/70 px-4 text-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="min-h-9 rounded-input border border-border/70 bg-card/70 px-4 text-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Slide-over / bottom sheet */}
      <LeadSlideOver id={selectedId} onClose={closeLead} />

      {/* New lead dialog */}
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
    </PageContainer>
  );
}
