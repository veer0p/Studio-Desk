import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * AuroraHero — the ONLY component allowed to render the aurora gradient.
 *
 * Restricted by ESLint to render inside hero zones of: `(public)/`, `(auth)/`,
 * and the Dashboard route. Never on tables/forms/chrome.
 *
 * On `prefers-reduced-motion: reduce` the aurora freezes (CSS handles this
 * via the global rule in `globals.css` + `useReducedMotion` here).
 */
export function AuroraHero({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          aria-hidden
          className="absolute inset-x-[-20%] -top-1/3 h-[120%] blur-3xl"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 30%, rgb(var(--aurora-1) / 0.35), transparent 60%), radial-gradient(50% 50% at 80% 20%, rgb(var(--aurora-2) / 0.30), transparent 60%), radial-gradient(60% 60% at 60% 80%, rgb(var(--aurora-3) / 0.25), transparent 60%)',
          }}
          animate={
            reduce
              ? undefined
              : {
                  scale: [1, 1.08, 1],
                  rotate: [0, 6, -2, 0],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      {children}
    </div>
  );
}
