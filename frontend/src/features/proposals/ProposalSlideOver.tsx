import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  RefreshCw,
  Send,
  Calendar,
  User,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProposalStatusBadge } from './components/ProposalStatusBadge';
import { useProposal, useUpdateProposal, useSendProposal } from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime, formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ProposalDetail, GstType } from './types';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'quote' | 'info' | 'notes';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-border">
      {(['quote', 'info', 'notes'] as Tab[]).map((tab) => (
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

// ─── GST breakdown helper ─────────────────────────────────────────────────────

function GstLabel({ gstType }: { gstType: GstType }) {
  if (gstType === 'cgst_sgst') return <span>CGST (9%) + SGST (9%)</span>;
  if (gstType === 'igst') return <span>IGST (18%)</span>;
  return <span>No GST</span>;
}

// ─── Quote tab ────────────────────────────────────────────────────────────────

function QuoteTab({ proposal }: { proposal: ProposalDetail }) {
  const subtotal = parseFloat(proposal.subtotal);
  const cgst = parseFloat(proposal.cgst_amount);
  const sgst = parseFloat(proposal.sgst_amount);
  const igst = parseFloat(proposal.igst_amount);
  const total = parseFloat(proposal.total_amount);

  return (
    <div className="space-y-6 py-4">
      {/* Line items */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Line items
        </h3>
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-bg/50 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.line_items.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-fg">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-muted-fg">{item.description}</p>
                    )}
                    {item.hsn_sac_code && (
                      <p className="font-mono text-[10px] text-muted-fg/60">
                        HSN/SAC: {item.hsn_sac_code}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-fg">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-fg">
                    {formatINR(parseFloat(item.unit_price))}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium text-fg/90">
                    {formatINR(parseFloat(item.total_price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GST breakdown */}
      <section>
        <div className="space-y-2 rounded-card border border-border bg-bg/50 p-4 text-sm">
          <div className="flex justify-between text-muted-fg">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(subtotal)}</span>
          </div>
          {proposal.gst_type !== 'none' && (
            <>
              {proposal.gst_type === 'cgst_sgst' ? (
                <>
                  <div className="flex justify-between text-muted-fg">
                    <span>CGST (9%)</span>
                    <span className="tabular-nums">{formatINR(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-muted-fg">
                    <span>SGST (9%)</span>
                    <span className="tabular-nums">{formatINR(sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-muted-fg">
                  <span>IGST (18%)</span>
                  <span className="tabular-nums">{formatINR(igst)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between border-t border-border/60 pt-2 font-semibold text-fg">
            <span>Total</span>
            <span className="tabular-nums">{formatINR(total)}</span>
          </div>
          <div className="pt-1 text-[11px] text-muted-fg/70">
            GST type: <GstLabel gstType={proposal.gst_type} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({ proposal }: { proposal: ProposalDetail }) {
  return (
    <div className="space-y-6 py-4">
      {/* Status */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Status
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <ProposalStatusBadge status={proposal.status} />
          {proposal.is_expired && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3.5" />
              Expired
            </span>
          )}
        </div>
      </section>

      {/* Client & booking */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Client & booking
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Client">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-fg/60" />
              {proposal.client_name}
            </span>
          </InfoRow>
          <InfoRow label="Booking">{proposal.booking_title}</InfoRow>
          {proposal.event_type && (
            <InfoRow label="Event type">
              <span className="capitalize">{proposal.event_type.replace(/_/g, ' ')}</span>
            </InfoRow>
          )}
          {proposal.event_date && (
            <InfoRow label="Event date">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-fg/60" />
                {formatDate(proposal.event_date)}
              </span>
            </InfoRow>
          )}
        </div>
      </section>

      {/* Dates */}
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Timeline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Created">{formatDate(proposal.created_at)}</InfoRow>
          {proposal.valid_until && (
            <InfoRow label="Valid until">{formatDate(proposal.valid_until)}</InfoRow>
          )}
          {proposal.sent_at && (
            <InfoRow label="Sent">
              <span className="flex items-center gap-1.5">
                <Send className="size-3.5 text-muted-fg/60" />
                {formatDateTime(proposal.sent_at)}
              </span>
            </InfoRow>
          )}
          {proposal.viewed_at && (
            <InfoRow label="Viewed">
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-muted-fg/60" />
                {formatDateTime(proposal.viewed_at)}
              </span>
            </InfoRow>
          )}
          {proposal.accepted_at && (
            <InfoRow label="Accepted">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {formatDateTime(proposal.accepted_at)}
              </span>
            </InfoRow>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-fg/60">Version {proposal.version}</p>
      </section>
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({
  proposal,
  onSave,
}: {
  proposal: ProposalDetail;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(proposal.notes ?? '');
  const [saved, setSaved] = useState(false);
  const dirty = notes !== (proposal.notes ?? '');

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
          if (e.key === 'Escape') setNotes(proposal.notes ?? '');
        }}
        placeholder="Add notes about this proposal…"
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

// ─── Inner content ────────────────────────────────────────────────────────────

function ProposalSlideOverContent({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('quote');
  const { data: proposal, isLoading, isError, refetch } = useProposal(id);
  const updateProposal = useUpdateProposal();
  const sendProposal = useSendProposal();

  const handleNotesSave = (notes: string) => {
    updateProposal.mutate({ id, data: { notes } });
  };

  const handleSend = () => {
    sendProposal.mutate(id, {
      onSuccess: () => {
        toast.success('Proposal sent', {
          description: 'The client will receive an email with a link to view and accept.',
        });
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string }).message ?? 'Failed to send proposal.';
        toast.error('Send failed', { description: msg });
      },
    });
  };

  const canSend =
    proposal &&
    (proposal.status === 'draft' || proposal.status === 'sent') &&
    !proposal.is_expired;

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
          ) : proposal ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-lg font-semibold">
                  {proposal.client_name}
                </h2>
                <ProposalStatusBadge status={proposal.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-fg">
                {proposal.booking_title} · {formatINR(parseFloat(proposal.total_amount))}
              </p>
            </>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canSend && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendProposal.isPending}
              className="inline-flex items-center gap-1.5 rounded-input border border-accent/40 bg-accent/8 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/12 disabled:opacity-50"
            >
              <Send className="size-3" />
              {sendProposal.isPending ? 'Sending…' : proposal?.status === 'sent' ? 'Resend' : 'Send'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!isLoading && proposal && <TabBar active={tab} onSelect={setTab} />}

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="size-5 animate-spin text-muted-fg/50" />
          </div>
        ) : isError || !proposal ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-muted-fg">Couldn't load this proposal.</p>
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
            {tab === 'quote' && <QuoteTab proposal={proposal} />}
            {tab === 'info' && <InfoTab proposal={proposal} />}
            {tab === 'notes' && <NotesTab proposal={proposal} onSave={handleNotesSave} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Exported shell ───────────────────────────────────────────────────────────

export function ProposalSlideOver({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer.Root open={!!id} onOpenChange={(open) => !open && onClose()} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mb-1 mt-3 h-1 w-10 shrink-0 rounded-full bg-border/70" />
            {id && <ProposalSlideOverContent id={id} onClose={onClose} />}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

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
                <Dialog.Title className="sr-only">Proposal detail</Dialog.Title>
                <ProposalSlideOverContent id={id} onClose={onClose} />
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
