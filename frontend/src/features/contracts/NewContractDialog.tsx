import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Info } from 'lucide-react';
import { createContractSchema, type CreateContractInput } from '@/lib/validations/contract.schema';
import { useCreateContract } from './hooks';
import { cn } from '@/lib/utils';

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg/80">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-fg/60">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls = cn(
  'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function NewContractDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createContract = useCreateContract();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
  });

  const onSubmit = async (data: CreateContractInput) => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    ) as CreateContractInput;

    try {
      await createContract.mutateAsync(payload);
      toast.success('Contract created', {
        description: 'Draft contract generated from your booking template. Review and send when ready.',
      });
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message;
      const is422 = msg?.includes('No contract template');
      toast.error(is422 ? 'No template found' : 'Failed to create contract', {
        description: is422
          ? 'Create a contract template in Settings before generating contracts.'
          : 'Check the booking ID and try again.',
      });
    }
  };

  const close = () => { reset(); onOpenChange(false); };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && close()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-40 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">New contract</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New contract</h2>
                  <Dialog.Close aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
                    <X className="size-4" />
                  </Dialog.Close>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-5 px-6 py-5">
                    {/* Warning banner — same as proposals */}
                    <div className="rounded-card border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                      <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        A booking picker replaces this UUID field in Sprint 6. The template is auto-selected by event type — leave blank to use the default.
                      </p>
                    </div>

                    <Field
                      label="Booking ID"
                      required
                      error={errors.booking_id?.message}
                      hint="UUID of the booking this contract covers"
                    >
                      <input
                        {...register('booking_id')}
                        type="text"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className={cn(inputCls, 'font-mono text-xs')}
                      />
                    </Field>

                    <Field
                      label="Template ID"
                      error={errors.template_id?.message}
                      hint="Leave blank to auto-select template by event type"
                    >
                      <input
                        {...register('template_id')}
                        type="text"
                        placeholder="Optional — xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className={cn(inputCls, 'font-mono text-xs')}
                      />
                    </Field>

                    <Field label="Notes" error={errors.notes?.message}>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        placeholder="Internal notes (not shown to client)…"
                        className={cn(inputCls, 'resize-none')}
                      />
                    </Field>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button type="button" onClick={close}
                      className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm transition-colors hover:bg-bg">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || createContract.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createContract.isPending ? 'Creating…' : 'Create contract'}
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
