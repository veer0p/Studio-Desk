import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  /** Real-voice copy per anti-AI rule #10. */
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something broke on our side',
  description = 'We could not load this. Try again — if it keeps failing, the server might be having a moment.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-danger/30 bg-danger/5 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-12 place-items-center rounded-card bg-danger/10 text-danger">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-fg">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-input border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-bg"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      )}
    </div>
  );
}
