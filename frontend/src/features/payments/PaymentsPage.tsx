import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { PaymentStatusBadge, PaymentMethodBadge } from './components/PaymentBadges';
import { PaymentSlideOver } from './PaymentSlideOver';
import { usePayments } from './hooks';
import type { PaymentSummary, PaymentStatus, PaymentListParams } from './types';
import { formatDate, formatINR } from '@/lib/formatters';

const STATUS_TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'captured', label: 'Captured' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-24 animate-pulse rounded bg-border/40" />
        </div>
        <div className="space-y-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-border/40" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-border/40" />
        </div>
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
        <div className="h-4 w-18 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[140, 100, 100, 80, 80, 100].map((w, i) => (
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

function PaymentCard({ payment, onClick }: { payment: PaymentSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-card/70 p-4 text-left transition-colors hover:bg-card active:bg-bg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">
            {payment.booking_title ?? payment.invoice_number ?? 'Payment'}
          </p>
          {payment.invoice_number && payment.booking_title && (
            <p className="mt-0.5 font-mono text-xs text-accent">{payment.invoice_number}</p>
          )}
          {payment.reference_number && (
            <p className="mt-0.5 text-xs text-muted-fg">Ref: {payment.reference_number}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <PaymentStatusBadge status={payment.status} />
          <PaymentMethodBadge method={payment.method} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
        <span className="text-xs text-muted-fg">
          {payment.payment_date ? formatDate(payment.payment_date) : formatDate(payment.created_at)}
        </span>
        <span className="text-sm font-semibold tabular-nums text-fg">
          {formatINR(Number(payment.amount))}
        </span>
      </div>
      {payment.failure_reason && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{payment.failure_reason}</p>
      )}
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function PaymentRow({ payment, onClick }: { payment: PaymentSummary; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <p className="font-medium text-fg">
          {payment.booking_title ?? <span className="text-muted-fg">—</span>}
        </p>
        {payment.invoice_number && (
          <p className="font-mono text-xs text-accent">{payment.invoice_number}</p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <PaymentMethodBadge method={payment.method} />
      </td>
      <td className="px-4 py-3.5">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-4 py-3.5 text-right text-sm font-semibold tabular-nums text-fg">
        {formatINR(Number(payment.amount))}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg lg:table-cell">
        {payment.payment_date ? formatDate(payment.payment_date) : formatDate(payment.created_at)}
      </td>
      <td className="hidden max-w-[140px] truncate px-4 py-3.5 font-mono text-xs text-muted-fg/60 xl:table-cell">
        {payment.reference_number ?? payment.razorpay_payment_id ?? <span className="text-border">–</span>}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get('status') as PaymentStatus | null;
  const activeTab: PaymentStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');
  const PAGE_SIZE = 20;

  const setTab = useCallback(
    (tab: PaymentStatus | 'all') => {
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

  const params: PaymentListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = usePayments(params);

  const openPayment = useCallback(
    (id: string) =>
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('id', id); return next; }),
    [setSearchParams],
  );

  const closePayment = useCallback(
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
  const pageSize = data?.pageSize ?? PAGE_SIZE;

  const descriptor = isLoading ? 'Loading…' : `${total} payment${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description={descriptor}
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
            title="Couldn't load payments"
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
            icon={<Wallet className="size-6" />}
            title="No payments yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab} payments — try a different filter.`
                : 'Payments appear here once you record them against an invoice. Open any invoice and click "Record payment".'
            }
          />
        ) : (
          <>
            <div className="grid gap-2 md:hidden">
              {rows.map((p) => (
                <PaymentCard key={p.id} payment={p} onClick={() => openPayment(p.id)} />
              ))}
            </div>
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Booking / Invoice</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Reference</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <PaymentRow key={p.id} payment={p} onClick={() => openPayment(p.id)} />
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

      <PaymentSlideOver id={selectedId} onClose={closePayment} />
    </PageContainer>
  );
}
