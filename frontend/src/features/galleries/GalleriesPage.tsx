import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Images, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { GalleryStatusBadge } from './components/GalleryStatusBadge';
import { NewGalleryDialog } from './NewGalleryDialog';
import { useGalleries } from './hooks';
import type { GallerySummary, GalleryStatus, GalleryListParams } from './types';
import { formatDate } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants/routes';

const STATUS_TABS: { value: GalleryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card/60">
      <div className="aspect-[4/3] animate-pulse bg-border/40" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-border/50" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-border/30" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-border/30" />
      </div>
    </div>
  );
}

// ─── Gallery card ─────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<string, string> = {
  wedding: 'from-rose-400/20 to-pink-400/20',
  pre_wedding: 'from-rose-400/15 to-orange-300/15',
  birthday: 'from-amber-400/20 to-yellow-300/20',
  corporate: 'from-blue-400/20 to-indigo-400/20',
  portrait: 'from-violet-400/20 to-purple-400/20',
  maternity: 'from-teal-400/20 to-emerald-400/20',
  baby_shower: 'from-sky-400/20 to-cyan-400/20',
  event_coverage: 'from-orange-400/20 to-amber-400/20',
};

function GalleryCard({ gallery, onClick }: { gallery: GallerySummary; onClick: () => void }) {
  const gradient = EVENT_COLORS[gallery.event_type ?? ''] ?? 'from-accent/10 to-accent/5';
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-card border border-border bg-card/80 text-left transition-all hover:border-border/80 hover:shadow-elevated"
    >
      {/* Thumbnail area */}
      <div
        className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${gradient} transition-opacity group-hover:opacity-90`}
      >
        <div className="flex flex-col items-center gap-1">
          <Images className="size-8 text-muted-fg/30" />
          <span className="text-2xl font-semibold tabular-nums text-fg/40">
            {gallery.total_photos}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-fg/40">photos</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-fg">{gallery.name}</p>
          <GalleryStatusBadge status={gallery.status} />
        </div>
        <p className="mt-1 truncate text-xs text-muted-fg">{gallery.client_name}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-fg/60">
            {gallery.event_date ? formatDate(gallery.event_date) : '—'}
          </span>
          {gallery.total_videos > 0 && (
            <span className="text-xs text-muted-fg/60">{gallery.total_videos} video{gallery.total_videos !== 1 ? 's' : ''}</span>
          )}
        </div>
        {gallery.status === 'published' && gallery.views_count > 0 && (
          <p className="mt-1 text-xs text-accent">{gallery.views_count} view{gallery.views_count !== 1 ? 's' : ''}</p>
        )}
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function GalleriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const statusParam = searchParams.get('status') as GalleryStatus | null;
  const activeTab: GalleryStatus | 'all' = statusParam ?? 'all';
  const page = Number(searchParams.get('page') ?? 0);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('new') === '1');
  const PAGE_SIZE = 24;

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setDialogOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('new');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setTab = useCallback(
    (tab: GalleryStatus | 'all') => {
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

  const setPage = useCallback(
    (p: number) =>
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(p)); return next; }),
    [setSearchParams],
  );

  const params: GalleryListParams = {
    status: activeTab === 'all' ? undefined : activeTab,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useGalleries(params);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;

  const descriptor = isLoading ? 'Loading…' : `${total} galler${total !== 1 ? 'ies' : 'y'}`;

  return (
    <PageContainer>
      <PageHeader
        title="Gallery"
        description={descriptor}
        actions={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex min-h-9 items-center gap-2 rounded-input bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            New gallery
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
            title="Couldn't load galleries"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Images className="size-6" />}
            title="No galleries yet"
            description={
              activeTab !== 'all'
                ? `No ${activeTab} galleries — try a different filter.`
                : 'Create a gallery after a booking is confirmed, then upload and publish photos for your client.'
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((g) => (
              <GalleryCard
                key={g.id}
                gallery={g}
                onClick={() => navigate(ROUTES.galleryDetail(g.id))}
              />
            ))}
          </div>
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

      <NewGalleryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) => navigate(ROUTES.galleryDetail(id))}
      />
    </PageContainer>
  );
}
