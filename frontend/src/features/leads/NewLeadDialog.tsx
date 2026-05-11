import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { createLeadSchema, type CreateLeadInput } from '@/lib/validations/lead.schema';
import { useCreateLead } from './hooks';
import {
  EVENT_TYPES,
  EVENT_TYPE_LABEL,
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABEL,
} from '@/lib/constants/enums';
import { cn } from '@/lib/utils';

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg/80">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls = cn(
  'min-h-10 w-full rounded-input border border-border bg-bg/60 px-3 py-2 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      source: 'phone',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CreateLeadInput) => {
    // Strip empty optional strings
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    ) as CreateLeadInput;

    try {
      await createLead.mutateAsync(payload);
      toast.success('Lead added', { description: `${data.full_name} is now in your pipeline.` });
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add lead', {
        description: 'Check your connection and try again.',
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
                className="fixed left-1/2 top-1/2 z-40 w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">New lead</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New lead</h2>
                  <Dialog.Close
                    aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                    {/* Full name */}
                    <div className="sm:col-span-2">
                      <Field label="Full name" required error={errors.full_name?.message}>
                        <input
                          {...register('full_name')}
                          type="text"
                          placeholder="Priya Sharma"
                          autoComplete="name"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Phone */}
                    <Field label="Phone" required error={errors.phone?.message}>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="9876543210"
                        autoComplete="tel"
                        className={inputCls}
                      />
                    </Field>

                    {/* WhatsApp */}
                    <Field label="WhatsApp" error={errors.whatsapp?.message}>
                      <input
                        {...register('whatsapp')}
                        type="tel"
                        placeholder="Same as phone"
                        className={inputCls}
                      />
                    </Field>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <Field label="Email" error={errors.email?.message}>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="priya@example.com"
                          autoComplete="email"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Event type */}
                    <Field label="Event type" error={errors.event_type?.message}>
                      <select {...register('event_type')} className={inputCls}>
                        <option value="">Select…</option>
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {EVENT_TYPE_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Approx date */}
                    <Field label="Approx. event date" error={errors.event_date_approx?.message}>
                      <input
                        {...register('event_date_approx')}
                        type="date"
                        className={inputCls}
                      />
                    </Field>

                    {/* Venue */}
                    <div className="sm:col-span-2">
                      <Field label="Venue" error={errors.venue?.message}>
                        <input
                          {...register('venue')}
                          type="text"
                          placeholder="Taj Mahal Palace, Mumbai"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Budget min */}
                    <Field label="Budget min (₹)" error={errors.budget_min?.message}>
                      <input
                        {...register('budget_min')}
                        type="text"
                        inputMode="numeric"
                        placeholder="50000"
                        className={inputCls}
                      />
                    </Field>

                    {/* Budget max */}
                    <Field label="Budget max (₹)" error={errors.budget_max?.message}>
                      <input
                        {...register('budget_max')}
                        type="text"
                        inputMode="numeric"
                        placeholder="100000"
                        className={inputCls}
                      />
                    </Field>

                    {/* Source */}
                    <Field label="Source" error={errors.source?.message}>
                      <select {...register('source')} className={inputCls}>
                        {LEAD_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {LEAD_SOURCE_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Priority */}
                    <Field label="Priority" error={errors.priority?.message}>
                      <select {...register('priority')} className={inputCls}>
                        {LEAD_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {LEAD_PRIORITY_LABEL[p]}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <Field label="Notes" error={errors.notes?.message}>
                        <textarea
                          {...register('notes')}
                          rows={3}
                          placeholder="Anything important about this lead…"
                          className={cn(inputCls, 'resize-none')}
                        />
                      </Field>
                    </div>
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
                      disabled={isSubmitting || createLead.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createLead.isPending ? 'Adding…' : 'Add lead'}
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
