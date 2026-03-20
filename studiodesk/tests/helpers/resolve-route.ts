import type { NtarhInitAppRouter } from 'next-test-api-route-handler'

type AppHandlerModule = NtarhInitAppRouter['appHandler']

const UUID = '([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'
const TOKEN = '([^/]+)'

/* eslint-disable @typescript-eslint/no-explicit-any */
const ROUTES: Array<{ pattern: RegExp; paramNames: string[]; load: () => Promise<any> }> = [
  {
    pattern: /^\/api\/v1\/auth\/signup$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/signup/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/login$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/login/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/me$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/me/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/logout$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/logout/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/reset-password$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/reset-password/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/forgot-password$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/forgot-password/route'),
  },
  {
    pattern: /^\/api\/v1\/auth\/update-password$/,
    paramNames: [],
    load: () => import('@/app/api/v1/auth/update-password/route'),
  },
  {
    pattern: /^\/api\/v1\/studio\/profile$/,
    paramNames: [],
    load: () => import('@/app/api/v1/studio/profile/route'),
  },
  {
    pattern: /^\/api\/v1\/studio\/storage$/,
    paramNames: [],
    load: () => import('@/app/api/v1/studio/storage/route'),
  },
  {
    pattern: /^\/api\/v1\/studio\/onboarding$/,
    paramNames: [],
    load: () => import('@/app/api/v1/studio/onboarding/route'),
  },
  {
    pattern: /^\/api\/v1\/studio\/onboarding\/(\d+)$/,
    paramNames: ['step'],
    load: () => import('@/app/api/v1/studio/onboarding/[step]/route'),
  },
  {
    pattern: /^\/api\/v1\/team$/,
    paramNames: [],
    load: () => import('@/app/api/v1/team/route'),
  },
  {
    pattern: /^\/api\/v1\/team\/invite$/,
    paramNames: [],
    load: () => import('@/app/api/v1/team/invite/route'),
  },
  {
    pattern: /^\/api\/v1\/team\/schedule$/,
    paramNames: [],
    load: () => import('@/app/api/v1/team/schedule/route'),
  },
  {
    pattern: /^\/api\/v1\/dashboard\/overview$/,
    paramNames: [],
    load: () => import('@/app/api/v1/dashboard/overview/route'),
  },
  {
    pattern: /^\/api\/v1\/dashboard\/today$/,
    paramNames: [],
    load: () => import('@/app/api/v1/dashboard/today/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/revenue$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/revenue/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/bookings$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/bookings/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/performance$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/performance/route'),
  },
  {
    pattern: /^\/api\/v1\/cron\/snapshot$/,
    paramNames: [],
    load: () => import('@/app/api/v1/cron/snapshot/route'),
  },
  {
    pattern: /^\/api\/v1\/team\/accept\/(.+)$/,
    paramNames: ['token'],
    load: () => import('@/app/api/v1/team/accept/[token]/route'),
  },
  {
    pattern: /^\/api\/v1\/contracts$/,
    paramNames: [],
    load: () => import('@/app/api/v1/contracts/route'),
  },
  {
    pattern: /^\/api\/v1\/galleries$/,
    paramNames: [],
    load: () => import('@/app/api/v1/galleries/route'),
  },
  {
    pattern: /^\/api\/v1\/invoices$/,
    paramNames: [],
    load: () => import('@/app/api/v1/invoices/route'),
  },
  {
    pattern: /^\/api\/v1\/payments$/,
    paramNames: [],
    load: () => import('@/app/api/v1/payments/route'),
  },
  {
    pattern: /^\/api\/v1\/webhooks\/razorpay$/,
    paramNames: [],
    load: () => import('@/app/api/v1/webhooks/razorpay/route'),
  },
  {
    pattern: /^\/api\/v1\/finance\/summary$/,
    paramNames: [],
    load: () => import('@/app/api/v1/finance/summary/route'),
  },
  {
    pattern: /^\/api\/v1\/finance\/outstanding$/,
    paramNames: [],
    load: () => import('@/app/api/v1/finance/outstanding/route'),
  },
  {
    pattern: /^\/api\/v1\/finance\/mark-overdue$/,
    paramNames: [],
    load: () => import('@/app/api/v1/finance/mark-overdue/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/settings$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/settings/route'),
  },
  {
    pattern: /^\/api\/v1\/settings\/notifications$/,
    paramNames: [],
    load: () => import('@/app/api/v1/settings/notifications/route'),
  },
  {
    pattern: /^\/api\/v1\/settings\/integrations$/,
    paramNames: [],
    load: () => import('@/app/api/v1/settings/integrations/route'),
  },
  {
    pattern: /^\/api\/v1\/settings\/integrations\/test$/,
    paramNames: [],
    load: () => import('@/app/api/v1/settings/integrations/test/route'),
  },
  {
    pattern: /^\/api\/v1\/settings\/billing$/,
    paramNames: [],
    load: () => import('@/app/api/v1/settings/billing/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/log$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/log/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/trigger$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/trigger/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/templates$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/templates/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/test$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/test/route'),
  },
  {
    pattern: /^\/api\/v1\/automations\/stats$/,
    paramNames: [],
    load: () => import('@/app/api/v1/automations/stats/route'),
  },
  {
    pattern: /^\/api\/v1\/dashboard\/overview$/,
    paramNames: [],
    load: () => import('@/app/api/v1/dashboard/overview/route'),
  },
  {
    pattern: /^\/api\/v1\/dashboard\/today$/,
    paramNames: [],
    load: () => import('@/app/api/v1/dashboard/today/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/revenue$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/revenue/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/bookings$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/bookings/route'),
  },
  {
    pattern: /^\/api\/v1\/analytics\/performance$/,
    paramNames: [],
    load: () => import('@/app/api/v1/analytics/performance/route'),
  },
  {
    pattern: /^\/api\/v1\/cron\/snapshot$/,
    paramNames: [],
    load: () => import('@/app/api/v1/cron/snapshot/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contracts/view/${TOKEN}$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/contracts/view/[token]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/view/${TOKEN}$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/invoices/view/[token]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contracts/sign/${TOKEN}$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/contracts/sign/[token]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contracts/${UUID}/send$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/contracts/[id]/send/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contracts/${UUID}/remind$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/contracts/[id]/remind/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contracts/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/contracts/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/${UUID}/send$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/invoices/[id]/send/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/${UUID}/payment-link$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/invoices/[id]/payment-link/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/${UUID}/record-payment$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/invoices/[id]/record-payment/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/${UUID}/credit-note$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/invoices/[id]/credit-note/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/invoices/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/invoices/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/upload$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/upload/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/upload-status$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/upload-status/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/clusters/${UUID}$`),
    paramNames: ['id', 'cid'],
    load: () => import('@/app/api/v1/galleries/[id]/clusters/[cid]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/clusters$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/clusters/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/publish$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/publish/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}/share$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/share/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/galleries/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/galleries/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/bookings/${UUID}/assignments$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/bookings/[id]/assignments/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/bookings/${UUID}/activity$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/bookings/[id]/activity/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/bookings/${UUID}/shoot-brief$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/bookings/[id]/shoot-brief/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/assignments/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/assignments/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/payments/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/payments/[id]/route'),
  },
  {
    pattern: /^\/api\/v1\/contract-templates$/,
    paramNames: [],
    load: () => import('@/app/api/v1/contract-templates/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/contract-templates/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/contract-templates/[id]/route'),
  },
  {
    pattern: /^\/api\/v1\/proposals$/,
    paramNames: [],
    load: () => import('@/app/api/v1/proposals/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/proposals/view/${TOKEN}$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/proposals/view/[token]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/proposals/${UUID}/send$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/proposals/[id]/send/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/proposals/${UUID}/accept$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/proposals/[id]/accept/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/proposals/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/proposals/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/leads/${UUID}/convert$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/leads/[id]/convert/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/team/${UUID}/role$`),
    paramNames: ['memberId'],
    load: () => import('@/app/api/v1/team/[memberId]/role/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/team/${UUID}/assignments$`),
    paramNames: ['memberId'],
    load: () => import('@/app/api/v1/team/[memberId]/assignments/route'),
  },
  {
    pattern: /^\/api\/v1\/packages\/templates$/,
    paramNames: [],
    load: () => import('@/app/api/v1/packages/templates/route'),
  },
  {
    pattern: /^\/api\/v1\/packages$/,
    paramNames: [],
    load: () => import('@/app/api/v1/packages/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/packages/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/packages/[id]/route'),
  },
  {
    pattern: /^\/api\/v1\/addons$/,
    paramNames: [],
    load: () => import('@/app/api/v1/addons/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/addons/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/addons/[id]/route'),
  },
  {
    pattern: /^\/api\/v1\/inquiry$/,
    paramNames: [],
    load: () => import('@/app/api/v1/inquiry/route'),
  },
  {
    pattern: /^\/api\/v1\/portal\/send-link$/,
    paramNames: [],
    load: () => import('@/app/api/v1/portal/send-link/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/portal/${TOKEN}/invoices$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/portal/[token]/invoices/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/portal/${TOKEN}/contracts$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/portal/[token]/contracts/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/portal/${TOKEN}/gallery$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/portal/[token]/gallery/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/portal/${TOKEN}/pay$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/portal/[token]/pay/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/portal/${TOKEN}$`),
    paramNames: ['token'],
    load: () => import('@/app/api/v1/portal/[token]/route'),
  },
  {
    pattern: /^\/api\/v1\/leads$/,
    paramNames: [],
    load: () => import('@/app/api/v1/leads/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/leads/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/leads/[id]/route'),
  },
  {
    pattern: /^\/api\/v1\/clients$/,
    paramNames: [],
    load: () => import('@/app/api/v1/clients/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/clients/${UUID}$`),
    paramNames: ['id'],
    load: () => import('@/app/api/v1/clients/[id]/route'),
  },
  {
    pattern: new RegExp(`^/api/v1/team/${UUID}$`),
    paramNames: ['memberId'],
    load: () => import('@/app/api/v1/team/[memberId]/route'),
  },
  {
    pattern: /^\/api\/v1\/gallery\/([^/]+)\/lookup$/,
    paramNames: ['slug'],
    load: () => import('@/app/api/v1/gallery/[slug]/lookup/route'),
  },
  {
    pattern: /^\/api\/v1\/gallery\/([^/]+)$/,
    paramNames: ['slug'],
    load: () => import('@/app/api/v1/gallery/[slug]/route'),
  },
]

export async function loadAppRoute(pathname: string): Promise<{ appHandler: AppHandlerModule; params?: Record<string, string> }> {
  for (const def of ROUTES) {
    const m = pathname.match(def.pattern)
    if (!m) continue
    const params: Record<string, string> = {}
    def.paramNames.forEach((name, i) => {
      params[name] = m[i + 1]!
    })
    const mod = await def.load()
    return { appHandler: mod as AppHandlerModule, params: def.paramNames.length ? params : undefined }
  }
  throw new Error(`No route registered for path: ${pathname}`)
}
