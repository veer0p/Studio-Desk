import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Receipt, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { InvoiceStatusBadge, InvoiceTypeBadge } from './components/InvoiceStatusBadge';
import { InvoiceSlideOver } from './InvoiceSlideOver';
import { NewInvoiceDialog } from './NewInvoiceDialog';
import { useInvoices } from './hooks';
import type { InvoiceSummary, InvoiceStatus, InvoiceListParams } from './types';
import { formatDate, formatINR } from '@/lib/formatters';

const STATUS_TABS: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-36 animate-pulse rounded bg-border/40" />
        </div>
        <div className="space-y-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-border/40" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-border/40" />
        </div>
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
        <div className="h-4 w-20 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[60, 160, 100, 80, 80, 80, 80].map((w, i) => (
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

function InvoiceCard({ invoice, onClick }: { invoice: InvoiceSummary; onClick: () => void }) {
  const amountDue = Number(invoice.amount_due);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-card/70 p-4 text-left transition-colors hover:bg-card active:bg-bg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-accent">{invoice.invoice_number}</p>
          <p className="mt-0.5 truncate text-sm font-medium text-fg">{invoice.client_name}</p>
          <p className="truncate text-xs text-muted-fg">{invoice.booking_title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <InvoiceStatusBadge status={invoice.status} />
          <InvoiceTypeBadge type={invoice.invoice_type} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
        <span className="text-xs text-muted-fg">
          {invoice.due_date ? `Due ${formatDate(invoice.due_date)}` : formatDate(invoice.created_at)}
        </span>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-fg">
            {formatINR(Number(invoice.total_amount))}
          </p>
          {amountDue > 0 && invoice.status !== 'paid' && (
            <p className="text-xs tabular-nums text-amber-600 dark:text-amber-400">
              {formatINR(amountDue)} due
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function InvoiceRow({ invoice, onClick }: { invoice: InvoiceSummary; onClick: () => void }) {
  const amountDue = Number(invoice.amount_due);
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs font-semibold text-accent">{invoice.invoice_number}</span>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-medium text-fg">{invoice.client_name}</p>
        <p className="text-xs text-muted-fg">{invoice.booking_title}</p>
      </td>
      <td className="px-4 py-3.5">
        <InvoiceTypeBadge type={invoice.invoice_type} />
      </td>
      <td className="px-4 py-3.5">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3.5 text-right text-sm font-semibold tabular-nums text-fg">
        {formatINR(Number(invoice.total_amount))}
      </td>
      <td className="hidden px-4 py-3.5 text-right text-sm tabular-nums xl:table-cell">
        {amountDue > 0 && invoice.status !== 'paid' ? (
          <span className="text-amber-600 dark:text-amber-400">{formatINR(amountDue)}</span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400">Cleared</span>
        )}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg lg:table-cell">
        {invoice.due_date ? formatDate(invoice.due_date) : <span className="text-border">–</span>}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const statusParam = searchParams.get('status') as InvoiceStatus | null;
  const activeTab: InvoiceStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
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
    (tab: InvoiceStatus | 'all') => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'all') next.delete('status');
        else next.set('status', tab);
        next.set('page', '0');
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const params: InvoiceListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError, refetch } = useInvoices(params);

  const openInvoice = useCallback(
    (id: string) =>
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('id', id); return next; }),
    [setSearchParams],
  );

  const closeInvoice = useCallback(
    () =>
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete('id'); return next; }),
    [setSearchParams],
  );

  const setPage = useCallback(
    (p: number) =>
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(p)); return next; }),
    [setSearchParams],
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 20;

  const descriptor = isLoading ? 'Loading…' : `${total} invoice${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New invoice
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
                ? 'min-h-8 shrink-0 rounded-full bg-fg/90 px-4 text-xs font-medium text-bg transition-colors'
                : 'min-h-8 shrink-0 rounded-full px-4 text-xs text-muted-fg transition-colors hover:text-fg'
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
            title="Couldn't load invoices"
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
            icon={<Receipt className="size-6" />}
            title="No invoices yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab.replace('_', ' ')} invoices — try a different filter.`
                : 'Create your first GST-compliant invoice against a booking. Advance or balance — your call.'
            }
            action={
              activeTab === 'all' ? (
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Create first invoice
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-2 md:hidden">
              {rows.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} onClick={() => openInvoice(inv.id)} />
              ))}
            </div>
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="hidden px-4 py-3 text-right xl:table-cell">Due</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Due date</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((inv) => (
                      <InvoiceRow key={inv.id} invoice={inv} onClick={() => openInvoice(inv.id)} />
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

      <InvoiceSlideOver id={selectedId} onClose={closeInvoice} />
      <NewInvoiceDialog open={newOpen} onOpenChange={setNewOpen} />
    </PageContainer>
  );
}
