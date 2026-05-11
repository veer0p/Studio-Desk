import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GlassCard } from '@/components/motion/GlassCard';
import { ClientSlideOver } from './ClientSlideOver';
import { NewClientDialog } from './NewClientDialog';
import { useClients } from './hooks';
import type { ClientSummary, ClientListParams } from './types';
import { formatDate } from '@/lib/formatters';
import { useDebounce } from '@/lib/hooks/useDebounce';

// ─── Tag pill ─────────────────────────────────────────────────────────────────

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-bg/80 px-2 py-0.5 text-[11px] text-muted-fg">
      {tag}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-card border border-border bg-card/60 p-4">
      <div className="flex items-start gap-3">
        <div className="size-9 animate-pulse rounded-full bg-border/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-28 animate-pulse rounded bg-border/40" />
        </div>
      </div>
      <div className="mt-3 flex justify-between border-t border-border/30 pt-3">
        <div className="h-3 w-20 animate-pulse rounded bg-border/40" />
        <div className="h-3 w-16 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[180, 120, 160, 100, 120].map((w, i) => (
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

function ClientCard({
  client,
  onClick,
}: {
  client: ClientSummary;
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
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-sm font-semibold text-accent">
            {client.full_name.trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{client.full_name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-fg">
              {client.phone && (
                <>
                  <Phone className="size-3" />
                  {client.phone}
                </>
              )}
            </p>
          </div>
        </div>
        {client.city && (
          <span className="shrink-0 text-xs text-muted-fg">{client.city}</span>
        )}
      </div>
      {client.tags && client.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 border-t border-border/30 pt-3">
          {client.tags.slice(0, 3).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
          {client.tags.length > 3 && (
            <span className="text-xs text-muted-fg">+{client.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function ClientRow({
  client,
  onClick,
}: {
  client: ClientSummary;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-bg/60 last:border-0"
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-xs font-semibold text-accent">
            {client.full_name.trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{client.full_name}</p>
            {client.company_name && (
              <p className="truncate text-xs text-muted-fg">{client.company_name}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        {client.phone ? (
          <a
            href={`tel:${client.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-muted-fg hover:text-accent"
          >
            <Phone className="size-3" />
            {client.phone}
          </a>
        ) : (
          <span className="text-sm text-border">–</span>
        )}
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        {client.email ? (
          <a
            href={`mailto:${client.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-muted-fg hover:text-accent"
          >
            <Mail className="size-3" />
            {client.email}
          </a>
        ) : (
          <span className="text-sm text-border">–</span>
        )}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-muted-fg xl:table-cell">
        {client.city ?? <span className="text-border">–</span>}
      </td>
      <td className="hidden px-4 py-3.5 xl:table-cell">
        {client.tags && client.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.tags.slice(0, 2).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
            {client.tags.length > 2 && (
              <span className="text-xs text-muted-fg">+{client.tags.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-border">–</span>
        )}
      </td>
      <td className="hidden px-4 py-3.5 text-sm tabular-nums text-muted-fg lg:table-cell">
        {formatDate(client.created_at)}
      </td>
      <td className="px-3 py-3.5 text-muted-fg/40">
        <MoreHorizontal className="size-4" />
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');
  const [newClientOpen, setNewClientOpen] = useState(false);
  const debouncedSearch = useDebounce(localSearch, 300);

  const page = Number(searchParams.get('page') ?? 0);
  const selectedId = searchParams.get('id');

  // ?new=1 trigger (from ⌘K)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewClientOpen(true);
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

  // Sync debounced search → URL
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

  // n key shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'n') {
        e.preventDefault();
        setNewClientOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const params: ClientListParams = {
    q: searchParams.get('q') ?? undefined,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError, refetch } = useClients(params);

  const openClient = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('id', id);
        return next;
      });
    },
    [setSearchParams],
  );

  const closeClient = useCallback(() => {
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

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 20;

  const descriptor = isLoading
    ? 'Loading…'
    : `${total} client${total !== 1 ? 's' : ''}`;

  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setNewClientOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 md:min-h-9"
          >
            <Plus className="size-4" />
            New client
          </button>
        }
      />

      {/* Search toolbar */}
      <div className="mt-6">
        <label className="flex min-h-11 max-w-sm items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 text-sm md:min-h-10">
          <Search className="size-4 shrink-0 text-muted-fg/60" />
          <input
            type="search"
            placeholder="Search clients…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent text-fg placeholder:text-muted-fg/60 focus:outline-none"
          />
        </label>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isError ? (
          <ErrorState
            title="Couldn't load clients"
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
            icon={<Plus className="size-6" />}
            title="No clients yet"
            description={
              searchParams.get('q')
                ? 'No clients match your search — try a different name or phone number.'
                : 'Clients are created automatically when leads convert. You can also add them directly.'
            }
            action={
              !searchParams.get('q') ? (
                <button
                  type="button"
                  onClick={() => setNewClientOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg/90 px-4 py-2 text-sm font-medium text-bg shadow-elevated hover:opacity-90 md:min-h-9"
                >
                  <Plus className="size-4" />
                  Add first client
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Mobile */}
            <div className="grid gap-2 md:hidden">
              {rows.map((client) => (
                <ClientCard key={client.id} client={client} onClick={() => openClient(client.id)} />
              ))}
            </div>

            {/* Desktop */}
            <GlassCard className="hidden overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Email</th>
                      <th className="hidden px-4 py-3 xl:table-cell">City</th>
                      <th className="hidden px-4 py-3 xl:table-cell">Tags</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Added</th>
                      <th className="w-8 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((client) => (
                      <ClientRow
                        key={client.id}
                        client={client}
                        onClick={() => openClient(client.id)}
                      />
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

      <ClientSlideOver id={selectedId} onClose={closeClient} />
      <NewClientDialog open={newClientOpen} onOpenChange={setNewClientOpen} />
    </PageContainer>
  );
}
