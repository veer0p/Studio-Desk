import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  MapPin,
  User,
  Calendar,
  IndianRupee,
  FileText,
  Activity,
  Camera,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { BookingStatusBadge, STATUS_CONFIG } from './components/BookingStatusBadge';
import {
  useBooking,
  useBookingActivity,
  useShootBrief,
  useUpdateBooking,
  useUpdateBookingStatus,
  useUpsertShootBrief,
} from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime, formatINR, formatIndianPhone } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { BookingDetail, BookingActivity, BookingStatus } from './types';
import { BOOKING_STATUSES } from '@/lib/validations/booking.schema';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'activity' | 'notes' | 'brief';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity' },
    { key: 'notes', label: 'Notes' },
    { key: 'brief', label: 'Shoot brief' },
  ];
  return (
    <div className="flex border-b border-border">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors',
            active === key
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-fg hover:text-fg',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

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

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  booking,
  onStatusChange,
  isUpdatingStatus,
}: {
  booking: BookingDetail;
  onStatusChange: (s: BookingStatus) => void;
  isUpdatingStatus: boolean;
}) {
  const paid = booking.amount_paid ?? 0;
  const pending = booking.amount_pending ?? 0;
  const paidPct = booking.total_amount > 0 ? Math.round((paid / booking.total_amount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Financial summary */}
      <div className="rounded-card border border-border bg-bg/40 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-fg/60">Total</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums">{formatINR(booking.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-fg/60">Paid</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatINR(paid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-fg/60">Pending</p>
            <p className={cn('mt-0.5 text-base font-semibold tabular-nums', pending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-fg')}>
              {formatINR(pending)}
            </p>
          </div>
        </div>
        {/* Payment progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-border">
          <div
            className="h-full rounded-pill bg-emerald-500 transition-all"
            style={{ width: `${paidPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-muted-fg/60">{paidPct}% collected</p>
      </div>

      {/* Booking details */}
      <div className="space-y-4">
        <InfoRow label="Client">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-muted-fg/60" />
            <span>{booking.client_name ?? '—'}</span>
          </div>
          {booking.client_phone && (
            <p className="mt-0.5 text-xs text-muted-fg">{formatIndianPhone(booking.client_phone)}</p>
          )}
          {booking.client_email && (
            <p className="mt-0.5 text-xs text-muted-fg">{booking.client_email}</p>
          )}
        </InfoRow>

        <InfoRow label="Event">
          <div className="flex items-center gap-1.5">
            <Tag className="size-3.5 text-muted-fg/60" />
            <span className="capitalize">{booking.event_type.replace('_', ' ')}</span>
          </div>
          {booking.event_date && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-fg">
              <Calendar className="size-3.5" />
              {formatDate(booking.event_date)}
              {booking.event_end_date && ` → ${formatDate(booking.event_end_date)}`}
            </div>
          )}
        </InfoRow>

        {booking.venue_name && (
          <InfoRow label="Venue">
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-fg/60" />
              <div>
                <p>{booking.venue_name}</p>
                {booking.venue_city && (
                  <p className="mt-0.5 text-xs text-muted-fg">
                    {[booking.venue_city, booking.venue_state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </InfoRow>
        )}

        {booking.package_name && (
          <InfoRow label="Package">
            <div className="flex items-center gap-1.5">
              <Camera className="size-3.5 text-muted-fg/60" />
              {booking.package_name}
            </div>
          </InfoRow>
        )}

        {/* GST */}
        {booking.gst_type !== 'none' && (
          <InfoRow label="GST">
            <div className="space-y-0.5 text-xs">
              <p>Subtotal: {formatINR(booking.subtotal)}</p>
              {booking.gst_type === 'cgst_sgst' ? (
                <>
                  <p>CGST (9%): {formatINR(booking.cgst_amount)}</p>
                  <p>SGST (9%): {formatINR(booking.sgst_amount)}</p>
                </>
              ) : (
                <p>IGST (18%): {formatINR(booking.igst_amount)}</p>
              )}
            </div>
          </InfoRow>
        )}

        <InfoRow label="Created">
          {formatDateTime(booking.created_at)}
        </InfoRow>
      </div>

      {/* Status change */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Change status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {BOOKING_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = s === booking.status;
            return (
              <button
                key={s}
                type="button"
                disabled={isActive || isUpdatingStatus}
                onClick={() => onStatusChange(s)}
                className={cn(
                  'rounded-input border px-3 py-2 text-xs transition-colors',
                  isActive
                    ? 'cursor-default border-accent/30 bg-accent/8 font-medium text-accent'
                    : 'border-border/70 bg-card text-muted-fg hover:bg-bg hover:text-fg disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  booking_created: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  status_changed: <Activity className="size-3.5 text-accent" />,
  payment_recorded: <IndianRupee className="size-3.5 text-emerald-500" />,
  note_updated: <FileText className="size-3.5 text-blue-500" />,
  default: <Clock className="size-3.5 text-muted-fg/60" />,
};

function ActivityTab({ bookingId }: { bookingId: string }) {
  const { data: feed, isLoading } = useBookingActivity(bookingId);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 size-6 shrink-0 animate-pulse rounded-full bg-border/40" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-48 animate-pulse rounded bg-border/50" />
              <div className="h-3 w-24 animate-pulse rounded bg-border/30" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!feed?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-fg">No activity recorded yet.</p>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {feed.map((event: BookingActivity) => {
        const icon = ACTIVITY_ICONS[event.event_type] ?? ACTIVITY_ICONS.default;
        const label = event.event_type.replace(/_/g, ' ');
        return (
          <div key={event.id} className="flex gap-3">
            <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-border/60 bg-bg">
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-sm capitalize text-fg/90">{label}</p>
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <p className="mt-0.5 text-xs text-muted-fg/70">
                  {Object.entries(event.metadata)
                    .slice(0, 2)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-fg/50">{formatDateTime(event.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({ booking }: { booking: BookingDetail }) {
  const [draft, setDraft] = useState(booking.notes ?? '');
  const [saved, setSaved] = useState(false);
  const original = booking.notes ?? '';
  const updateBooking = useUpdateBooking();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const save = async () => {
    if (draft === original) return;
    try {
      await updateBooking.mutateAsync({ id: booking.id, data: { notes: draft } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void save();
    }
    if (e.key === 'Escape') {
      setDraft(original);
      textareaRef.current?.blur();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        rows={8}
        placeholder="Internal notes about this booking — client preferences, song choices, shot ideas…"
        className="w-full rounded-input border border-border bg-bg/60 p-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-fg/50">⌘↵ to save · Esc to revert</p>
        {saved && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</p>}
        <button
          type="button"
          onClick={() => void save()}
          disabled={draft === original || updateBooking.isPending}
          className="min-h-8 rounded-input bg-fg/90 px-3 text-xs font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {updateBooking.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Shoot Brief tab ──────────────────────────────────────────────────────────

function ShootBriefTab({ bookingId }: { bookingId: string }) {
  const { data: brief, isLoading } = useShootBrief(bookingId);
  const upsert = useUpsertShootBrief();
  const [shotList, setShotList] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (brief) {
      setShotList(brief.shot_list ?? '');
      setSpecialRequests(brief.special_requests ?? '');
      setLocationNotes(brief.location_notes ?? '');
    }
  }, [brief]);

  const save = async () => {
    try {
      await upsert.mutateAsync({
        id: bookingId,
        data: {
          shot_list: shotList || null,
          special_requests: specialRequests || null,
          location_notes: locationNotes || null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save shoot brief');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-input bg-border/30" />
        <div className="h-16 animate-pulse rounded-input bg-border/30" />
      </div>
    );
  }

  const textCls =
    'w-full rounded-input border border-border bg-bg/60 p-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">Shot list</label>
        <textarea
          rows={5}
          value={shotList}
          onChange={(e) => setShotList(e.target.value)}
          placeholder="Bride & groom first look, family formals (list attached), golden hour portraits…"
          className={textCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">Special requests</label>
        <textarea
          rows={3}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Avoid wide shots, one family photo with maternal grandparents only…"
          className={textCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">Location notes</label>
        <textarea
          rows={3}
          value={locationNotes}
          onChange={(e) => setLocationNotes(e.target.value)}
          placeholder="Parking at south gate, bridal suite on 3rd floor, ceremony at garden gazebo…"
          className={textCls}
        />
      </div>
      <div className="flex items-center justify-between">
        {saved && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</p>}
        <button
          type="button"
          onClick={() => void save()}
          disabled={upsert.isPending}
          className="ml-auto min-h-8 rounded-input bg-fg/90 px-4 text-xs font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {upsert.isPending ? 'Saving…' : 'Save brief'}
        </button>
      </div>
    </div>
  );
}

// ─── Slide-over content ───────────────────────────────────────────────────────

function BookingSlideOverContent({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const { data: booking, isLoading, isError } = useBooking(id);
  const updateStatus = useUpdateBookingStatus();

  const handleStatusChange = async (status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      toast.success(`Status updated to "${STATUS_CONFIG[status].label}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-5 w-48 animate-pulse rounded bg-border/50" />
        <div className="h-4 w-32 animate-pulse rounded bg-border/30" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-card bg-border/30" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-fg">Couldn't load booking details.</p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-accent hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{booking.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            {booking.event_date && (
              <span className="flex items-center gap-1 text-xs text-muted-fg">
                <Calendar className="size-3" />
                {formatDate(booking.event_date)}
              </span>
            )}
          </div>
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

      <TabBar active={tab} onSelect={setTab} />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === 'overview' && (
          <OverviewTab
            booking={booking}
            onStatusChange={handleStatusChange}
            isUpdatingStatus={updateStatus.isPending}
          />
        )}
        {tab === 'activity' && <ActivityTab bookingId={id} />}
        {tab === 'notes' && <NotesTab booking={booking} />}
        {tab === 'brief' && <ShootBriefTab bookingId={id} />}
      </div>
    </>
  );
}

// ─── Shell: desktop Dialog / mobile Drawer ────────────────────────────────────

export function BookingSlideOver({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const open = !!id;

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-border/60" />
            {id && <BookingSlideOverContent id={id} onClose={onClose} />}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
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
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.aside
                className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-border bg-card shadow-elevated"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Booking details</Dialog.Title>
                {id && <BookingSlideOverContent id={id} onClose={onClose} />}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
