import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { formatINR, formatIndianNumber } from '@/lib/formatters';

interface NumberTickerProps {
  value: number;
  format?: 'INR' | 'number';
  className?: string;
  duration?: number;
}

/**
 * NumberTicker — KPI counter that animates from 0. The one place 1200ms motion
 * is allowed in-app (per anti-AI rule #11).
 */
export function NumberTicker({
  value,
  format = 'number',
  className,
  duration = 1.2,
}: NumberTickerProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) =>
    format === 'INR' ? formatINR(Math.round(latest)) : formatIndianNumber(Math.round(latest)),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
