import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { ProposalStatusBadge } from './components/ProposalStatusBadge';
import { ProposalSlideOver } from './ProposalSlideOver';
import { NewProposalDialog } from './NewProposalDialog';
import { useProposals } from './hooks';
import type { ProposalSummary, ProposalStatus, ProposalListParams } from './types';
import { formatDate, formatINR } from '@/lib/formatters';

const STATUS_TABS: { value: ProposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-28 animate-pulse rounded bg-border/40" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-border/40" />
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-24 animate-pulse rounded bg-border/40" />
        <div className="h-3 w-16 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[160, 140, 100, 100, 90].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 animate-pulse rounded bg-border/50" style={{ width: w }} />
        </td>
      ))}
      <td className="px-3 py-3.5">
        <div className="size-4 animate-pulse rounded bg-border/40" />
      </td>
    </tr>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  onClick,
}: {
  proposal: ProposalSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-card/70 p-4 text-left transition-colors hover:bg-card active:bg-bg"
      style={{ minHeight: 80 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{proposal.client_name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-fg">
            {proposal.booking_title}
            {proposal.event_date && ` · ${formatDate(proposal.event_date)}`}
          </p>
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 text-xs text-muted-fg">
        <span className="font-medium tabular-nums text-fg/80">
          {formatINR(parseFloat(proposal.total_amount))}
        </span>
        {proposal.valid_until && (
          <span>Valid until {formatDate(proposal.valid_until)}</span>
        )}
      </div>
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function ProposalRow({
  proposal,
  onClick,
}: {
  proposal: ProposalSummary;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <p className="font-medium text-fg">{proposal.client_name}</p>
        {proposal.client_phone && (
          <p className="text-xs text-muted-fg">{proposal.client_phone}</p>
        )}
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <p className="truncate text-sm text-fg/90">{proposal.booking_title}</p>
        <p className="text-xs text-muted-fg capitalize">
          {proposal.event_type.replace(/_/g, ' ')}
          {proposal.event_date && ` · ${formatDate(proposal.event_date)}`}
        </p>
      </td>
      <td className="px-4 py-3.5 text-sm tabular-nums text-fg/90">
        {formatINR(parseFloat(proposal.total_amount))}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg xl:table-cell">
        {proposal.valid_until
          ? formatDate(proposal.valid_until)
          : <span className="text-border">–</span>}
      </td>
      <td className="px-4 py-3.5">
        <ProposalStatusBadge status={proposal.status} />
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ProposalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const statusParam = searchParams.get('status') as ProposalStatus | null;
  const activeTab: ProposalStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');

  // ?new=1 trigger (from ⌘K)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewOpen(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('new');
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  // n shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'n') {
        e.preventDefault();
        setNewOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setTab = useCallback(
    (tab: ProposalStatus | 'all') => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === 'all') next.delete('status');
          else next.set('status', tab);
          next.set('page', '0');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const params: ProposalListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError, refetch } = useProposals(params);

  const openProposal = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('id', id);
        return next;
      });
    },
    [setSearchParams],
  );

  const closeProposal = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('id');
      return next;
    });
  }, [setSearchParams]);

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

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const descriptor = isLoading
    ? 'Loading…'
    : `${total} proposal${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Proposals"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New proposal
          </button>
        }
      />

      {/* Status tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-border/70 bg-card/70 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTab(tab.value)}
            className={
              activeTab === tab.value
                ? 'min-h-8 rounded-full bg-fg/90 px-4 text-xs font-medium text-bg transition-colors'
                : 'min-h-8 rounded-full px-4 text-xs text-muted-fg transition-colors hover:text-fg'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {isError ? (
          <ErrorState
            title="Couldn't load proposals"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <>
            <div className="grid gap-2 md:hidden">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
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
            icon={<FileText className="size-6" />}
            title="No proposals yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab} proposals — try a different filter.`
                : 'Proposals are created for bookings. Send quotes directly to clients with one click.'
            }
            action={
              activeTab === 'all' ? (
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Create first proposal
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile */}
            <div className="grid gap-2 md:hidden">
              {rows.map((p) => (
                <ProposalCard key={p.id} proposal={p} onClick={() => openProposal(p.id)} />
              ))}
            </div>

            {/* Desktop */}
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Client</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Booking</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Valid until</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <ProposalRow key={p.id} proposal={p} onClick={() => openProposal(p.id)} />
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

      <ProposalSlideOver id={selectedId} onClose={closeProposal} />
      <NewProposalDialog open={newOpen} onOpenChange={setNewOpen} />
    </PageContainer>
  );
}
