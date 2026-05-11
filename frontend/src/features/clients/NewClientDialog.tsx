import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { createClientSchema, type CreateClientInput } from '@/lib/validations/client.schema';
import { useCreateClient } from './hooks';
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

export function NewClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
  });

  const onSubmit = async (data: CreateClientInput) => {
    // Strip empty optional strings
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    ) as CreateClientInput;

    try {
      await createClient.mutateAsync(payload);
      toast.success('Client added', {
        description: `${data.full_name} is now in your client list.`,
      });
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      // 409 = phone number already exists
      const status = (err as { status?: number }).status;
      if (status === 409) {
        setError('phone', {
          message: 'This phone number belongs to an existing client.',
        });
        return;
      }
      toast.error('Failed to add client', {
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
                className="fixed left-1/2 top-1/2 z-40 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-elevated"
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Dialog.Title className="sr-only">New client</Dialog.Title>

                <header className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-base font-semibold">New client</h2>
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

                    {/* Company */}
                    <div className="sm:col-span-2">
                      <Field label="Company name" error={errors.company_name?.message}>
                        <input
                          {...register('company_name')}
                          type="text"
                          placeholder="Sharma & Sons Events"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* GSTIN */}
                    <div className="sm:col-span-2">
                      <Field label="GSTIN" error={errors.gstin?.message}>
                        <input
                          {...register('gstin')}
                          type="text"
                          placeholder="24AAACA0000A1Z5"
                          className={cn(inputCls, 'font-mono tracking-wider')}
                          style={{ textTransform: 'uppercase' }}
                        />
                      </Field>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <Field label="Address" error={errors.address?.message}>
                        <input
                          {...register('address')}
                          type="text"
                          placeholder="123 MG Road, Bandra"
                          autoComplete="street-address"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* City */}
                    <Field label="City" error={errors.city?.message}>
                      <input
                        {...register('city')}
                        type="text"
                        placeholder="Mumbai"
                        autoComplete="address-level2"
                        className={inputCls}
                      />
                    </Field>

                    {/* State */}
                    <Field label="State" error={errors.state?.message}>
                      <input
                        {...register('state')}
                        type="text"
                        placeholder="Maharashtra"
                        autoComplete="address-level1"
                        className={inputCls}
                      />
                    </Field>

                    {/* Pincode */}
                    <Field label="Pincode" error={errors.pincode?.message}>
                      <input
                        {...register('pincode')}
                        type="text"
                        inputMode="numeric"
                        placeholder="400001"
                        autoComplete="postal-code"
                        className={inputCls}
                      />
                    </Field>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <Field label="Notes" error={errors.notes?.message}>
                        <textarea
                          {...register('notes')}
                          rows={3}
                          placeholder="Anything important about this client…"
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
                      disabled={isSubmitting || createClient.isPending}
                      className="min-h-9 rounded-input bg-fg/90 px-4 text-sm font-medium text-bg shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting || createClient.isPending ? 'Adding…' : 'Add client'}
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
