import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Prefetch critical dashboard routes on user interaction.
 */
export function prefetchDashboardRoutes(router: AppRouterInstance) {
  const routes = [
    '/dashboard/bookings',
    '/dashboard/leads',
    '/dashboard/invoices',
    '/dashboard/analytics',
  ];
  
  routes.forEach(route => {
    router.prefetch(route);
  });
}

/**
 * Prefetch a specific route on hover.
 */
export function prefetchOnHover(router: AppRouterInstance, href: string) {
  router.prefetch(href);
}
