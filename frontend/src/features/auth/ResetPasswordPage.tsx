import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth.schema';
import { authUpdatePassword } from '@/lib/api/endpoints/auth';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'min-h-11 w-full rounded-input border border-border bg-bg/60 px-4 py-2.5 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // If the user lands here without a recovery session, send them to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.login, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authUpdatePassword(data.password);
      toast.success('Password updated — please sign in again');
      navigate(ROUTES.login, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to update password';
      toast.error(msg);
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-fg">StudioDesk</p>
          <p className="mt-1 text-sm text-muted-fg">Set a new password</p>
        </div>

        <div className="rounded-card border border-border/70 bg-card/80 p-8 shadow-elevated backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg/80">New password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={cn(inputCls, errors.password && 'border-danger focus:ring-danger/40')}
              />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fg/80">Confirm password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={cn(inputCls, errors.confirmPassword && 'border-danger focus:ring-danger/40')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-input bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-fg">
          <Link to={ROUTES.login} className="font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
