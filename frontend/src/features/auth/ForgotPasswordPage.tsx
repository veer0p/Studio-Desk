import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth.schema';
import { authForgotPassword } from '@/lib/api/endpoints/auth';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'min-h-11 w-full rounded-input border border-border bg-bg/60 px-4 py-2.5 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authForgotPassword(data.email);
    } catch {
      // Backend always returns 200 for this endpoint (no account leak)
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-fg">StudioDesk</p>
          <p className="mt-1 text-sm text-muted-fg">Reset your password</p>
        </div>

        <div className="rounded-card border border-border/70 bg-card/80 p-8 shadow-elevated backdrop-blur-md">
          {sent ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <p className="font-medium text-fg">Check your inbox</p>
              <p className="text-sm text-muted-fg">
                If an account exists for that email, reset instructions have been sent. Check your backend console in development.
              </p>
              <Link
                to={ROUTES.login}
                className="mt-2 text-sm font-medium text-accent hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-fg">
                Enter your email and we'll send password reset instructions.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-fg/80">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="priya@xyzphotography.com"
                  className={cn(inputCls, errors.email && 'border-danger focus:ring-danger/40')}
                />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-input bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="mt-6 text-center text-sm text-muted-fg">
            Remembered it?{' '}
            <Link to={ROUTES.login} className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
