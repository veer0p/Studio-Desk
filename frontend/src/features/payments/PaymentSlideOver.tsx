import * as Dialog from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { PaymentStatusBadge, PaymentMethodBadge } from './components/PaymentBadges';
import { usePayment } from './hooks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { formatDate, formatDateTime, formatINR } from '@/lib/formatters';

// ─── Info rows ────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">{label}</span>
      <div className="text-sm text-fg/90">{children}</div>
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PaymentSlideOverContent({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: payment, isLoading, isError } = usePayment(id);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-border/50" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-card bg-border/30" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <AlertCircle className="size-6 text-muted-fg" />
        <p className="text-sm text-muted-fg">Couldn't load payment details.</p>
        <button type="button" onClick={onClose} className="text-sm text-accent hover:underline">Close</button>
      </div>
    );
  }

  const isRazorpay = Boolean(payment.razorpay_payment_id);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold tabular-nums">
            {formatINR(Number(payment.amount))}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            <PaymentMethodBadge method={payment.method} />
            {isRazorpay && (
              <span className="rounded-pill border border-violet-300/40 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                Razorpay
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

        {/* Status banner for failed payments */}
        {payment.status === 'failed' && payment.failure_reason && (
          <div className="flex items-start gap-2.5 rounded-card border border-red-200/60 bg-red-50/60 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/10">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Payment failed</p>
              <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">{payment.failure_reason}</p>
            </div>
          </div>
        )}

        {/* Refunded banner */}
        {payment.status === 'refunded' && (
          <div className="flex items-start gap-2.5 rounded-card border border-amber-200/60 bg-amber-50/60 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-400">This payment has been refunded.</p>
          </div>
        )}

        {/* Payment details */}
        <div className="space-y-4">
          {payment.booking_title && (
            <InfoRow label="Booking">{payment.booking_title}</InfoRow>
          )}
          {payment.invoice_number && (
            <InfoRow label="Invoice">
              <span className="font-mono text-accent">{payment.invoice_number}</span>
            </InfoRow>
          )}
          <InfoRow label="Amount">
            <span className="text-base font-semibold tabular-nums">{formatINR(Number(payment.amount))}</span>
            {payment.currency && payment.currency !== 'INR' && (
              <span className="ml-1 text-xs text-muted-fg">{payment.currency}</span>
            )}
          </InfoRow>
          <InfoRow label="Method">
            <PaymentMethodBadge method={payment.method} />
          </InfoRow>

          {payment.payment_date && (
            <InfoRow label="Payment date">{formatDate(payment.payment_date)}</InfoRow>
          )}
          {payment.bank_name && (
            <InfoRow label="Bank">{payment.bank_name}</InfoRow>
          )}
          {payment.reference_number && (
            <InfoRow label="Reference / UTR">
              <span className="font-mono text-sm">{payment.reference_number}</span>
            </InfoRow>
          )}
          {payment.notes && (
            <InfoRow label="Notes">{payment.notes}</InfoRow>
          )}
        </div>

        {/* Razorpay details */}
        {isRazorpay && (
          <div className="rounded-card border border-border/60 bg-bg/30 p-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">
              Razorpay
            </p>
            <div className="space-y-2.5">
              {payment.razorpay_payment_id && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-fg/60">Payment ID</span>
                  <span className="break-all font-mono text-xs">{payment.razorpay_payment_id}</span>
                </div>
              )}
              {payment.razorpay_order_id && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-fg/60">Order ID</span>
                  <span className="break-all font-mono text-xs">{payment.razorpay_order_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-fg/60">Timeline</p>
          <div className="space-y-2 text-sm">
            {[
              { icon: <Clock className="size-3.5 text-muted-fg/60" />, label: 'Initiated', date: payment.created_at },
              { icon: <CheckCircle2 className="size-3.5 text-emerald-500" />, label: 'Captured', date: payment.captured_at },
              { icon: <AlertCircle className="size-3.5 text-red-500" />, label: 'Failed', date: payment.failed_at },
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

        <InfoRow label="Internal ID">
          <span className="break-all font-mono text-xs text-muted-fg/60">{payment.id}</span>
        </InfoRow>
      </div>
    </>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function PaymentSlideOver({ id, onClose }: { id: string | null; onClose: () => void }) {
  const isMobile = useIsMobile();
  const open = !!id;

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-border bg-card">
            <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-border/60" />
            {id && <PaymentSlideOverContent id={id} onClose={onClose} />}
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
                className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-card shadow-elevated"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <Dialog.Title className="sr-only">Payment details</Dialog.Title>
                {id && <PaymentSlideOverContent id={id} onClose={onClose} />}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
