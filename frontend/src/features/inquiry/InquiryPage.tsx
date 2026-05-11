import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { AuroraHero } from '@/components/motion/AuroraHero';
import { GlassCard } from '@/components/motion/GlassCard';
import { inquiryFormSchema, type InquiryFormInput } from '@/lib/validations/inquiry.schema';
import { submitInquiry } from '@/lib/api/endpoints/inquiry';
import { EVENT_TYPES, EVENT_TYPE_LABEL } from '@/lib/constants/enums';
import { cn } from '@/lib/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg/90">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-fg">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls = cn(
  'min-h-12 w-full rounded-xl border border-border/70 bg-bg/70 px-4 py-3 text-sm text-fg',
  'placeholder:text-muted-fg/50 backdrop-blur-sm',
  'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/60',
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
);

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessCard({
  studioName,
  onReset,
}: {
  studioName: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <GlassCard className="flex flex-col items-center gap-5 px-8 py-12 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="size-7" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">We've got it!</h2>
          <p className="mt-2 text-sm text-muted-fg">
            {studioName} will review your inquiry and reply within 24 hours. Keep an eye on your
            phone and email.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 text-sm text-accent underline underline-offset-4 hover:opacity-80"
        >
          Submit another inquiry
        </button>
      </GlassCard>
    </motion.div>
  );
}

// ─── Studio not found ─────────────────────────────────────────────────────────

function StudioNotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <AuroraHero className="flex min-h-screen items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Studio not found</h1>
          <p className="mt-3 text-muted-fg">
            The link you followed doesn't point to an active studio.
          </p>
        </div>
      </AuroraHero>
    </div>
  );
}

// ─── Inquiry form ─────────────────────────────────────────────────────────────

function InquiryForm({
  studioSlug,
  onSuccess,
}: {
  studioSlug: string;
  onSuccess: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormInput>({
    resolver: zodResolver(inquiryFormSchema),
  });

  const onSubmit = async (data: InquiryFormInput) => {
    setSubmitError(null);
    try {
      await submitInquiry(studioSlug, data);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 429) {
        setSubmitError(
          "You've submitted 5 times from this device in the past hour. Please try again later.",
        );
      } else if (e.status === 404) {
        setSubmitError("This studio's page isn't available right now. Please try a direct contact.");
      } else {
        setSubmitError(
          e.message ?? 'Something went wrong. Please try again in a moment.',
        );
      }
    }
  };

  return (
    <GlassCard className="p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold">Enquiry form</h2>
      <p className="mt-0.5 text-sm text-muted-fg">
        Required fields marked <span className="text-danger" aria-hidden>*</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        {/* Full name */}
        <Field label="Your name" required error={errors.full_name?.message}>
          <input
            {...register('full_name')}
            type="text"
            placeholder="Priya Sharma"
            autoComplete="name"
            className={inputCls}
          />
        </Field>

        {/* Phone */}
        <Field
          label="Mobile number"
          required
          error={errors.phone?.message}
          hint="10-digit Indian mobile (e.g. 9876543210)"
        >
          <input
            {...register('phone')}
            type="tel"
            placeholder="9876543210"
            autoComplete="tel"
            inputMode="numeric"
            className={inputCls}
          />
        </Field>

        {/* Email */}
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="priya@example.com"
            autoComplete="email"
            className={inputCls}
          />
        </Field>

        {/* Event type */}
        <Field label="Event type" error={errors.event_type?.message}>
          <select {...register('event_type')} className={inputCls}>
            <option value="">Select your event…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        {/* Event date */}
        <Field label="Event date (approximate)" error={errors.event_date?.message}>
          <input
            {...register('event_date')}
            type="date"
            className={inputCls}
          />
        </Field>

        {/* Venue */}
        <Field label="Venue or location" error={errors.venue?.message}>
          <input
            {...register('venue')}
            type="text"
            placeholder="Taj Mahal Palace, Mumbai"
            className={inputCls}
          />
        </Field>

        {/* Budget min / max */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Budget from (₹)" error={errors.budget_min?.message}>
            <input
              {...register('budget_min')}
              type="text"
              inputMode="numeric"
              placeholder="50000"
              className={inputCls}
            />
          </Field>
          <Field label="Budget up to (₹)" error={errors.budget_max?.message}>
            <input
              {...register('budget_max')}
              type="text"
              inputMode="numeric"
              placeholder="100000"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Guest count */}
        <Field label="Expected guests" error={errors.guest_count?.message}>
          <input
            {...register('guest_count')}
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            placeholder="200"
            className={inputCls}
          />
        </Field>

        {/* Message */}
        <Field label="Anything else we should know?" error={errors.message?.message}>
          <textarea
            {...register('message')}
            rows={4}
            placeholder="Tell us about your vision, special requests, or anything you'd like to share…"
            className={cn(inputCls, 'resize-none')}
          />
        </Field>

        {/* Submission error */}
        {submitError && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-12 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-elevated transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send enquiry'}
        </button>

        <p className="text-center text-xs text-muted-fg">
          We reply within 24 hours. No spam, ever.
        </p>
      </form>
    </GlassCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InquiryPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  // Studio slug from ?studio= param; in dev default to xyz-photography
  const studioSlug =
    searchParams.get('studio') ??
    (import.meta.env.DEV ? 'xyz-photography' : null);

  if (!studioSlug) return <StudioNotFound />;

  const studioName = slugToName(studioSlug);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <AuroraHero className="min-h-screen">
        <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
          {/* Top bar */}
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
              <Camera className="size-4" />
            </div>
            <span className="text-sm font-medium text-fg/70">{studioName}</span>
          </div>

          {/* Split layout */}
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            {/* Left: hero copy */}
            <div className="lg:flex-1 lg:pt-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                Tell us about<br className="hidden sm:block" /> your shoot.
              </h1>
              <p className="mt-4 text-base text-muted-fg sm:text-lg">
                Drop a few details below and we'll reply within 24 hours with a tailored proposal.
              </p>

              <div className="mt-8 hidden space-y-4 lg:block">
                {[
                  { icon: '📅', text: 'Quick turnaround — reply within one business day' },
                  { icon: '📸', text: 'Full-day coverage, albums, and digital delivery' },
                  { icon: '🤝', text: 'Transparent pricing, no hidden costs' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-lg leading-tight" aria-hidden>{item.icon}</span>
                    <p className="text-sm text-muted-fg">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="w-full lg:w-[440px] lg:shrink-0">
              {submitted ? (
                <SuccessCard
                  studioName={studioName}
                  onReset={() => setSubmitted(false)}
                />
              ) : (
                <InquiryForm
                  studioSlug={studioSlug}
                  onSuccess={() => setSubmitted(true)}
                />
              )}
            </div>
          </div>
        </div>
      </AuroraHero>
    </div>
  );
}
