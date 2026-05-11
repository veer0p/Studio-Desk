import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * PageContainer — the standard route wrapper.
 *
 * Width policy:
 * - Pages **fill the available width** of the main column (the area to the
 *   right of the sidebar). No artificial cap on normal desktops — content
 *   shouldn't float in the middle of a 1920px screen.
 * - On *true* ultra-wide (`min-width: 1920px` aka our `2xl:` breakpoint and
 *   above), we soft-cap at 1800px so a 3440px curved monitor doesn't render
 *   a 3000px-wide table that's unreadable.
 * - Horizontal padding scales with width.
 *
 * Inside individual screens, narrow-by-design sections (forms, prose blocks,
 * single-column reading content) can apply their own `max-w-2xl` /
 * `max-w-prose` — don't put those caps here.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-10 2xl:max-w-[1800px] 2xl:px-12',
        className,
      )}
    >
      {children}
    </div>
  );
}
