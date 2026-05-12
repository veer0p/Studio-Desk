import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { signupSchema, type SignupInput } from '@/lib/validations/auth.schema';
import { authSignup } from '@/lib/api/endpoints/auth';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const inputCls = cn(
  'min-h-11 w-full rounded-input border border-border bg-bg/60 px-4 py-2.5 text-sm text-fg',
  'placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-accent/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-fg/80">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-fg/60">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.dashboard, { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const studioName = watch('studioName');
  useEffect(() => {
    if (studioName) {
      setValue('studioSlug', slugify(studioName), { shouldValidate: false });
    }
  }, [studioName, setValue]);

  const onSubmit = async (data: SignupInput) => {
    try {
      await authSignup(data);
      // Auto-login after successful signup
      await login({ email: data.email, password: data.password });
      toast.success(`Welcome to StudioDesk, ${data.fullName.split(' ')[0]}!`);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err: unknown) {
      const apiErr = (err as any)?.apiError;
      const code = apiErr?.code ?? '';
      const msg = apiErr?.message ?? (err as { message?: string })?.message ?? 'Signup failed';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('already')) {
        toast.error('An account with this email already exists');
      } else if (code === 'CONFLICT' || msg.toLowerCase().includes('slug')) {
        toast.error('That studio URL is already taken — try a different slug');
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-fg">StudioDesk</p>
          <p className="mt-1 text-sm text-muted-fg">Create your studio account</p>
        </div>

        <div className="rounded-card border border-border/70 bg-card/80 p-8 shadow-elevated backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full name" required error={errors.fullName?.message}>
              <input
                {...register('fullName')}
                autoComplete="name"
                placeholder="Priya Sharma"
                className={cn(inputCls, errors.fullName && 'border-danger focus:ring-danger/40')}
              />
            </Field>

            <Field label="Email" required error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="priya@xyzphotography.com"
                className={cn(inputCls, errors.email && 'border-danger focus:ring-danger/40')}
              />
            </Field>

            <Field label="Password" required error={errors.password?.message} hint="Minimum 8 characters">
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={cn(inputCls, errors.password && 'border-danger focus:ring-danger/40')}
              />
            </Field>

            <div className="border-t border-border/60 pt-4">
              <Field label="Studio name" required error={errors.studioName?.message}>
                <input
                  {...register('studioName')}
                  placeholder="XYZ Photography"
                  className={cn(inputCls, errors.studioName && 'border-danger focus:ring-danger/40')}
                />
              </Field>
            </div>

            <Field
              label="Studio URL"
              required
              error={errors.studioSlug?.message}
              hint="Your studio's unique identifier — letters, numbers, hyphens only"
            >
              <div className="flex items-center">
                <span className="flex min-h-11 items-center rounded-l-input border border-r-0 border-border/70 bg-bg/40 px-3 text-sm text-muted-fg/60">
                  studiodesk.app/
                </span>
                <input
                  {...register('studioSlug')}
                  placeholder="xyz-photography"
                  className={cn(
                    inputCls,
                    'rounded-l-none',
                    errors.studioSlug && 'border-danger focus:ring-danger/40',
                  )}
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-input bg-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating studio…
                </>
              ) : (
                'Create studio'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
