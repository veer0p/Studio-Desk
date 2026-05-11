import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { createProposalSchema, type CreateProposalInput } from '@/lib/validations/proposal.schema';
import { useCreateProposal } from './hooks';
import { formatINR } from '@/lib/formatters';
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

const GST_LABELS = {
  none: 'No GST',
  cgst_sgst: 'CGST + SGST (18% intra-state)',
  igst: 'IGST (18% inter-state)',
};

export function NewProposalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createProposal = useCreateProposal();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      gst_type: 'cgst_sgst',
      line_items: [{ name: '', quantity: 1, unit_price: 0, item_type: 'service' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });

  const watchedItems = useWatch({ control, name: 'line_items' }) ?? [];
  const watchedGst = useWatch({ control, name: 'gst_type' }) ?? 'cgst_sgst';

  const subtotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unit_price ?? 0);
    return acc + (isFinite(qty) && isFinite(price) ? qty * price : 0);
  }, 0);
  const gstAmount = watchedGst === 'none' ? 0 : subtotal * 0.18;
  const total = subtotal + gstAmount;

  const onSubmit = async (data: CreateProposalInput) => {
    try {
      await createProposal.mutateAsync(data);
      toast.success('Proposal created', {
        description: `Draft proposal for ${data.client_id.slice(0, 8)}… ready to send.`,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create proposal', {
        description: 'Check the booking/client IDs and try again.',
      });
    }
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && close()}>
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
              <motion.div
                className="fixed left-1/2 top-1/2 z-40 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">New proposal</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New proposal</h2>
                  <Dialog.Close
                    aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-6 px-6 py-5">
                    {/* Booking & client IDs (temp until Sprint 6 combobox) */}
                    <div className="rounded-card border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                      <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        Booking and client UUIDs are required. A picker will replace these fields in Sprint 6.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Booking ID"
                        required
                        error={errors.booking_id?.message}
                        hint="UUID from an existing booking"
                      >
                        <input
                          {...register('booking_id')}
                          type="text"
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className={cn(inputCls, 'font-mono text-xs')}
                        />
                      </Field>

                      <Field
                        label="Client ID"
                        required
                        error={errors.client_id?.message}
                        hint="UUID from the client record"
                      >
                        <input
                          {...register('client_id')}
                          type="text"
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className={cn(inputCls, 'font-mono text-xs')}
                        />
                      </Field>

                      <Field label="GST type" required error={errors.gst_type?.message}>
                        <select {...register('gst_type')} className={inputCls}>
                          {Object.entries(GST_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Valid until" error={errors.valid_until?.message}>
                        <input
                          {...register('valid_until')}
                          type="date"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Line items */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-fg/80">
                          Line items <span className="text-danger">*</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            append({ name: '', quantity: 1, unit_price: 0, item_type: 'service' })
                          }
                          className="inline-flex items-center gap-1 rounded-input border border-border/70 bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-bg"
                        >
                          <Plus className="size-3" />
                          Add item
                        </button>
                      </div>

                      {errors.line_items?.root?.message && (
                        <p className="mb-2 text-xs text-danger">
                          {errors.line_items.root.message}
                        </p>
                      )}

                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="rounded-card border border-border bg-bg/50 p-3"
                          >
                            <div className="grid gap-3 sm:grid-cols-[1fr_80px_100px_auto]">
                              <div>
                                <input
                                  {...register(`line_items.${index}.name`)}
                                  type="text"
                                  placeholder="Item name"
                                  className={inputCls}
                                />
                                {errors.line_items?.[index]?.name && (
                                  <p className="mt-0.5 text-xs text-danger">
                                    {errors.line_items[index].name?.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <input
                                  {...register(`line_items.${index}.quantity`)}
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  placeholder="Qty"
                                  className={inputCls}
                                />
                                {errors.line_items?.[index]?.quantity && (
                                  <p className="mt-0.5 text-xs text-danger">
                                    {errors.line_items[index].quantity?.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <input
                                  {...register(`line_items.${index}.unit_price`)}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Unit ₹"
                                  className={inputCls}
                                />
                                {errors.line_items?.[index]?.unit_price && (
                                  <p className="mt-0.5 text-xs text-danger">
                                    {errors.line_items[index].unit_price?.message}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                aria-label="Remove item"
                                className="self-start rounded-input p-2 text-muted-fg/60 transition-colors hover:bg-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                            {/* Optional description & HSN */}
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <input
                                {...register(`line_items.${index}.description`)}
                                type="text"
                                placeholder="Description (optional)"
                                className={cn(inputCls, 'text-xs')}
                              />
                              <input
                                {...register(`line_items.${index}.hsn_sac_code`)}
                                type="text"
                                placeholder="HSN/SAC code (optional)"
                                className={cn(inputCls, 'font-mono text-xs')}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live total */}
                    <div className="rounded-card border border-border bg-bg/50 px-4 py-3 text-sm">
                      <div className="flex justify-between text-muted-fg">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{formatINR(subtotal)}</span>
                      </div>
                      {watchedGst !== 'none' && (
                        <div className="flex justify-between text-muted-fg">
                          <span>GST (18%)</span>
                          <span className="tabular-nums">{formatINR(gstAmount)}</span>
                        </div>
                      )}
                      <div className="mt-2 flex justify-between border-t border-border/60 pt-2 font-semibold text-fg">
                        <span>Total</span>
                        <span className="tabular-nums">{formatINR(total)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <Field label="Notes" error={errors.notes?.message}>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        placeholder="Any notes or terms to include with this proposal…"
                        className={cn(inputCls, 'resize-none')}
                      />
                    </Field>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button
                      type="button"
                      onClick={close}
                      className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm transition-colors hover:bg-bg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || createProposal.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createProposal.isPending ? 'Creating…' : 'Create proposal'}
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
