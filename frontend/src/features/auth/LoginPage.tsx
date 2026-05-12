import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

const inputCls = cn(
  'min-h-11 w-full rounded-input border border-border bg-bg/60 px-4 py-2.5 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const from = (location.state as { from?: string })?.from ?? ROUTES.dashboard;

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiErr = (err as any)?.apiError;
      const code = apiErr?.code ?? '';
      const msg = apiErr?.message ?? (err as { message?: string })?.message ?? '';
      if (code === 'invalid_credentials' || code === 'AUTH_ERROR' || msg.includes('Invalid'))
        toast.error('Wrong email or password');
      else
        toast.error(msg || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-fg">StudioDesk</p>
          <p className="mt-1 text-sm text-muted-fg">Sign in to your studio</p>
        </div>

        <div className="rounded-card border border-border/70 bg-card/80 p-8 shadow-elevated backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-fg/80">Password</label>
                <Link
                  to={ROUTES.forgotPassword}
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(inputCls, errors.password && 'border-danger focus:ring-danger/40')}
              />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-input bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Don't have an account?{' '}
          <Link to={ROUTES.signup} className="font-medium text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
