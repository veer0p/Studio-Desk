import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Tag,
  Building2,
  RefreshCw,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { useClient, useUpdateClient } from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ClientDetail, ClientBooking } from './types';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'bookings' | 'notes';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-border">
      {(['overview', 'bookings', 'notes'] as Tab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={cn(
            'px-5 py-3 text-sm font-medium capitalize transition-colors',
            active === tab
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-fg hover:text-fg',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
        {label}
      </span>
      <div className="text-sm text-fg/90">{children}</div>
    </div>
  );
}

// ─── Booking status pill ──────────────────────────────────────────────────────

function BookingStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    tentative: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    cancelled: 'bg-border/60 text-muted-fg',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        map[status] ?? 'bg-border/60 text-muted-fg',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ client }: { client: ClientDetail }) {
  return (
    <div className="space-y-6 py-4">
      {/* Contact */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Contact
        </h3>
        <div className="flex flex-wrap gap-3 text-sm text-muted-fg">
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <Phone className="size-3.5" />
              {client.phone}
            </a>
          )}
          {client.whatsapp && (
            <a
              href={`https://wa.me/91${client.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
          )}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <Mail className="size-3.5" />
              {client.email}
            </a>
          )}
        </div>
      </section>

      {/* Stats card */}
      <section>
        <div className="grid grid-cols-3 divide-x divide-border rounded-card border border-border bg-bg/50">
          <div className="px-4 py-3 text-center">
            <p className="font-display text-lg font-semibold tabular-nums">
              {client.stats.total_bookings}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-fg">Bookings</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="font-display text-lg font-semibold tabular-nums">
              {formatINR(parseFloat(client.stats.total_revenue))}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-fg">Revenue</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="font-display text-lg font-semibold tabular-nums">
              {formatINR(parseFloat(client.stats.total_paid))}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-fg">Paid</p>
          </div>
        </div>
      </section>

      {/* Location */}
      {(client.address || client.city || client.state) && (
        <section>
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
            Address
          </h3>
          <div className="flex items-start gap-2 text-sm text-fg/90">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-fg/60" />
            <div>
              {client.address && <p>{client.address}</p>}
              {(client.city || client.state) && (
                <p className="text-muted-fg">
                  {[client.city, client.state, client.pincode].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Business */}
      {(client.company_name || client.gstin) && (
        <section>
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
            Business
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {client.company_name && (
              <InfoRow label="Company">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-fg/60" />
                  {client.company_name}
                </span>
              </InfoRow>
            )}
            {client.gstin && (
              <InfoRow label="GSTIN">
                <span className="font-mono text-xs tracking-wider">{client.gstin}</span>
              </InfoRow>
            )}
          </div>
        </section>
      )}

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <section>
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Tag className="size-3.5 shrink-0 self-center text-muted-fg/60" />
            {client.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-bg/80 px-2 py-0.5 text-xs text-muted-fg"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Bookings tab ─────────────────────────────────────────────────────────────

function BookingsTab({ client }: { client: ClientDetail }) {
  if (client.bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="mx-auto mb-3 size-8 text-muted-fg/30" />
        <p className="text-sm text-muted-fg">No bookings yet.</p>
        <p className="mt-0.5 text-xs text-muted-fg/60">
          Bookings linked to this client will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-4">
      {client.bookings.map((booking: ClientBooking) => (
        <div
          key={booking.id}
          className="rounded-card border border-border bg-bg/50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{booking.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-fg">
                <Calendar className="size-3" />
                {formatDate(booking.event_date)}
                <span className="text-border">·</span>
                <span className="capitalize">{booking.event_type.replace(/_/g, ' ')}</span>
              </p>
            </div>
            <BookingStatusPill status={booking.status} />
          </div>
          <div className="mt-2.5 flex items-center gap-4 border-t border-border/30 pt-2.5 text-xs tabular-nums text-muted-fg">
            <span className="flex items-center gap-1">
              <IndianRupee className="size-3" />
              {formatINR(parseFloat(booking.total_amount))} total
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="size-3" />
              {formatINR(parseFloat(booking.amount_paid))} paid
            </span>
            {parseFloat(booking.amount_pending) > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <IndianRupee className="size-3" />
                {formatINR(parseFloat(booking.amount_pending))} pending
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({
  client,
  onSave,
}: {
  client: ClientDetail;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(client.notes ?? '');
  const [saved, setSaved] = useState(false);
  const dirty = notes !== (client.notes ?? '');

  const handleSave = () => {
    if (!dirty) return;
    onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          }
          if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); setNotes(client.notes ?? ''); }
        }}
        placeholder="Add notes about this client…"
        rows={8}
        className="w-full resize-none rounded-card border border-border bg-bg/60 px-4 py-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="flex items-center justify-between text-xs text-muted-fg">
        <span>{navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+↵ to save · Esc to discard</span>
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-input border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-bg"
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Inner content (shared between mobile sheet + desktop panel) ───────────────

function ClientSlideOverContent({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const { data: client, isLoading, isError, refetch } = useClient(id);
  const updateClient = useUpdateClient();

  const handleNotesSave = (notes: string) => {
    updateClient.mutate({ id, data: { notes } });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <div className="h-5 w-36 animate-pulse rounded bg-border/60" />
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-border/40" />
            </>
          ) : client ? (
            <>
              <h2 className="truncate font-display text-lg font-semibold">
                {client.full_name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-fg">
                {client.company_name ?? 'Client'}
                {client.city ? ` · ${client.city}` : ''}
              </p>
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Tabs */}
      {!isLoading && client && <TabBar active={tab} onSelect={setTab} />}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="size-5 animate-spin text-muted-fg/50" />
          </div>
        ) : isError || !client ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-muted-fg">Couldn't load this client.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm text-accent underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab client={client} />}
            {tab === 'bookings' && <BookingsTab client={client} />}
            {tab === 'notes' && <NotesTab client={client} onSave={handleNotesSave} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Exported shell ───────────────────────────────────────────────────────────

export function ClientSlideOver({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();

  // Mobile: vaul bottom sheet
  if (isMobile) {
    return (
      <Drawer.Root open={!!id} onOpenChange={(open) => !open && onClose()} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mb-1 mt-3 h-1 w-10 shrink-0 rounded-full bg-border/70" />
            {id && <ClientSlideOverContent id={id} onClose={onClose} />}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop: Radix Dialog side panel
  return (
    <Dialog.Root open={!!id} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {id && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}
              onEscapeKeyDown={(e) => {
                const active = document.activeElement;
                if (active?.tagName === 'TEXTAREA') { e.preventDefault(); }
              }}
            >
              <motion.aside
                className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-elevated"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Client detail</Dialog.Title>
                <ClientSlideOverContent id={id} onClose={onClose} />
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
