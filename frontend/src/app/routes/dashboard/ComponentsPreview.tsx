import { useState } from 'react';
import { Sparkles, UserPlus } from 'lucide-react';
import { GlassCard } from '@/components/motion/GlassCard';
import { NumberTicker } from '@/components/motion/NumberTicker';
import { EmptyState } from '@/components/data/EmptyState';
import { LoadingSkeleton } from '@/components/data/LoadingSkeleton';
import { ErrorState } from '@/components/data/ErrorState';
import { SlideOver } from '@/components/layout/SlideOver';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * /_components — internal smoke test for the design primitives.
 * Every page must follow this shape: PageContainer + PageHeader + body.
 */
export function ComponentsPreview() {
  const [slideOpen, setSlideOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Components"
        description="Reference page for design primitives · Sprint 0 foundation"
      />

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold">KPI cards</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-fg">This month</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              <NumberTicker value={482000} format="INR" />
            </p>
            <p className="mt-1 text-xs text-muted-fg">12 shoots</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-fg">Outstanding</p>
            <p className="mt-2 font-display text-3xl font-semibold text-warn">
              <NumberTicker value={94500} format="INR" />
            </p>
            <p className="mt-1 text-xs text-muted-fg">3 overdue invoices</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-fg">Today</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              <NumberTicker value={3} format="number" />
            </p>
            <p className="mt-1 text-xs text-muted-fg">Shoots scheduled</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-fg">New leads · 7 days</p>
            <p className="mt-2 font-display text-3xl font-semibold text-success">
              <NumberTicker value={11} format="number" />
            </p>
            <p className="mt-1 text-xs text-muted-fg">5 from Instagram</p>
          </GlassCard>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Empty state</h2>
          <EmptyState
            icon={<UserPlus className="size-5" />}
            title="No leads yet — your first wedding shoot is one click away."
            description="Add a lead manually or share your inquiry link. Both land here."
            action={
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:opacity-95 md:min-h-9"
              >
                <Sparkles className="size-4" />
                Add lead
              </button>
            }
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Error state</h2>
          <ErrorState
            description="We could not reach the server. Hang tight, retrying…"
            onRetry={() => undefined}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold">Loading skeleton</h2>
        <div className="space-y-3">
          <LoadingSkeleton className="h-4 w-1/3" />
          <LoadingSkeleton className="h-4 w-2/3" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold">Slide-over</h2>
        <button
          type="button"
          onClick={() => setSlideOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-input border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-bg md:min-h-9"
        >
          Open slide-over
        </button>
        <SlideOver
          open={slideOpen}
          onOpenChange={setSlideOpen}
          title="Sharma Wedding"
          description="Pre-wedding · 14 Dec 2026 · Goa"
        >
          <p className="text-sm text-muted-fg">
            On `md+` this slides in from the right. On mobile (`&lt;md`), Sprint 1 modules will
            render the same content as a bottom sheet via vaul instead.
          </p>
        </SlideOver>
      </section>
    </PageContainer>
  );
}
