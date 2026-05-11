import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Search, ChevronDown } from 'lucide-react';
import { createGallerySchema, type CreateGalleryInput } from '@/lib/validations/gallery.schema';
import { useCreateGallery } from './hooks';
import { useBookings } from '../bookings/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import type { BookingSummary } from '../bookings/types';

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
  const [selectedLabel, setSelectedLabel] = useState<BookingSummary | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const display = selected ?? selectedLabel;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          inputCls,
          'flex items-center gap-2 text-left',
          error && 'border-danger focus:ring-danger/40',
        )}
      >
        {display ? (
          <span className="flex-1 truncate">
            {display.title}
            <span className="ml-1.5 text-xs text-muted-fg">
              · {(display as BookingSummary & { client_name?: string }).client_name ?? ''}
              {display.event_date ? ` · ${formatDate(display.event_date)}` : ''}
            </span>
          </span>
        ) : (
          <span className="flex-1 text-muted-fg/50">Search bookings…</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-muted-fg/60" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-card border border-border bg-card shadow-elevated">
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-fg" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-fg/50 focus:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {bookings.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-fg">No bookings found</p>
            ) : (
              bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onChange(b.id);
                    setSelectedLabel(b);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'w-full rounded-input px-3 py-2 text-left text-sm transition-colors hover:bg-accent/8',
                    b.id === value && 'bg-accent/8 font-medium',
                  )}
                >
                  <p className="font-medium text-fg">{b.title}</p>
                  <p className="text-xs text-muted-fg">
                    {(b as BookingSummary & { client_name?: string }).client_name ?? ''}
                    {b.event_date ? ` · ${formatDate(b.event_date)}` : ''}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

export function NewGalleryDialog({ open, onOpenChange, onCreated }: Props) {
  const create = useCreateGallery();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGalleryInput>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: { booking_id: '', name: undefined },
  });

  const onClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CreateGalleryInput) => {
    try {
      const payload: CreateGalleryInput = { booking_id: data.booking_id };
      if (data.name?.trim()) payload.name = data.name.trim();
      const gallery = await create.mutateAsync(payload);
      toast.success('Gallery created');
      onClose();
      onCreated?.(gallery.id);
    } catch {
      toast.error('Failed to create gallery');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="overflow-hidden rounded-card border border-border/70 bg-card shadow-elevated">
                  <Dialog.Title className="sr-only">New Gallery</Dialog.Title>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                    <h2 className="font-display text-base font-semibold text-fg">New gallery</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="grid size-7 place-items-center rounded-input text-muted-fg hover:bg-bg hover:text-fg transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-5 px-6 py-5">
                      <Field label="Booking" required error={errors.booking_id?.message}>
                        <Controller
                          name="booking_id"
                          control={control}
                          render={({ field }) => (
                            <BookingCombobox
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.booking_id?.message}
                            />
                          )}
                        />
                      </Field>

                      <Field
                        label="Gallery name"
                        hint="Leave blank to use the booking title (e.g. 'Priya & Rahul Wedding Gallery')"
                        error={errors.name?.message}
                      >
                        <input
                          {...register('name')}
                          placeholder="Priya & Rahul Wedding Gallery"
                          className={cn(inputCls, errors.name && 'border-danger focus:ring-danger/40')}
                        />
                      </Field>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-bg/40 px-6 py-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="min-h-9 rounded-input border border-border/70 bg-card px-4 text-sm text-muted-fg transition-colors hover:bg-bg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-h-9 rounded-input bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Creating…' : 'Create gallery'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
