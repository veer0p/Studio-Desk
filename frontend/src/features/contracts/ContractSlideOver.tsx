import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  RefreshCw,
  Send,
  Bell,
  Calendar,
  User,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContractStatusBadge } from './components/ContractStatusBadge';
import { useContract, useUpdateContract, useSendContract, useRemindContract } from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ContractDetail } from './types';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'contract' | 'info' | 'notes';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-border">
      {(['contract', 'info', 'notes'] as Tab[]).map((tab) => (
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

// ─── Contract tab — HTML preview ──────────────────────────────────────────────

function ContractTab({ contract }: { contract: ContractDetail }) {
  return (
    <div className="py-4">
      {/* Backend already sanitizes HTML; this is a read-only preview */}
      <div
        className="prose prose-sm max-w-none rounded-card border border-border bg-bg/40 px-5 py-4 text-fg/90
          [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-fg
          [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-fg [&_h2]:mt-4
          [&_p]:text-sm [&_p]:leading-relaxed [&_strong]:font-semibold"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: contract.content_html }}
      />
      {contract.signed_at && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            Signed on {formatDateTime(contract.signed_at)}
            {contract.signed_pdf_url && (
              <a
                href={contract.signed_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 underline"
              >
                Download PDF
              </a>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({ contract }: { contract: ContractDetail }) {
  return (
    <div className="space-y-6 py-4">
      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Status
        </h3>
        <ContractStatusBadge status={contract.status} />
      </section>

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Client & booking
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Client">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-fg/60" />
              {contract.client_name}
            </span>
          </InfoRow>
          <InfoRow label="Booking">{contract.booking_title}</InfoRow>
          {contract.event_type && (
            <InfoRow label="Event type">
              <span className="capitalize">{contract.event_type.replace(/_/g, ' ')}</span>
            </InfoRow>
          )}
          {contract.event_date && (
            <InfoRow label="Event date">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-fg/60" />
                {formatDate(contract.event_date)}
              </span>
            </InfoRow>
          )}
          {contract.client_email && (
            <div className="col-span-2">
              <InfoRow label="Client email">{contract.client_email}</InfoRow>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
          Timeline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Created">{formatDate(contract.created_at)}</InfoRow>
          {contract.sent_at && (
            <InfoRow label="Sent">
              <span className="flex items-center gap-1.5">
                <Send className="size-3.5 text-muted-fg/60" />
                {formatDateTime(contract.sent_at)}
              </span>
            </InfoRow>
          )}
          {contract.viewed_at && (
            <InfoRow label="Viewed">
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-muted-fg/60" />
                {formatDateTime(contract.viewed_at)}
              </span>
            </InfoRow>
          )}
          {contract.reminder_sent_at && (
            <InfoRow label="Last reminder">
              <span className="flex items-center gap-1.5">
                <Bell className="size-3.5 text-muted-fg/60" />
                {formatDateTime(contract.reminder_sent_at)}
              </span>
            </InfoRow>
          )}
          {contract.signed_at && (
            <InfoRow label="Signed">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {formatDateTime(contract.signed_at)}
              </span>
            </InfoRow>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({
  contract,
  onSave,
}: {
  contract: ContractDetail;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(contract.notes ?? '');
  const [saved, setSaved] = useState(false);
  const dirty = notes !== (contract.notes ?? '');

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
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSave(); }
          if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); setNotes(contract.notes ?? ''); }
        }}
        placeholder="Add notes about this contract…"
        rows={8}
        className="w-full resize-none rounded-card border border-border bg-bg/60 px-4 py-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="flex items-center justify-between text-xs text-muted-fg">
        <span>{navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+↵ to save · Esc to discard</span>
        {dirty && (
          <button type="button" onClick={handleSave}
            className="rounded-input border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-bg">
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Reminder cooldown helper ─────────────────────────────────────────────────

function reminderCooledDown(reminderSentAt: string | null): boolean {
  if (!reminderSentAt) return true;
  return Date.now() - new Date(reminderSentAt).getTime() >= 24 * 60 * 60 * 1000;
}

// ─── Inner content ────────────────────────────────────────────────────────────

function ContractSlideOverContent({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('contract');
  const { data: contract, isLoading, isError, refetch } = useContract(id);
  const updateContract = useUpdateContract();
  const sendContract = useSendContract();
  const remindContract = useRemindContract();

  const handleNotesSave = (notes: string) => {
    updateContract.mutate({ id, data: { notes } }, {
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? '';
        if (msg.includes('cannot be edited')) toast.error('Notes cannot be edited after a contract is sent');
        else toast.error('Failed to save notes');
      },
    });
  };

  const handleSend = () => {
    sendContract.mutate(id, {
      onSuccess: () => toast.success('Contract sent', {
        description: 'The client will receive an email with a link to review and sign.',
      }),
      onError: (err: unknown) => {
        toast.error('Send failed', { description: (err as { message?: string }).message ?? 'Try again.' });
      },
    });
  };

  const handleRemind = () => {
    remindContract.mutate(id, {
      onSuccess: () => toast.success('Reminder sent', {
        description: 'A follow-up email was sent to the client.',
      }),
      onError: (err: unknown) => {
        toast.error('Reminder failed', { description: (err as { message?: string }).message ?? 'Try again.' });
      },
    });
  };

  const canSend = contract && (contract.status === 'draft' || contract.status === 'sent');
  const canRemind = contract?.status === 'sent' && reminderCooledDown(contract.reminder_sent_at);

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
          ) : contract ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-lg font-semibold">
                  {contract.client_name}
                </h2>
                <ContractStatusBadge status={contract.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-fg">{contract.booking_title}</p>
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canSend && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendContract.isPending}
              className="inline-flex items-center gap-1.5 rounded-input border border-accent/40 bg-accent/8 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/12 disabled:opacity-50"
            >
              <Send className="size-3" />
              {sendContract.isPending ? 'Sending…' : contract?.status === 'sent' ? 'Resend' : 'Send'}
            </button>
          )}
          {canRemind && (
            <button
              type="button"
              onClick={handleRemind}
              disabled={remindContract.isPending}
              className="inline-flex items-center gap-1.5 rounded-input border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-fg transition-colors hover:bg-bg hover:text-fg disabled:opacity-50"
            >
              <Bell className="size-3" />
              {remindContract.isPending ? 'Sending…' : 'Remind'}
            </button>
          )}
          {contract?.status === 'sent' && !canRemind && contract.reminder_sent_at && (
            <span className="flex items-center gap-1 text-xs text-muted-fg/60">
              <Clock className="size-3" />
              Remind in {Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - new Date(contract.reminder_sent_at).getTime())) / 3_600_000)}h
            </span>
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

      {!isLoading && contract && <TabBar active={tab} onSelect={setTab} />}

      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="size-5 animate-spin text-muted-fg/50" />
          </div>
        ) : isError || !contract ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-muted-fg">Couldn't load this contract.</p>
            <button type="button" onClick={() => void refetch()} className="text-sm text-accent underline">
              Retry
            </button>
          </div>
        ) : (
          <>
            {tab === 'contract' && <ContractTab contract={contract} />}
            {tab === 'info' && <InfoTab contract={contract} />}
            {tab === 'notes' && <NotesTab contract={contract} onSave={handleNotesSave} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Exported shell ───────────────────────────────────────────────────────────

export function ContractSlideOver({ id, onClose }: { id: string | null; onClose: () => void }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer.Root open={!!id} onOpenChange={(open) => !open && onClose()} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mb-1 mt-3 h-1 w-10 shrink-0 rounded-full bg-border/70" />
            {id && <ContractSlideOverContent id={id} onClose={onClose} />}
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Contract detail</Dialog.Title>
                <ContractSlideOverContent id={id} onClose={onClose} />
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
