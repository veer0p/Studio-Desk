import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X, Send, RefreshCw, Copy, CheckCircle2, AlertCircle, Clock,
  FileText, IndianRupee, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceStatusBadge, InvoiceTypeBadge } from './components/InvoiceStatusBadge';
import {
  useInvoice,
  useUpdateInvoice,
  useSendInvoice,
  useRecordPayment,
  useCreateCreditNote,
  useGeneratePaymentLink,
} from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime, formatINR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { InvoiceDetail } from './types';
import {
  recordPaymentSchema,
  creditNoteSchema,
  PAYMENT_METHODS,
  type RecordPaymentInput,
  type CreditNoteInput,
} from '@/lib/validations/invoice.schema';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'invoice' | 'info' | 'notes';

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-border">
      {(['invoice', 'info', 'notes'] as Tab[]).map((tab) => (
        <button key={tab} type="button" onClick={() => onSelect(tab)}
          className={cn('px-5 py-3 text-sm font-medium capitalize transition-colors',
            active === tab ? 'border-b-2 border-accent text-accent' : 'text-muted-fg hover:text-fg')}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">{label}</span>
      <div className="text-sm text-fg/90">{children}</div>
    </div>
  );
}

// ─── Record Payment Dialog ────────────────────────────────────────────────────

function RecordPaymentDialog({
  invoiceId,
  amountDue,
  open,
  onClose,
}: {
  invoiceId: string;
  amountDue: number;
  open: boolean;
  onClose: () => void;
}) {
  const recordPayment = useRecordPayment();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: { method: 'upi' },
  });

  const onSubmit = async (data: RecordPaymentInput) => {
    try {
      await recordPayment.mutateAsync({ id: invoiceId, data });
      toast.success('Payment recorded', { description: `${data.method.toUpperCase()} payment of ${formatINR(Number(data.amount))} recorded.` });
      reset();
      onClose();
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const inputCls = 'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div className="fixed inset-0 z-50 bg-fg/30 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">Record payment</Dialog.Title>
                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">Record payment</h2>
                  <Dialog.Close aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
                    <X className="size-4" />
                  </Dialog.Close>
                </header>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-4 px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fg/80">Amount (₹) <span className="text-danger">*</span></label>
                      <input {...register('amount')} type="text" placeholder={String(amountDue)}
                        className={cn(inputCls, errors.amount && 'border-danger')} />
                      {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fg/80">Method <span className="text-danger">*</span></label>
                      <select {...register('method')} className={inputCls}>
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>{m.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fg/80">Reference / UTR</label>
                      <input {...register('reference_number')} type="text" placeholder="UTR123456789"
                        className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-fg/80">Payment date</label>
                        <input {...register('payment_date')} type="date" className={inputCls} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-fg/80">Bank name</label>
                        <input {...register('bank_name')} type="text" placeholder="HDFC" className={inputCls} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button type="button" onClick={onClose}
                      className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm transition-colors hover:bg-bg">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || recordPayment.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50">
                      {isSubmitting || recordPayment.isPending ? 'Recording…' : 'Record payment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ─── Credit Note Dialog ───────────────────────────────────────────────────────

function CreditNoteDialog({
  invoiceId,
  open,
  onClose,
}: {
  invoiceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const createCreditNote = useCreateCreditNote();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreditNoteInput>({
    resolver: zodResolver(creditNoteSchema),
  });

  const onSubmit = async (data: CreditNoteInput) => {
    try {
      await createCreditNote.mutateAsync({ id: invoiceId, data });
      toast.success('Credit note created', { description: 'A credit note invoice has been generated.' });
      reset();
      onClose();
    } catch {
      toast.error('Failed to create credit note');
    }
  };

  const inputCls = 'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div className="fixed inset-0 z-50 bg-fg/30 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">Issue credit note</Dialog.Title>
                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">Issue credit note</h2>
                  <Dialog.Close aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
                    <X className="size-4" />
                  </Dialog.Close>
                </header>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-4 px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fg/80">Credit amount (₹) <span className="text-danger">*</span></label>
                      <input {...register('amount')} type="text" placeholder="5000"
                        className={cn(inputCls, errors.amount && 'border-danger')} />
                      {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fg/80">Reason <span className="text-danger">*</span></label>
                      <textarea {...register('reason')} rows={3}
                        placeholder="Client cancelled second-day coverage — partial refund for undelivered work."
                        className={cn(inputCls, 'resize-none', errors.reason && 'border-danger')} />
                      {errors.reason && <p className="text-xs text-danger">{errors.reason.message}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button type="button" onClick={onClose}
                      className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm transition-colors hover:bg-bg">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || createCreditNote.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50">
                      {isSubmitting || createCreditNote.isPending ? 'Issuing…' : 'Issue credit note'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ─── Invoice tab (line items + GST) ──────────────────────────────────────────

function InvoiceTab({ invoice }: { invoice: InvoiceDetail }) {
  const subtotal = Number(invoice.subtotal);
  const total = Number(invoice.total_amount);
  const cgst = Number(invoice.cgst_amount);
  const sgst = Number(invoice.sgst_amount);
  const igst = Number(invoice.igst_amount);

  return (
    <div className="space-y-5">
      {/* Line items */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
              <th className="pb-2">Item</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {invoice.line_items.map((item) => {
              const lineAmt = Number(item.quantity) * Number(item.unit_price);
              return (
                <tr key={item.id}>
                  <td className="py-2.5 pr-3">
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-xs text-muted-fg/70">{item.description}</p>}
                    {item.hsn_sac_code && (
                      <p className="text-[10px] font-mono text-muted-fg/50">SAC {item.hsn_sac_code}</p>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-muted-fg">{item.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatINR(Number(item.unit_price))}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{formatINR(lineAmt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="rounded-card border border-border/60 bg-bg/40 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-fg">Subtotal</span>
            <span className="tabular-nums">{formatINR(subtotal)}</span>
          </div>
          {invoice.gst_type === 'cgst_sgst' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-fg">CGST ({invoice.cgst_rate}%)</span>
                <span className="tabular-nums">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-fg">SGST ({invoice.sgst_rate}%)</span>
                <span className="tabular-nums">{formatINR(sgst)}</span>
              </div>
            </>
          )}
          {invoice.gst_type === 'igst' && (
            <div className="flex justify-between">
              <span className="text-muted-fg">IGST ({invoice.igst_rate}%)</span>
              <span className="tabular-nums">{formatINR(igst)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatINR(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment status */}
      {invoice.status !== 'draft' && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-fg">Paid</span>
            <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatINR(Number(invoice.amount_paid))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-fg">Due</span>
            <span className={cn('tabular-nums', Number(invoice.amount_due) > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-fg')}>
              {formatINR(Number(invoice.amount_due))}
            </span>
          </div>
        </div>
      )}

      {/* PDF link */}
      {invoice.pdf_url && (
        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-accent hover:underline">
          <FileText className="size-3.5" />
          Download PDF
        </a>
      )}
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({ invoice }: { invoice: InvoiceDetail }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (!invoice.payment_link_url) return;
    void navigator.clipboard.writeText(invoice.payment_link_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <InfoRow label="Client">{invoice.client_name}</InfoRow>
        {invoice.client_phone && <InfoRow label="Phone">{invoice.client_phone}</InfoRow>}
        {invoice.client_email && <InfoRow label="Email">{invoice.client_email}</InfoRow>}
        <InfoRow label="Booking">{invoice.booking_title}</InfoRow>
        {invoice.event_date && <InfoRow label="Event date">{formatDate(invoice.event_date)}</InfoRow>}
        {invoice.due_date && <InfoRow label="Due date">{formatDate(invoice.due_date)}</InfoRow>}
      </div>

      {/* Timeline */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Timeline</p>
        <div className="space-y-2 text-sm">
          {[
            { icon: <CheckCircle2 className="size-3.5 text-emerald-500" />, label: 'Created', date: invoice.created_at },
            { icon: <Send className="size-3.5 text-accent" />, label: 'Sent', date: invoice.sent_at },
            { icon: <Info className="size-3.5 text-blue-500" />, label: 'Viewed', date: invoice.viewed_at },
            { icon: <CheckCircle2 className="size-3.5 text-emerald-600" />, label: 'Paid', date: invoice.paid_at },
          ].map(({ icon, label, date }) =>
            date ? (
              <div key={label} className="flex items-center gap-2">
                {icon}
                <span className="text-muted-fg">{label}</span>
                <span className="ml-auto tabular-nums text-fg/80">{formatDateTime(date)}</span>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Payment link */}
      {invoice.payment_link_url && (
        <div className="rounded-card border border-border/60 bg-bg/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-fg/60">Payment link</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 truncate font-mono text-xs text-fg/80">{invoice.payment_link_url}</p>
            <button type="button" onClick={copyLink}
              className="grid size-7 place-items-center rounded-input border border-border/60 transition-colors hover:bg-bg">
              {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-muted-fg" />}
            </button>
          </div>
        </div>
      )}

      {/* GST info */}
      {invoice.gst_type !== 'exempt' && (
        <InfoRow label="GST type">
          {invoice.gst_type === 'cgst_sgst' ? 'CGST + SGST (intra-state)' : 'IGST (inter-state)'}
        </InfoRow>
      )}
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab({ invoice }: { invoice: InvoiceDetail }) {
  const [notes, setNotes] = useState(invoice.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(invoice.internal_notes ?? '');
  const [saved, setSaved] = useState(false);
  const updateInvoice = useUpdateInvoice();

  const save = async () => {
    try {
      await updateInvoice.mutateAsync({
        id: invoice.id,
        data: {
          notes: notes || undefined,
          internal_notes: internalNotes || undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const textCls = 'w-full rounded-input border border-border bg-bg/60 p-3 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">
          Client-visible notes
        </label>
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, special instructions, thank you note…"
          className={textCls} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-fg/60">
          Internal notes
        </label>
        <textarea rows={3} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Not visible to client — reminders, follow-up notes…"
          className={textCls} />
      </div>
      <div className="flex items-center justify-between">
        {saved && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</p>}
        <button type="button" onClick={() => void save()} disabled={updateInvoice.isPending}
          className="ml-auto min-h-8 rounded-input bg-fg/90 px-4 text-xs font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-40">
          {updateInvoice.isPending ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  );
}

// ─── Slide-over content ───────────────────────────────────────────────────────

function InvoiceSlideOverContent({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('invoice');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [creditNoteOpen, setCreditNoteOpen] = useState(false);
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const sendInvoice = useSendInvoice();
  const generatePaymentLink = useGeneratePaymentLink();

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(id);
      toast.success('Invoice sent', { description: 'Client will receive an email with the payment link.' });
    } catch {
      toast.error('Failed to send invoice');
    }
  };

  const handleGenerateLink = async () => {
    try {
      const result = await generatePaymentLink.mutateAsync(id);
      void navigator.clipboard.writeText(result.payment_link_url);
      toast.success('Payment link copied', { description: 'Razorpay payment link copied to clipboard.' });
    } catch {
      toast.error('Failed to generate payment link');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-border/50" />
        <div className="h-4 w-24 animate-pulse rounded bg-border/30" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-card bg-border/30" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <AlertCircle className="size-6 text-muted-fg" />
        <p className="text-sm text-muted-fg">Couldn't load invoice details.</p>
        <button type="button" onClick={onClose} className="text-sm text-accent hover:underline">Close</button>
      </div>
    );
  }

  const amountDue = Number(invoice.amount_due);
  const canSend = invoice.status === 'draft' || invoice.status === 'sent';
  const canRecordPayment = ['sent', 'partially_paid', 'overdue'].includes(invoice.status);
  const canCreditNote = invoice.status === 'paid';

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-accent">{invoice.invoice_number}</span>
            <InvoiceTypeBadge type={invoice.invoice_type} />
          </div>
          <p className="mt-1 truncate text-sm text-muted-fg">{invoice.client_name} · {invoice.booking_title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.due_date && (
              <span className={cn('flex items-center gap-1 text-xs',
                invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-muted-fg')}>
                <Clock className="size-3" />
                Due {formatDate(invoice.due_date)}
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
          <X className="size-4" />
        </button>
      </div>

      {/* Action bar */}
      {(canSend || canRecordPayment || canCreditNote || invoice.status === 'sent') && (
        <div className="flex flex-wrap gap-2 border-b border-border/60 bg-bg/30 px-6 py-3">
          {canSend && (
            <button type="button" onClick={() => void handleSend()} disabled={sendInvoice.isPending}
              className="flex min-h-8 items-center gap-1.5 rounded-input bg-fg/90 px-3 text-xs font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50">
              <Send className="size-3" />
              {invoice.status === 'draft' ? 'Send' : 'Resend'}
            </button>
          )}
          {canRecordPayment && (
            <button type="button" onClick={() => setPaymentOpen(true)}
              className="flex min-h-8 items-center gap-1.5 rounded-input border border-border/70 bg-card px-3 text-xs font-medium transition-colors hover:bg-bg">
              <IndianRupee className="size-3" />
              Record payment
            </button>
          )}
          {invoice.status === 'sent' && !invoice.payment_link_url && (
            <button type="button" onClick={() => void handleGenerateLink()} disabled={generatePaymentLink.isPending}
              className="flex min-h-8 items-center gap-1.5 rounded-input border border-border/70 bg-card px-3 text-xs font-medium transition-colors hover:bg-bg disabled:opacity-50">
              <RefreshCw className={cn('size-3', generatePaymentLink.isPending && 'animate-spin')} />
              Razorpay link
            </button>
          )}
          {canCreditNote && (
            <button type="button" onClick={() => setCreditNoteOpen(true)}
              className="flex min-h-8 items-center gap-1.5 rounded-input border border-border/70 bg-card px-3 text-xs font-medium text-muted-fg transition-colors hover:bg-bg hover:text-fg">
              <FileText className="size-3" />
              Credit note
            </button>
          )}
        </div>
      )}

      <TabBar active={tab} onSelect={setTab} />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === 'invoice' && <InvoiceTab invoice={invoice} />}
        {tab === 'info' && <InfoTab invoice={invoice} />}
        {tab === 'notes' && <NotesTab invoice={invoice} />}
      </div>

      <RecordPaymentDialog
        invoiceId={id}
        amountDue={amountDue}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
      <CreditNoteDialog
        invoiceId={id}
        open={creditNoteOpen}
        onClose={() => setCreditNoteOpen(false)}
      />
    </>
  );
}

// ─── Shell: desktop Dialog / mobile Drawer ────────────────────────────────────

export function InvoiceSlideOver({ id, onClose }: { id: string | null; onClose: () => void }) {
  const isMobile = useIsMobile();
  const open = !!id;

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-border/60" />
            {id && <InvoiceSlideOverContent id={id} onClose={onClose} />}
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
              <motion.div className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.aside
                className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-border bg-card shadow-elevated"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Invoice details</Dialog.Title>
                {id && <InvoiceSlideOverContent id={id} onClose={onClose} />}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
