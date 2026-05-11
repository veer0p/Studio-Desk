/**
 * Centralized route paths. Never hard-code URLs in components — import from here.
 * If a route changes, this file is the single edit point.
 */
export const ROUTES = {
  // Auth (Sprint 11)
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // Public
  inquiry: '/inquiry',

  // Dashboard (default landing until Sprint 10 ships Dashboard)
  dashboard: '/dashboard',
  leads: '/leads',
  leadDetail: (id: string) => `/leads?id=${id}`,

  inquiryInbox: '/leads?source=inquiry',

  clients: '/clients',
  clientDetail: (id: string) => `/clients?id=${id}`,

  proposals: '/proposals',
  proposalDetail: (id: string) => `/proposals?id=${id}`,

  contracts: '/contracts',
  contractDetail: (id: string) => `/contracts?id=${id}`,

  bookings: '/bookings',
  bookingDetail: (id: string) => `/bookings?id=${id}`,

  invoices: '/invoices',
  invoiceDetail: (id: string) => `/invoices?id=${id}`,
  payments: '/payments',

  gallery: '/gallery',
  galleryDetail: (id: string) => `/gallery/${id}`,

  settings: '/settings',
} as const;
