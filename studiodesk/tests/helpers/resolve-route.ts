import type { NtarhInitAppRouter } from 'next-test-api-route-handler'

type AppHandlerModule = NtarhInitAppRouter['appHandler']

const UUID = '([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'
const TOKEN = '([^/]+)'

/* eslint-disable @typescript-eslint/no-explicit-any */
const ROUTES: Array<{ pattern: RegExp; paramNames: string[]; load: () => Promise<any> }> = [
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
