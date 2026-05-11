import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Search, ChevronDown } from 'lucide-react';
import { createBookingSchema, type CreateBookingInput, EVENT_TYPES } from '@/lib/validations/booking.schema';
import { useCreateBooking } from './hooks';
import { useClients } from '../clients/hooks';
import { cn } from '@/lib/utils';
import type { ClientSummary } from '../clients/types';

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls = cn(
  'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

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

// ─── Client combobox ──────────────────────────────────────────────────────────

function ClientCombobox({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useClients({ q: query || undefined, pageSize: 20 });
  const clients = data?.rows ?? [];
  const selected = clients.find((c) => c.id === value) ?? null;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectClient = (c: ClientSummary) => {
    onChange(c.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          inputCls,
          'flex items-center justify-between text-left',
          error && 'border-danger ring-1 ring-danger/30',
        )}
      >
        <span className={selected ? 'text-fg' : 'text-muted-fg/50'}>
          {selected ? `${selected.full_name}${selected.phone ? ` · ${selected.phone}` : ''}` : 'Search clients…'}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-fg/60 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-card border border-border bg-card shadow-elevated"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <Search className="size-3.5 shrink-0 text-muted-fg/60" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-fg/50 focus:outline-none"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {clients.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-muted-fg">
                  No clients found
                </li>
              ) : (
                clients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectClient(c)}
                      className={cn(
                        'w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-bg',
                        c.id === value && 'bg-accent/8 font-medium text-accent',
                      )}
                    >
                      <p>{c.full_name}</p>
                      {c.phone && <p className="text-xs text-muted-fg">{c.phone}</p>}
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

export function NewBookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createBooking = useCreateBooking();
  const [showVenue, setShowVenue] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      advance_amount: 0,
    },
  });

  const onSubmit = async (data: CreateBookingInput) => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    ) as CreateBookingInput;

    try {
      await createBooking.mutateAsync(payload);
      toast.success('Booking created', {
        description: 'Booking added to your pipeline. GST calculated automatically from client state.',
      });
      reset();
      setShowVenue(false);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      const isNotFound = msg.toLowerCase().includes('not found');
      toast.error(isNotFound ? 'Client not found' : 'Failed to create booking', {
        description: isNotFound
          ? 'The selected client no longer exists. Please choose another.'
          : 'Check the form and try again.',
      });
    }
  };

  const close = () => {
    reset();
    setShowVenue(false);
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
                <Dialog.Title className="sr-only">New booking</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New booking</h2>
                  <Dialog.Close aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg">
                    <X className="size-4" />
                  </Dialog.Close>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="space-y-5 px-6 py-5">

                    <Field label="Title" required error={errors.title?.message}
                      hint="E.g. Sharma Wedding, Priya & Rohit Pre-Wedding">
                      <input
                        {...register('title')}
                        type="text"
                        placeholder="Sharma Wedding 2026"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Client" required error={errors.client_id?.message}>
                      <Controller
                        name="client_id"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <ClientCombobox
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.client_id?.message}
                          />
                        )}
                      />
                    </Field>

                    <Field label="Event type" required error={errors.event_type?.message}>
                      <select {...register('event_type')} className={inputCls}>
                        <option value="">Select type…</option>
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Event date" error={errors.event_date?.message}>
                        <input
                          type="datetime-local"
                          {...register('event_date')}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="End date" error={errors.event_end_date?.message}>
                        <input
                          type="datetime-local"
                          {...register('event_end_date')}
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Total amount (₹)" required error={errors.total_amount?.message}>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          {...register('total_amount', { valueAsNumber: true })}
                          placeholder="50000"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Advance (₹)" required error={errors.advance_amount?.message}
                        hint="0 = no advance">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          {...register('advance_amount', { valueAsNumber: true })}
                          placeholder="15000"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Venue — collapsed by default */}
                    <button
                      type="button"
                      onClick={() => setShowVenue((v) => !v)}
                      className="flex w-full items-center justify-between rounded-input border border-border/60 bg-card/60 px-3 py-2 text-sm text-muted-fg transition-colors hover:bg-bg"
                    >
                      <span>Venue details</span>
                      <ChevronDown className={cn('size-4 transition-transform', showVenue && 'rotate-180')} />
                    </button>

                    {showVenue && (
                      <div className="space-y-4 rounded-card border border-border/50 bg-bg/30 p-4">
                        <Field label="Venue name" error={errors.venue_name?.message}>
                          <input {...register('venue_name')} type="text"
                            placeholder="The Leela Palace" className={inputCls} />
                        </Field>
                        <Field label="Address" error={errors.venue_address?.message}>
                          <textarea {...register('venue_address')} rows={2}
                            placeholder="Diplomatic Enclave, Chanakyapuri…"
                            className={cn(inputCls, 'resize-none')} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="City" error={errors.venue_city?.message}>
                            <input {...register('venue_city')} type="text"
                              placeholder="New Delhi" className={inputCls} />
                          </Field>
                          <Field label="State" error={errors.venue_state?.message}>
                            <input {...register('venue_state')} type="text"
                              placeholder="Delhi" className={inputCls} />
                          </Field>
                        </div>
                        <Field label="Pincode" error={errors.venue_pincode?.message}>
                          <input {...register('venue_pincode')} type="text"
                            placeholder="110021" className={cn(inputCls, 'max-w-32')} />
                        </Field>
                      </div>
                    )}

                    <Field label="Notes" error={errors.notes?.message}>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        placeholder="Internal notes — client preferences, special considerations…"
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
                      disabled={isSubmitting || createBooking.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createBooking.isPending ? 'Creating…' : 'Create booking'}
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
