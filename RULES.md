# StudioDesk — Project Rules
> Attach this file to every AI prompt. Last updated: 2025.

---

## 1. Project Identity

**What:** India-native SaaS for event photography/videography studios — CRM + GST invoicing + UPI payments + AI photo delivery (Immich face recognition) in one platform.

**One-line pitch:** Run your entire photography studio — from first client inquiry to AI-powered guest photo delivery — without WhatsApp, Excel, or Tally.

**Stack:**
- Frontend + API: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Database + Auth + Storage: Supabase (PostgreSQL 15+, RLS enabled)
- Payments: Razorpay (UPI, card, net banking)
- AI Photo Engine: Immich (self-hosted VPS, face recognition)
- Email: Resend API
- WhatsApp: Interakt / AiSensy (WhatsApp Business API)
- PDF: React-PDF (server-side)
- Hosting: Vercel + Supabase

---

## 2. Project Structure

```
studiodesk/
├── app/
│   ├── (auth)/                 # login, signup
│   ├── (dashboard)/            # studio owner dashboard
│   │   ├── bookings/
│   │   ├── clients/
│   │   ├── leads/
│   │   ├── invoices/
│   │   ├── gallery/
│   │   ├── team/
│   │   └── settings/
│   ├── (client-portal)/        # client magic-link portal
│   ├── (gallery-public)/       # public guest gallery (no auth)
│   └── api/
│       ├── webhooks/           # razorpay + whatsapp webhooks
│       ├── immich/             # immich proxy routes
│       └── automations/        # cron-triggered jobs
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── dashboard/
│   ├── forms/
│   └── gallery/
├── lib/
│   ├── supabase/               # server.ts, client.ts, admin.ts
│   ├── razorpay/
│   ├── immich/
│   ├── resend/
│   ├── whatsapp/
│   ├── pdf/
│   ├── gst/
│   └── crypto/
├── types/
│   └── database.ts             # supabase generated types
└── middleware.ts
```

---

## 3. Module Build Order (strict — do not skip ahead)

1. Foundation: auth, studio onboarding, team roles, DB setup
2. **Module 5 first:** GST invoicing + Razorpay payments
3. Modules 2–4: Lead form, CRM pipeline, Proposals, Contracts
4. Module 7: Immich AI photo delivery
5. Modules 6, 8: Team scheduling, Automations
6. Modules 9–10: Client portal, Dashboard analytics
7. Module 11: Settings, polish, mobile QA

---

## 4. Database Rules

**Key tables:**

| Table | Purpose |
|---|---|
| `studios` | Top-level tenant — everything scoped to `studio_id` |
| `bookings` | Central entity — all modules link to `booking_id` |
| `clients` | Studio's customers |
| `studio_members` | Team (roles: owner/photographer/videographer/editor/assistant) |
| `invoices` | GST-compliant, advance + balance split |
| `payments` | Razorpay + manual payment records |
| `contracts` | E-signed contracts with PDF storage |
| `galleries` | Gallery metadata + Immich album link |
| `face_clusters` | Immich face recognition clusters |
| `automation_log` | WhatsApp/email delivery log |
| `booking_activity_feed` | Timeline of all booking events |
| `error_logs` | Application errors |
| `webhook_logs` | All inbound webhooks with idempotency_key |
| `security_events_log` | Auth events, suspicious activity |

**Query rules:**
```ts
// ALWAYS scope every query to studio_id (RLS + explicit filter)
const { data } = await supabase
  .from('bookings')
  .select('id, title, event_date, status')
  .eq('studio_id', studioId)
  .is('deleted_at', null)      // ALWAYS exclude soft-deleted
  .limit(50)                   // ALWAYS paginate

// NEVER select all columns
.select('*')  // ❌ banned

// NEVER hard-delete financial records
.delete().eq('id', id)  // ❌ banned on bookings/invoices/payments

// Soft delete only
.update({ deleted_at: new Date().toISOString() })  // ✅
```

**Auth (server-side):**
```ts
// ✅ Correct
const { data: { user } } = await supabase.auth.getUser()

// ❌ Wrong — does not re-validate JWT
const { data: { session } } = await supabase.auth.getSession()
```

**Supabase clients:**
```ts
// Server Components + API Routes → lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
// use getAll/setAll for cookies — NEVER individual get/set/remove

// Client Components → lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Webhooks + Cron (bypasses RLS) → lib/supabase/admin.ts
// NEVER expose SUPABASE_SERVICE_ROLE_KEY client-side
```

**Encryption (sensitive fields before INSERT):**
```ts
// AES-256-GCM via lib/crypto.ts
// Fields that MUST be encrypted: bank_account_number, whatsapp_api_key, magic_token
```

---

## 5. India Compliance — GST + Payments

**GST calculation (critical — wrong = non-compliant invoice):**
```ts
// Same state → CGST 9% + SGST 9%
// Different state → IGST 18%
// Never flat 18% as a single line

// HSN/SAC codes
photography: '998389'
videography: '998392'
editing:     '998391'
saas:        '998313'

// Invoice number format (FY = April–March)
// PREFIX-FY2526-0001
```

**Razorpay (critical — wrong unit = 100× overcharge):**
```ts
// Razorpay expects PAISE, not rupees
const paise = Math.round(rupees * 100)  // ✅
// NEVER send rupees directly to Razorpay

// Always verify webhook signature
const expected = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(rawBody).digest('hex')
if (expected !== receivedSignature) return 400

// Always check idempotency before processing
const existing = await supabase.from('webhook_logs')
  .select('id').eq('idempotency_key', event.id).single()
if (existing.data) return 200 // already processed
```

**INR formatting:**
```ts
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
// Output: ₹12,500.00

// Date format (Indian standard — never MM/DD/YYYY)
new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
  timeZone: 'Asia/Kolkata'
}).format(date)
// Output: 15 Mar 2025
```

**WhatsApp:**
```ts
// Only pre-approved templates — never freeform messages
// Phone format: +91XXXXXXXXXX always
const formatted = `+91${phone.replace(/\D/g, '').slice(-10)}`
```

---

## 6. Next.js Conventions

```ts
// Server Components by default (no 'use client' unless interactive)
// Data fetching: Server Components only — pass as props to client components

// API route structure
export async function POST(req: NextRequest) {
  const supabase = createClient()

  // 1. Auth check (always first)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Input validation (always with Zod)
  const result = schema.safeParse(await req.json())
  if (!result.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // 3. Business logic

  // 4. Structured error response (never expose stack traces)
  return NextResponse.json({ error: 'User-friendly message', code: 'CODE' }, { status: 400 })
}

// Middleware — protect dashboard routes
if (!user && pathname.startsWith('/dashboard')) redirect('/login')
```

---

## 7. UI Conventions

```ts
// shadcn/ui components ONLY — never build from scratch
import { Button, Input, Card, Badge, Dialog, Table, Tabs } from '@/components/ui/...'

// Forms — react-hook-form + Zod always
const form = useForm<FormValues>({ resolver: zodResolver(schema) })

// Toast — sonner
toast.success('Invoice sent')
toast.error('Failed to send. Check email address.')

// Loading: always show Skeleton — never blank screen
// Empty state: always show message + CTA — never blank list
// Images: next/image always — never <img>
// Inline styles: NEVER — Tailwind classes only
// Colors: semantic Tailwind — never hardcoded hex
```

**Status badge colors:**
```ts
const STATUS = {
  new_lead: 'bg-blue-100 text-blue-700',
  proposal_sent: 'bg-purple-100 text-purple-700',
  contract_signed: 'bg-indigo-100 text-indigo-700',
  advance_paid: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  lost: 'bg-red-100 text-red-700',
}
```

---

## 8. Immich Integration Rules

```ts
// NEVER mix photos from different studios in one Immich library
// Each studio → dedicated Immich library (strict isolation)

// NEVER call Immich synchronously in a user-facing request
// Always: create file_upload_jobs record → return job ID → process in background

// ALWAYS log every operation to immich_sync_jobs table
await supabase.from('immich_sync_jobs').insert({
  studio_id, gallery_id, operation: 'upload', status: 'running'
})

// NEVER store guest selfies — delete immediately after face match

// ALWAYS check storage quota before upload
if (studio.storage_used_gb + uploadGb > studio.storage_limit_gb) return 422

// Retry failed Immich calls (max 3 attempts, exponential backoff)
```

---

## 9. Security Rules

```ts
// Every API route: auth check FIRST before anything else
// Every API input: validate with Zod before touching DB
// Every webhook: verify signature before processing
// Every sensitive URL: use access_token (random hex) — never predictable ID

// DPDP Act (India data privacy law):
// - Never store guest selfies permanently
// - Support data export requests (data_export_requests table)
// - Client phone/email: never share with third parties

// Log security events
await supabase.from('security_events_log').insert({
  event_type: 'login_failed', ip_address, user_agent
})
```

---

## 10. Code Quality

```ts
// TypeScript: strict: true, no any, explicit types always
// Files: max 300 lines — split if exceeded
// Functions: max 50 lines — extract helpers if exceeded
// One component per file
// Early returns to avoid deep nesting
// Named constants for magic numbers

// Imports order:
// 1. React/Next.js  2. Third-party  3. lib/  4. components/  5. types

// Error logging (never console.log in production)
await logError({ message, stack, studioId, severity: 'error', context: {} })
```

---

## 11. Environment Variables

```bash
# Public (safe for client — NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID

# Server only — NEVER in NEXT_PUBLIC_*
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RESEND_API_KEY
WHATSAPP_API_KEY
ENCRYPTION_KEY              # 32-byte hex (64 chars)
IMMICH_BASE_URL
IMMICH_API_KEY
```

---

## 12. Banned Patterns — Never Do These

| # | Banned | Why |
|---|---|---|
| 1 | `@supabase/auth-helpers-nextjs` | Deprecated — use `@supabase/ssr` |
| 2 | `cookies().get/set/remove` individually | Use `getAll/setAll` |
| 3 | `supabase.auth.getSession()` server-side | Use `getUser()` — validates JWT |
| 4 | `.select('*')` on large tables | Performance + data exposure |
| 5 | Float arithmetic on money | Precision errors corrupt GST |
| 6 | Razorpay amount in rupees | Must be paise (×100) |
| 7 | Flat 18% GST | Must split CGST/SGST or use IGST |
| 8 | Hard delete on bookings/invoices/payments | Financial audit trail required |
| 9 | Storing guest selfies | DPDP Act violation |
| 10 | `SUPABASE_SERVICE_ROLE_KEY` client-side | Full DB bypass — critical risk |
| 11 | Skip Razorpay webhook signature check | Payment fraud risk |
| 12 | Skip Razorpay webhook idempotency check | Double payment processing |
| 13 | Mix studio photos in Immich library | Data leak between clients |
| 14 | Synchronous Immich call in API route | Blocks user, timeouts |
| 15 | `console.log` in production | Use `logError()` utility |
| 16 | Inline styles | Tailwind only |
| 17 | `<img>` tag | Use `next/image` |
| 18 | Files >300 lines | Split into modules |
| 19 | Functions >50 lines | Extract helpers |
| 20 | MM/DD/YYYY date format | Use DD MMM YYYY (Indian standard) |

## 13. API Documentation Rules

Every API route MUST have a @swagger JSDoc comment with:
- summary (one line)
- correct tag matching the module
- security: BearerAuth (omit for public routes)
- all query parameters documented
- request body schema referenced from components/schemas
- all response codes: 200/201, 400, 401, 403, 404, 422, 500
- $ref to schemas in lib/swagger.ts for request + response bodies

New schemas added to lib/swagger.ts components.schemas.
Never inline complex schemas in the JSDoc — always use $ref.