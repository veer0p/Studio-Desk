import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import {
  createInvoiceSchema,
  INVOICE_TYPES,
  GST_TYPES,
  type CreateInvoiceInput,
} from '@/lib/validations/invoice.schema';
import { useCreateInvoice } from './hooks';
import { useBookings } from '../bookings/hooks';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/formatters';
import type { BookingSummary } from '../bookings/types';

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls = cn(
  'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

function Field({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg/80">
        {label}{required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-fg/60">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// ─── Booking combobox ─────────────────────────────────────────────────────────

function BookingCombobox({ value, onChange, error }: {
  value: string; onChange: (id: string) => void; error?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useBookings({ search: query || undefined, pageSize: 20 });
  const bookings = data?.data ?? [];
  const selected = bookings.find((b) => b.id === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (b: BookingSummary) => { onChange(b.id); setQuery(''); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className={cn(inputCls, 'flex items-center justify-between text-left', error && 'border-danger ring-1 ring-danger/30')}>
        <span className={selected ? 'text-fg' : 'text-muted-fg/50'}>
          {selected
            ? `${selected.title} · ${selected.client_name ?? ''}`
            : 'Search bookings…'}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-fg/60 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-card border border-border bg-card shadow-elevated"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <Search className="size-3.5 shrink-0 text-muted-fg/60" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or client…"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-fg/50 focus:outline-none" />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {bookings.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-muted-fg">No bookings found</li>
              ) : (
                bookings.map((b) => (
                  <li key={b.id}>
                    <button type="button" onClick={() => select(b)}
                      className={cn('w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-bg',
                        b.id === value && 'bg-accent/8 font-medium text-accent')}>
                      <p>{b.title}</p>
                      <p className="text-xs text-muted-fg">{b.client_name} · {formatINR(b.total_amount)}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function NewInvoiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createInvoice = useCreateInvoice();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoice_type: 'full',
      line_items: [{ sort_order: 0, name: '', unit_price: '', quantity: '1', hsn_sac_code: '998389' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });
  const watchedItems = useWatch({ control, name: 'line_items' });

  // Live subtotal
  const subtotal = (watchedItems ?? []).reduce((acc, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unit_price ?? 0);
    return acc + (isFinite(qty) && isFinite(price) ? qty * price : 0);
  }, 0);

  const onSubmit = async (data: CreateInvoiceInput) => {
    const payload: CreateInvoiceInput = {
      ...data,
      line_items: data.line_items.map((li, i) => ({
        ...li,
        sort_order: i,
        hsn_sac_code: li.hsn_sac_code || '998389',
        quantity: li.quantity || '1',
      })),
    };

    try {
      await createInvoice.mutateAsync(payload);
      toast.success('Invoice created', {
        description: 'GST calculated from client state. Send it when ready.',
      });
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      toast.error(msg.toLowerCase().includes('booking') ? 'Booking not found' : 'Failed to create invoice', {
        description: msg.toLowerCase().includes('booking')
          ? 'The selected booking no longer exists.'
          : 'Check the form and try again.',
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
              <motion.div className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-40 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">New invoice</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New invoice</h2>
                  <Dialog.Close aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
                    <X className="size-4" />
                  </Dialog.Close>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-5 px-6 py-5">
                    {/* Row 1: Booking + type */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <Field label="Booking" required error={errors.booking_id?.message}>
                          <Controller
                            name="booking_id"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <BookingCombobox
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.booking_id?.message}
                              />
                            )}
                          />
                        </Field>
                      </div>
                      <Field label="Invoice type" required error={errors.invoice_type?.message}>
                        <select {...register('invoice_type')} className={inputCls}>
                          {INVOICE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {/* Row 2: GST type + due date */}
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="GST type" error={errors.gst_type?.message} hint="Auto-detected from client state if blank">
                        <select {...register('gst_type')} className={inputCls}>
                          <option value="">Auto-detect</option>
                          {GST_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t === 'cgst_sgst' ? 'CGST + SGST' : t === 'igst' ? 'IGST' : 'Exempt'}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Due date" error={errors.due_date?.message}>
                        <input type="date" {...register('due_date')} className={inputCls} />
                      </Field>
                    </div>

                    {/* Line items */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-fg/80">
                          Line items <span className="text-danger">*</span>
                        </p>
                        {subtotal > 0 && (
                          <p className="text-xs font-medium tabular-nums text-muted-fg">
                            Subtotal {formatINR(subtotal)}
                          </p>
                        )}
                      </div>

                      {errors.line_items?.root && (
                        <p className="mb-2 text-xs text-danger">{errors.line_items.root.message}</p>
                      )}
                      {typeof errors.line_items?.message === 'string' && (
                        <p className="mb-2 text-xs text-danger">{errors.line_items.message}</p>
                      )}

                      <div className="space-y-3">
                        {fields.map((field, idx) => {
                          const lineAmt =
                            Number(watchedItems?.[idx]?.quantity ?? 0) *
                            Number(watchedItems?.[idx]?.unit_price ?? 0);

                          return (
                            <div key={field.id} className="rounded-card border border-border/60 bg-bg/30 p-3">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_80px_100px_auto]">
                                <div className="flex flex-col gap-1">
                                  <input
                                    {...register(`line_items.${idx}.name`)}
                                    placeholder="Photography service"
                                    className={cn(inputCls, errors.line_items?.[idx]?.name && 'border-danger')}
                                  />
                                  {errors.line_items?.[idx]?.name && (
                                    <p className="text-xs text-danger">{errors.line_items[idx]?.name?.message}</p>
                                  )}
                                </div>
                                <input
                                  {...register(`line_items.${idx}.quantity`)}
                                  placeholder="1"
                                  className={inputCls}
                                />
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-fg">₹</span>
                                  <input
                                    {...register(`line_items.${idx}.unit_price`)}
                                    placeholder="25000"
                                    className={cn(inputCls, 'pl-7', errors.line_items?.[idx]?.unit_price && 'border-danger')}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => fields.length > 1 && remove(idx)}
                                  disabled={fields.length === 1}
                                  className="grid size-10 place-items-center rounded-input text-muted-fg/60 transition-colors hover:bg-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                              {lineAmt > 0 && (
                                <p className="mt-1.5 text-right text-xs tabular-nums text-muted-fg">
                                  {formatINR(lineAmt)}
                                </p>
                              )}
                              {/* HSN/SAC */}
                              <div className="mt-2">
                                <input
                                  {...register(`line_items.${idx}.hsn_sac_code`)}
                                  placeholder="SAC code (default 998389)"
                                  className={cn(inputCls, 'font-mono text-xs')}
                                />
                              </div>
                              {/* Optional description */}
                              <div className="mt-2">
                                <input
                                  {...register(`line_items.${idx}.description`)}
                                  placeholder="Optional description…"
                                  className={cn(inputCls, 'text-xs')}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {fields.length < 20 && (
                        <button
                          type="button"
                          onClick={() =>
                            append({ sort_order: fields.length, name: '', unit_price: '', quantity: '1', hsn_sac_code: '998389' })
                          }
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-input border border-dashed border-border/70 py-2.5 text-sm text-muted-fg transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          <Plus className="size-3.5" />
                          Add item
                        </button>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Client notes" error={errors.notes?.message}
                        hint="Visible on the invoice">
                        <textarea {...register('notes')} rows={3}
                          placeholder="Payment terms, thank you note…"
                          className={cn(inputCls, 'resize-none')} />
                      </Field>
                      <Field label="Internal notes" error={errors.internal_notes?.message}
                        hint="Not shown to client">
                        <textarea {...register('internal_notes')} rows={3}
                          placeholder="Follow-up reminders…"
                          className={cn(inputCls, 'resize-none')} />
                      </Field>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button type="button" onClick={close}
                      className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm transition-colors hover:bg-bg">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || createInvoice.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createInvoice.isPending ? 'Creating…' : 'Create invoice'}
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
