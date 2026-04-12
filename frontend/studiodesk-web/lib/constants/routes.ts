/**
 * Central route constants for the entire application.
 * Use these constants instead of hardcoded strings to ensure
 * consistency and maintainability across the codebase.
 */

export const ROUTES = {
  // Dashboard
  DASHBOARD: "/dashboard",

  // Studio modules
  BOOKINGS: "/bookings",
  CLIENTS: "/clients",
  LEADS: "/leads",
  FINANCE: "/finance",
  FINANCE_INVOICES: "/finance/invoices",
  FINANCE_INVOICES_NEW: "/finance/invoices/new",
  FINANCE_PAYMENTS: "/finance/payments",
  GALLERY: "/gallery",
  TEAM: "/team",
  PROPOSALS: "/proposals",
  CONTRACTS: "/contracts",
  ANALYTICS: "/analytics",
  ADDONS: "/addons",

  // Settings
  SETTINGS: "/settings",
  SETTINGS_STUDIO: "/settings/studio",
  SETTINGS_OWNER: "/settings/owner",
  SETTINGS_BILLING: "/settings/billing",
  SETTINGS_DANGER: "/settings/danger",
  SETTINGS_FINANCE: "/settings/finance",
  SETTINGS_INTEGRATIONS: "/settings/integrations",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_PACKAGES: "/settings/packages",
  SETTINGS_AUTOMATIONS: "/settings/automations",

  // Public gallery (client-facing share links)
  PUBLIC_GALLERY: (slug: string) => `/gallery/p/${slug}`,

  // Portal (client-facing)
  PORTAL_LOGIN: (studioSlug: string) => `/portal/${studioSlug}/login`,
  PORTAL_DASHBOARD: (studioSlug: string) => `/portal/${studioSlug}/dashboard`,
  PORTAL_BOOKINGS: (studioSlug: string) => `/portal/${studioSlug}/bookings`,
  PORTAL_BOOKING_DETAIL: (studioSlug: string, id: string) => `/portal/${studioSlug}/bookings/${id}`,
  PORTAL_INVOICES: (studioSlug: string) => `/portal/${studioSlug}/invoices`,
  PORTAL_INVOICE_DETAIL: (studioSlug: string, id: string) => `/portal/${studioSlug}/invoices/${id}`,
  PORTAL_GALLERY: (studioSlug: string) => `/portal/${studioSlug}/gallery`,
  PORTAL_GALLERY_DETAIL: (studioSlug: string, id: string) => `/portal/${studioSlug}/gallery/${id}`,
  PORTAL_PROPOSALS: (studioSlug: string) => `/portal/${studioSlug}/proposals`,
  PORTAL_PROPOSAL_DETAIL: (studioSlug: string, id: string) => `/portal/${studioSlug}/proposals/${id}`,
  PORTAL_CONTRACTS: (studioSlug: string) => `/portal/${studioSlug}/contracts`,
  PORTAL_CONTRACT_DETAIL: (studioSlug: string, id: string) => `/portal/${studioSlug}/contracts/${id}`,

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // Onboarding
  ONBOARDING: "/onboarding",

  // Marketing pages
  HOME: "/",
  FEATURES: "/features",
  PRICING: "/pricing",
  CASE_STUDIES: "/case-studies",
  BLOG: "/blog",
  TEMPLATES: "/templates",
  BOOK_DEMO: "/book-demo",
  WEDDING_PHOTOGRAPHERS: "/wedding-photographers",
  PORTRAIT_STUDIOS: "/portrait-studios",
  COMMERCIAL_VIDEO: "/commercial-video",
  GST_INVOICING: "/gst-invoicing-for-photographers",
  CLIENT_GALLERY_FACE_RECOGNITION: "/client-gallery-face-recognition",
} as const

/**
 * Helper to build a booking detail URL
 */
export const bookingDetailUrl = (id: string) => `${ROUTES.BOOKINGS}/${id}`

/**
 * Helper to build a client detail URL
 */
export const clientDetailUrl = (id: string) => `${ROUTES.CLIENTS}/${id}`

/**
 * Helper to build a gallery detail URL
 */
export const galleryDetailUrl = (id: string) => `${ROUTES.GALLERY}/${id}`

/**
 * Helper to build a team member detail URL
 */
export const teamMemberDetailUrl = (id: string) => `${ROUTES.TEAM}/${id}`

/**
 * Helper to build a proposal detail URL
 */
export const proposalDetailUrl = (id: string) => `${ROUTES.PROPOSALS}/${id}`

/**
 * Helper to build a contract detail URL
 */
export const contractDetailUrl = (id: string) => `${ROUTES.CONTRACTS}/${id}`

/**
 * Helper to build a lead detail URL
 */
export const leadDetailUrl = (id: string) => `${ROUTES.LEADS}/${id}`
