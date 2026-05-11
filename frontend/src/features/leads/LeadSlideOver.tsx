import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  Tag,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { LeadStatusBadge } from './components/LeadStatusBadge';
import { LeadPriorityDot } from './components/LeadPriorityDot';
import { useLead, useUpdateLead } from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime, formatRelative, formatINR } from '@/lib/formatters';
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  LEAD_SOURCE_LABEL,
  LEAD_PRIORITY_LABEL,
  type LeadStatus,
  type LeadSource,
  type LeadPriority,
} from '@/lib/constants/enums';
import { cn } from '@/lib/utils';
import type { LeadDetail } from './types';

// ─── Status transitions (forward-only per backend rule) ───────────────────────

const STATUS_ORDER: Record<string, number> = {
  new_lead: 0, contacted: 1, proposal_sent: 2, contract_signed: 3,
  advance_paid: 4, shoot_scheduled: 5, delivered: 6, closed: 7, lost: -1,
};

function getForwardStatuses(current: string): LeadStatus[] {
  const cur = STATUS_ORDER[current] ?? -1;
  return LEAD_STATUSES.filter((s) => {
    if (s === 'lost') return true;
    const o = STATUS_ORDER[s] ?? -1;
    return o > cur;
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'activity' | 'notes';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-border">
      {(['overview', 'activity', 'notes'] as Tab[]).map((tab) => (
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

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  lead,
  onStatusChange,
  isMutating,
}: {
  lead: LeadDetail;
  onStatusChange: (s: LeadStatus) => void;
  isMutating: boolean;
}) {
  const nextStatuses = getForwardStatuses(lead.status);

  return (
    <div className="space-y-6 py-4">
      {/* Client */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Client
        </h3>
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-sm font-semibold text-accent">
            {lead.client.full_name.trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{lead.client.full_name}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-fg">
              {lead.client.phone && (
                <a
                  href={`tel:${lead.client.phone}`}
                  className="flex items-center gap-1 hover:text-accent"
                >
                  <Phone className="size-3" />
                  {lead.client.phone}
                </a>
              )}
              {lead.client.whatsapp && (
                <a
                  href={`https://wa.me/91${lead.client.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-accent"
                >
                  <MessageCircle className="size-3" />
                  WhatsApp
                </a>
              )}
              {lead.client.email && (
                <a
                  href={`mailto:${lead.client.email}`}
                  className="flex items-center gap-1 hover:text-accent"
                >
                  <Mail className="size-3" />
                  {lead.client.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Status */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Status
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <LeadStatusBadge status={lead.status as LeadStatus} />
          {nextStatuses.length > 0 && (
            <select
              disabled={isMutating}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onStatusChange(e.target.value as LeadStatus);
                (e.target as HTMLSelectElement).value = '';
              }}
              className="min-h-8 rounded-full border border-border/70 bg-card/70 px-3 text-xs text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
            >
              <option value="">Move to…</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* Event details */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Event
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {lead.event_type && (
            <InfoRow label="Type">
              <span className="capitalize">{lead.event_type.replace(/_/g, ' ')}</span>
            </InfoRow>
          )}
          {lead.event_date_approx && (
            <InfoRow label="Approx. date">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-fg/60" />
                {formatDate(lead.event_date_approx)}
              </span>
            </InfoRow>
          )}
          {lead.venue && (
            <InfoRow label="Venue">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-fg/60" />
                {lead.venue}
              </span>
            </InfoRow>
          )}
          {(lead.budget_min || lead.budget_max) && (
            <InfoRow label="Budget">
              {lead.budget_min && lead.budget_max
                ? `${formatINR(parseFloat(lead.budget_min))} – ${formatINR(parseFloat(lead.budget_max))}`
                : lead.budget_min
                  ? `From ${formatINR(parseFloat(lead.budget_min))}`
                  : `Up to ${formatINR(parseFloat(lead.budget_max!))}`}
            </InfoRow>
          )}
        </div>
      </section>

      {/* Meta */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Source">
            <span className="flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-fg/60" />
              {LEAD_SOURCE_LABEL[lead.source as LeadSource] ?? lead.source}
            </span>
          </InfoRow>
          <InfoRow label="Priority">
            <span className="flex items-center gap-1.5">
              <LeadPriorityDot priority={lead.priority as LeadPriority} />
              {LEAD_PRIORITY_LABEL[lead.priority as LeadPriority]}
            </span>
          </InfoRow>
          {lead.follow_up_at && (
            <InfoRow label="Follow-up">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-fg/60" />
                {formatDateTime(lead.follow_up_at)}
              </span>
            </InfoRow>
          )}
          {lead.assignee_name && (
            <InfoRow label="Assigned to">{lead.assignee_name}</InfoRow>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

function ActivityTab({ lead }: { lead: LeadDetail }) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoRow label="Created">{formatRelative(lead.created_at)}</InfoRow>
        <InfoRow label="Days since">
          {lead.days_since_created === 0
            ? 'Today'
            : `${lead.days_since_created} day${lead.days_since_created !== 1 ? 's' : ''} ago`}
        </InfoRow>
        {lead.last_contacted_at && (
          <InfoRow label="Last contacted">{formatRelative(lead.last_contacted_at)}</InfoRow>
        )}
        <InfoRow label="Updated">{formatRelative(lead.updated_at)}</InfoRow>
      </div>
      {lead.converted_to_booking && lead.booking_id && (
        <div className="rounded-card border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          Converted to booking {lead.booking_id.slice(0, 8)}…
        </div>
      )}
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({
  lead,
  onSave,
}: {
  lead: LeadDetail;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saved, setSaved] = useState(false);
  const dirty = notes !== (lead.notes ?? '');

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
          if (e.key === 'Escape') setNotes(lead.notes ?? '');
        }}
        placeholder="Add notes about this lead…"
        rows={8}
        className="w-full resize-none rounded-card border border-border bg-bg/60 px-4 py-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="flex items-center justify-between text-xs text-muted-fg">
        <span>⌘↵ to save · Esc to discard</span>
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

function LeadSlideOverContent({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const { data: lead, isLoading, isError, refetch } = useLead(id);
  const updateLead = useUpdateLead();

  const handleStatusChange = (status: LeadStatus) => {
    updateLead.mutate({ id, data: { status } });
  };

  const handleNotesSave = (notes: string) => {
    updateLead.mutate({ id, data: { notes } });
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
          ) : lead ? (
            <>
              <h2 className="truncate font-display text-lg font-semibold">
                {lead.client.full_name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-fg">
                Lead ·{' '}
                {lead.days_since_created === 0
                  ? 'today'
                  : `${lead.days_since_created}d ago`}
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
      {!isLoading && lead && <TabBar active={tab} onSelect={setTab} />}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="size-5 animate-spin text-muted-fg/50" />
          </div>
        ) : isError || !lead ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-muted-fg">Couldn't load this lead.</p>
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
            {tab === 'overview' && (
              <OverviewTab
                lead={lead}
                onStatusChange={handleStatusChange}
                isMutating={updateLead.isPending}
              />
            )}
            {tab === 'activity' && <ActivityTab lead={lead} />}
            {tab === 'notes' && <NotesTab lead={lead} onSave={handleNotesSave} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Exported shell ───────────────────────────────────────────────────────────

export function LeadSlideOver({
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
            {/* Drag handle */}
            <div className="mx-auto mb-1 mt-3 h-1 w-10 shrink-0 rounded-full bg-border/70" />
            {id && <LeadSlideOverContent id={id} onClose={onClose} />}
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
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.aside
                className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-elevated"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Lead detail</Dialog.Title>
                <LeadSlideOverContent id={id} onClose={onClose} />
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
