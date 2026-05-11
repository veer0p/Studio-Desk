import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { AppShell } from './AppShell';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-sm text-muted-fg">Loading…</p>
      </div>
    </div>
  );
}

/**
 * Root layout for all protected routes. Replaces the bare <AppShell /> as the
 * route element so the sidebar/topbar only render when authenticated.
 *
 * - Loading  → spinner (avoids flash of redirect)
 * - Auth OK  → renders <AppShell /> (which has <Outlet /> for child routes)
 * - No auth  → <Navigate to="/login" />
 */
export function ProtectedOutlet() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <AppShell />;
}
