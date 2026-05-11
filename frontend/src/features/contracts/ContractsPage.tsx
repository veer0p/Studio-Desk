import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileSignature, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { ContractStatusBadge } from './components/ContractStatusBadge';
import { ContractSlideOver } from './ContractSlideOver';
import { NewContractDialog } from './NewContractDialog';
import { useContracts } from './hooks';
import type { ContractSummary, ContractStatus, ContractListParams } from './types';
import { formatDate } from '@/lib/formatters';

const STATUS_TABS: { value: ContractStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Awaiting' },
  { value: 'signed', label: 'Signed' },
  { value: 'cancelled', label: 'Cancelled' },
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
        <div className="h-5 w-20 animate-pulse rounded-full bg-border/40" />
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-24 animate-pulse rounded bg-border/40" />
        <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[160, 140, 100, 100, 100].map((w, i) => (
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

function ContractCard({
  contract,
  onClick,
}: {
  contract: ContractSummary;
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
          <p className="truncate font-medium text-fg">{contract.client_name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-fg">
            {contract.booking_title}
            {contract.event_date && ` · ${formatDate(contract.event_date)}`}
          </p>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 text-xs text-muted-fg">
        <span>{formatDate(contract.created_at)}</span>
        {contract.signed_at && (
          <span className="text-emerald-600 dark:text-emerald-400">
            Signed {formatDate(contract.signed_at)}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function ContractRow({
  contract,
  onClick,
}: {
  contract: ContractSummary;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <p className="font-medium text-fg">{contract.client_name}</p>
        {contract.client_phone && (
          <p className="text-xs text-muted-fg">{contract.client_phone}</p>
        )}
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <p className="truncate text-sm text-fg/90">{contract.booking_title}</p>
        {contract.event_date && (
          <p className="text-xs text-muted-fg">{formatDate(contract.event_date)}</p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <ContractStatusBadge status={contract.status} />
      </td>
      <td className="hidden px-4 py-3.5 text-sm tabular-nums text-muted-fg xl:table-cell">
        {contract.sent_at ? formatDate(contract.sent_at) : <span className="text-border">–</span>}
      </td>
      <td className="hidden px-4 py-3.5 text-sm xl:table-cell">
        {contract.signed_at ? (
          <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatDate(contract.signed_at)}
          </span>
        ) : (
          <span className="text-border">–</span>
        )}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ContractsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const statusParam = searchParams.get('status') as ContractStatus | null;
  const activeTab: ContractStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'n') { e.preventDefault(); setNewOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setTab = useCallback(
    (tab: ContractStatus | 'all') => {
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

  const params: ContractListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError, refetch } = useContracts(params);

  const openContract = useCallback(
    (id: string) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('id', id);
        return next;
      }),
    [setSearchParams],
  );

  const closeContract = useCallback(
    () =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('id');
        return next;
      }),
    [setSearchParams],
  );

  const setPage = useCallback(
    (p: number) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      }),
    [setSearchParams],
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 20;

  const descriptor = isLoading ? 'Loading…' : `${total} contract${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Contracts"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New contract
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
            title="Couldn't load contracts"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <>
            <div className="grid gap-2 md:hidden">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <GlassCard className="hidden overflow-hidden md:block">
              <table className="w-full">
                <tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody>
              </table>
            </GlassCard>
          </>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileSignature className="size-6" />}
            title="No contracts yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab} contracts — try a different filter.`
                : 'Contracts are created from bookings and sent to clients for e-signature.'
            }
            action={
              activeTab === 'all' ? (
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Create first contract
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-2 md:hidden">
              {rows.map((c) => (
                <ContractCard key={c.id} contract={c} onClick={() => openContract(c.id)} />
              ))}
            </div>
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Client</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Booking</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Sent</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Signed</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <ContractRow key={c.id} contract={c} onClick={() => openContract(c.id)} />
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
            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}
              className="min-h-9 rounded-input border border-border/70 bg-card/70 px-4 text-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
              className="min-h-9 rounded-input border border-border/70 bg-card/70 px-4 text-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      <ContractSlideOver id={selectedId} onClose={closeContract} />
      <NewContractDialog open={newOpen} onOpenChange={setNewOpen} />
    </PageContainer>
  );
}
