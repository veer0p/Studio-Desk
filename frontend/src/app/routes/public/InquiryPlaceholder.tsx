import { AuroraHero } from '@/components/motion/AuroraHero';

/**
 * Sprint 0 placeholder for the public /inquiry page. Sprint 2 turns this into
 * the actual public form that creates a lead in the studio's inbox.
 */
export function InquiryPlaceholder() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <AuroraHero className="px-6 py-24 sm:px-12 lg:py-32">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-fg">XYZ Photography</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Tell us about your shoot.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-fg">
          Wedding, pre-wedding, portrait, or anything in between — drop a few details and we will
          reply within a day with a tailored proposal. The full form ships in Sprint 2.
        </p>
      </AuroraHero>
    </div>
  );
}
