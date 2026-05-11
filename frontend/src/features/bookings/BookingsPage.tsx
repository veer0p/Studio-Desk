import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Calendar, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { BookingStatusBadge } from './components/BookingStatusBadge';
import { BookingSlideOver } from './BookingSlideOver';
import { NewBookingDialog } from './NewBookingDialog';
import { useBookings } from './hooks';
import type { BookingSummary, BookingStatus, BookingListParams } from './types';
import { formatDate, formatINR } from '@/lib/formatters';

const STATUS_TABS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new_lead', label: 'New' },
  { value: 'booked', label: 'Booked' },
  { value: 'partially_paid', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'shoot_completed', label: 'Shoot done' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-28 animate-pulse rounded bg-border/40" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded-full bg-border/40" />
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-24 animate-pulse rounded bg-border/40" />
        <div className="h-4 w-20 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[160, 120, 100, 90, 90, 80].map((w, i) => (
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

function BookingCard({
  booking,
  onClick,
}: {
  booking: BookingSummary;
  onClick: () => void;
}) {
  const pendingPct = booking.total_amount > 0
    ? Math.round((booking.amount_pending / booking.total_amount) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-card border border-border bg-card/70 p-4 text-left transition-colors hover:bg-card active:bg-bg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{booking.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-fg">
            {booking.client_name}
            {booking.event_date && ` · ${formatDate(booking.event_date)}`}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
        <span className="text-xs font-semibold tabular-nums text-fg">
          {formatINR(booking.total_amount)}
        </span>
        {pendingPct > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {formatINR(booking.amount_pending)} pending
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function BookingRow({
  booking,
  onClick,
}: {
  booking: BookingSummary;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <p className="font-medium text-fg">{booking.title}</p>
        {booking.client_name && (
          <p className="text-xs text-muted-fg">{booking.client_name}</p>
        )}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg lg:table-cell">
        {booking.event_date ? formatDate(booking.event_date) : <span className="text-border">–</span>}
      </td>
      <td className="px-4 py-3.5 capitalize text-sm text-muted-fg/80">
        {booking.event_type.replace('_', ' ')}
      </td>
      <td className="px-4 py-3.5">
        <BookingStatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3.5 text-right text-sm font-semibold tabular-nums text-fg">
        {formatINR(booking.total_amount)}
      </td>
      <td className="hidden px-4 py-3.5 text-right text-sm tabular-nums xl:table-cell">
        {booking.amount_pending > 0 ? (
          <span className="text-amber-600 dark:text-amber-400">
            {formatINR(booking.amount_pending)}
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
        )}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const statusParam = searchParams.get('status') as BookingStatus | null;
  const activeTab: BookingStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');
  const PAGE_SIZE = 20;

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
    (tab: BookingStatus | 'all') => {
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

  const params: BookingListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useBookings(params);

  const openBooking = useCallback(
    (id: string) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('id', id);
        return next;
      }),
    [setSearchParams],
  );

  const closeBooking = useCallback(
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

  // GET /bookings returns { data, count } — compute pagination client-side
  const rows = data?.data ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const descriptor = isLoading ? 'Loading…' : `${total} booking${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Bookings"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New booking
          </button>
        }
      />

      {/* Status tabs — horizontal scroll on mobile */}
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
            title="Couldn't load bookings"
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
            icon={<Calendar className="size-6" />}
            title="No bookings yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab.replace('_', ' ')} bookings — try a different filter.`
                : 'Your first wedding shoot is one booking away. Create it from a lead or directly here.'
            }
            action={
              activeTab === 'all' ? (
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Create first booking
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-2 md:hidden">
              {rows.map((b) => (
                <BookingCard key={b.id} booking={b} onClick={() => openBooking(b.id)} />
              ))}
            </div>
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Booking</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="hidden px-4 py-3 text-right xl:table-cell">Pending</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((b) => (
                      <BookingRow key={b.id} booking={b} onClick={() => openBooking(b.id)} />
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
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
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

      <BookingSlideOver id={selectedId} onClose={closeBooking} />
      <NewBookingDialog open={newOpen} onOpenChange={setNewOpen} />
    </PageContainer>
  );
}
