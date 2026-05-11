import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import { AuthProviderLayout } from '@/lib/auth/AuthProvider';
import { ProtectedOutlet } from '@/components/layout/ProtectedOutlet';
import { ROUTES } from '@/lib/constants/routes';

// Auth pages — small, eager-loaded so login is instant on cold start
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

// Feature modules — lazy-loaded so they don't bloat the initial bundle
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const LeadsPage = lazy(() =>
  import('@/features/leads/LeadsPage').then((m) => ({ default: m.LeadsPage })),
);
const ClientsPage = lazy(() =>
  import('@/features/clients/ClientsPage').then((m) => ({ default: m.ClientsPage })),
);
const ProposalsPage = lazy(() =>
  import('@/features/proposals/ProposalsPage').then((m) => ({ default: m.ProposalsPage })),
);
const ContractsPage = lazy(() =>
  import('@/features/contracts/ContractsPage').then((m) => ({ default: m.ContractsPage })),
);
const BookingsPage = lazy(() =>
  import('@/features/bookings/BookingsPage').then((m) => ({ default: m.BookingsPage })),
);
const InvoicesPage = lazy(() =>
  import('@/features/invoices/InvoicesPage').then((m) => ({ default: m.InvoicesPage })),
);
const PaymentsPage = lazy(() =>
  import('@/features/payments/PaymentsPage').then((m) => ({ default: m.PaymentsPage })),
);
const GalleriesPage = lazy(() =>
  import('@/features/galleries/GalleriesPage').then((m) => ({ default: m.GalleriesPage })),
);
const GalleryDetailPage = lazy(() =>
  import('@/features/galleries/GalleryDetailPage').then((m) => ({ default: m.GalleryDetailPage })),
);
const InquiryPage = lazy(() =>
  import('@/features/inquiry/InquiryPage').then((m) => ({ default: m.InquiryPage })),
);
const ComponentsPreview = lazy(() =>
  import('@/app/routes/dashboard/ComponentsPreview').then((m) => ({
    default: m.ComponentsPreview,
  })),
);

// Minimal inline fallback — avoids a full-screen spinner for sub-route navigations
function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

const routes: RouteObject[] = [
  {
    // Root layout — provides AuthContext; must be inside Router so useNavigate works
    element: <AuthProviderLayout />,
    children: [
      // Auth pages — outside AppShell, no sidebar/topbar
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },

      // Protected app — ProtectedOutlet checks auth then renders AppShell + Outlet
      {
        path: '/',
        element: <ProtectedOutlet />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'leads',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <LeadsPage />
              </Suspense>
            ),
          },
          {
            path: 'clients',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ClientsPage />
              </Suspense>
            ),
          },
          {
            path: 'proposals',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ProposalsPage />
              </Suspense>
            ),
          },
          {
            path: 'contracts',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ContractsPage />
              </Suspense>
            ),
          },
          {
            path: 'bookings',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <BookingsPage />
              </Suspense>
            ),
          },
          {
            path: 'invoices',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <InvoicesPage />
              </Suspense>
            ),
          },
          {
            path: 'payments',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <PaymentsPage />
              </Suspense>
            ),
          },
          {
            path: 'gallery',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <GalleriesPage />
              </Suspense>
            ),
          },
          {
            path: 'gallery/:id',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <GalleryDetailPage />
              </Suspense>
            ),
          },
          {
            path: '_components',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ComponentsPreview />
              </Suspense>
            ),
          },
        ],
      },

      // Public pages — no auth required
      {
        path: '/inquiry',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <InquiryPage />
          </Suspense>
        ),
      },

      { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
