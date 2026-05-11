import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

/**
 * GlassCard — subtle glass surface. Default elevation is `shadow-sm`; glow is
 * reserved for focus only (handled by globals.css :focus-visible).
 */
export function GlassCard({ children, className, interactive = false }: GlassCardProps) {
  const Component = interactive ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'rounded-card border border-border bg-card shadow-card',
        interactive && 'transition-shadow',
        className,
      )}
      {...(interactive
        ? {
            whileHover: { y: -1 },
            transition: { duration: 0.12, ease: 'easeOut' },
          }
        : {})}
    >
      {children}
    </Component>
  );
}
