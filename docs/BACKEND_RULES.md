# StudioDesk — API Development Rules
> Attach to every API development prompt.
> Covers: architecture, optimization, scalability, testing, migrations, security.

---

## 1. Architecture — 3-Layer Pattern (mandatory)

Every feature follows this exact structure. No exceptions.

```
HTTP Request
     ↓
app/api/[module]/route.ts        ← Route Handler (controller)
     ↓                              Auth check, validate input,
lib/services/[module].service.ts ← Service Layer (business logic)
     ↓                              GST calc, Razorpay, WhatsApp,
lib/repositories/[module].repo.ts← Repository Layer (DB only)
                                    Pure Supabase queries, no logic
```

**Route Handler — only these 4 things:**
1. Call `requireAuth()` or `requireOwner()`
2. Parse + validate input with Zod
3. Call service method
4. Return HTTP response

**Service Layer — all business logic:**
- GST calculations
- Razorpay API calls
- PDF generation
- WhatsApp/email triggers
- Cross-table orchestration
- Activity feed logging

**Repository Layer — only DB:**
- Supabase queries
- Always scoped to `studio_id`
- Always filter `deleted_at IS NULL`
- Always select specific columns, never `*`
- Returns typed data or throws typed errors

**Example structure:**
```
app/api/
  invoices/
    route.ts              POST /api/invoices
    [id]/
      route.ts            GET/PATCH /api/invoices/[id]
      send/route.ts       POST /api/invoices/[id]/send
  webhooks/
    razorpay/route.ts
  gallery/
    [slug]/
      lookup/route.ts     POST - public, no auth

lib/
  services/
    invoice.service.ts
    booking.service.ts
    gallery.service.ts
    automation.service.ts
    immich.service.ts
    pdf.service.ts
  repositories/
    invoice.repo.ts
    booking.repo.ts
    gallery.repo.ts
    client.repo.ts
  auth/
    guards.ts
```

---

## 2. API Route Template (copy for every new route)

```typescript
// app/api/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/guards'
import { SomeService } from '@/lib/services/some.service'
import { ApiResponse } from '@/types'

const createSchema = z.object({
  field: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const { user, member } = await requireAuth(req)

    // 2. Validate
    const body = await req.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten(), code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // 3. Business logic (service handles everything)
    const data = await SomeService.create(member.studio_id, result.data)

    // 4. Response
    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    // Typed error handling
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    // Unknown errors — log and return generic message
    await logError({ message: String(error), requestUrl: req.url })
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

---

## 3. Auth Guards (use at top of every route)

```typescript
// lib/auth/guards.ts

// Standard auth — any active studio member
const { user, member } = await requireAuth(req)
// Returns: { user, member: { studio_id, member_id, role }, supabase }

// Owner only — for settings, team management, billing
const { user, member } = await requireOwner(req)

// Public routes — no studio auth (gallery, inquiry form, client portal, webhooks)
// No guard needed — validate via access_token or magic_token in service layer
```

---

## 4. Scalability — Connection Pooling (critical)

<< Research finding: Without pooling, 60 direct connections = 60 users max. With Supavisor transaction pooling, 120 connections serves 1,000+ concurrent users. >>

**Always use Supavisor (transaction mode) — never direct connection from Vercel/serverless:**

```typescript
// lib/supabase/server.ts — ALWAYS use pooler URL, not direct URL
// Supabase dashboard → Connect → Transaction pooler → port 6543
// Set in .env.local:
// DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

// For Supabase client (@supabase/ssr), this is automatic.
// For any raw DB operations, always use pooler string.
```

**Connection budget for 1,000 users (Supabase free tier — 60 direct connections):**
```
Supavisor pool:     48 connections (80% of 60)
Auth server:         6 connections
Admin/cron jobs:     6 connections
─────────────────────────────────────
Total:              60 connections → serves ~1,200 concurrent API requests
```

---

## 5. Scalability — RLS Performance Fix (critical)

<< Research finding: RLS functions called per-row destroy performance. Wrap in subselect to cache result for entire query. >>

**All RLS policies in this project must use the cached pattern:**
```sql
-- ❌ Slow — auth.uid() called for every single row
USING (studio_id = (
  SELECT studio_id FROM studio_members WHERE user_id = auth.uid()
))

-- ✅ Fast — result cached for entire query
USING (studio_id = (
  SELECT studio_id FROM studio_members WHERE user_id = (SELECT auth.uid())
))
```

**Apply this fix to schema before building. Migration file: `supabase/migrations/YYYYMMDDHHMMSS_fix_rls_performance.sql`**

---

## 6. Scalability — Database Query Optimization

**Indexes — always verify before querying:**
- Filter columns: `studio_id`, `status`, `event_date`, `deleted_at` — all indexed in V2 schema
- Order columns: `created_at DESC`, `event_date ASC` — use indexed columns only
- Never filter on non-indexed columns in large tables

**Select only what you need:**
```typescript
// ❌ Fetches 30 columns including sensitive internal data
.select('*')

// ✅ Fetch exactly what the route needs
.select('id, title, event_date, status, amount_pending, clients(full_name, phone)')
```

**Pagination — always, no exceptions:**
```typescript
const PAGE_SIZE = 20
const { data, count } = await supabase
  .from('bookings')
  .select('...', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('event_date', { ascending: false })
// count: 'exact' is expensive — only use when displaying pagination UI
// Use count: 'estimated' for total counts on dashboard cards
```

**Avoid N+1 — use joins not loops:**
```typescript
// ❌ N+1 — 1 query per booking
const bookings = await getBookings()
for (const booking of bookings) {
  booking.client = await getClient(booking.client_id) // N extra queries
}

// ✅ Single join query
const { data } = await supabase
  .from('bookings')
  .select('*, clients(full_name, phone, email)')
```

**Batch inserts over individual inserts:**
```typescript
// ❌ Loop with individual inserts
for (const item of lineItems) {
  await supabase.from('invoice_line_items').insert(item)
}

// ✅ Single batch insert
await supabase.from('invoice_line_items').insert(lineItems)
```

---

## 7. Scalability — Caching Strategy

<< Research finding: Proper caching reduces DB load 80-90%. API routes serving user-specific data (invoices, bookings) must never be cached. Public/semi-public data (gallery, subscription plans) can be cached. >>

**Cache headers per route type:**

```typescript
// Private, user-specific data — NEVER cache
// Bookings, invoices, payments, contracts, team
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
})

// Semi-public, per-studio data — short cache
// Gallery public page, proposal view link
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' }
})

// Fully public, rarely changes — longer cache
// Subscription plans, Indian states, HSN codes
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
})

// Webhooks — never cache
// Real-time data — never cache
```

**`unstable_cache` for expensive server-side queries:**
```typescript
import { unstable_cache } from 'next/cache'

// Cache subscription plans (changes rarely)
const getSubscriptionPlans = unstable_cache(
  async () => {
    const { data } = await supabase.from('subscription_plans').select('*')
    return data
  },
  ['subscription-plans'],
  { revalidate: 3600 } // 1 hour
)

// Invalidate when admin updates plans
revalidateTag('subscription-plans')
```

---

## 8. Scalability — Async Processing

**Never block the HTTP response for slow operations:**

```typescript
// ❌ User waits for PDF generation (2-3 seconds)
const pdf = await generateInvoicePdf(invoice)
await uploadToStorage(pdf)
return NextResponse.json({ invoice })

// ✅ Return immediately, process in background
// Option A: Supabase Edge Function (cron-style background job)
// Option B: Log the job, process via background_job_logs table
await supabase.from('background_job_logs').insert({
  job_type: 'generate_invoice_pdf',
  status: 'queued',
  metadata: { invoice_id: invoice.id }
})
return NextResponse.json({ invoice, pdf_status: 'generating' })
```

**Immich uploads — always async:**
```typescript
// Never upload photos synchronously
// Always: create file_upload_jobs row → return job ID → background processing
const { data: job } = await supabase.from('file_upload_jobs')
  .insert({ studio_id, gallery_id, total_files: files.length, status: 'queued' })
  .select('id').single()
return NextResponse.json({ job_id: job.id })
// Client polls GET /api/gallery/[id]/upload-status
```

---

## 9. Scalability — API Versioning

**Version all routes from day one — makes breaking changes safe:**
```
app/api/v1/
  bookings/route.ts
  invoices/route.ts
  ...
```

```typescript
// In middleware or route: set version header
response.headers.set('X-API-Version', '1.0.0')

// When breaking change needed later:
// app/api/v2/bookings/route.ts  ← new version
// app/api/v1/bookings/route.ts  ← kept for backwards compatibility
```

---

## 10. Input Validation — Zod Schemas

**All schemas in `lib/validations/[module].schema.ts` — reused by routes + services:**

```typescript
// lib/validations/invoice.schema.ts
import { z } from 'zod'

// Amount as string matching NUMERIC(12,2) — never float
const amountSchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Invalid amount')

// Indian phone number
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')

// GST number
const gstinSchema = z.string().regex(
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  'Invalid GSTIN'
).optional()

export const createInvoiceSchema = z.object({
  booking_id:    z.string().uuid(),
  invoice_type:  z.enum(['advance', 'balance', 'full']),
  due_date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  line_items:    z.array(z.object({
    name:        z.string().min(1).max(200),
    quantity:    z.string().regex(/^\d+(\.\d{1,2})?$/),
    unit_price:  amountSchema,
  })).min(1),
  notes:         z.string().max(1000).optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
```

---

## 11. Error Handling — Typed Error System

```typescript
// lib/errors.ts
export class ServiceError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// Named error factory functions
export const Errors = {
  notFound:      (entity: string) => new ServiceError(`${entity} not found`, 'NOT_FOUND', 404),
  unauthorized:  ()               => new ServiceError('Unauthorized', 'UNAUTHORIZED', 401),
  forbidden:     ()               => new ServiceError('Access denied', 'FORBIDDEN', 403),
  conflict:      (msg: string)    => new ServiceError(msg, 'CONFLICT', 409),
  quotaExceeded: ()               => new ServiceError('Storage quota exceeded', 'QUOTA_EXCEEDED', 422),
  paymentFailed: (msg: string)    => new ServiceError(msg, 'PAYMENT_FAILED', 402),
  validation:    (msg: string)    => new ServiceError(msg, 'VALIDATION_ERROR', 400),
  external:      (service: string) => new ServiceError(`${service} service unavailable`, 'EXTERNAL_ERROR', 502),
}

// Usage in service:
if (!booking) throw Errors.notFound('Booking')
if (booking.studio_id !== studioId) throw Errors.forbidden()
```

---

## 12. Response Format — Consistent across all routes

```typescript
// lib/response.ts
import { NextResponse } from 'next/server'

export const Response = {
  ok:      <T>(data: T, status = 200)        => NextResponse.json({ data }, { status }),
  created: <T>(data: T)                      => NextResponse.json({ data }, { status: 201 }),
  noContent: ()                              => new NextResponse(null, { status: 204 }),
  error:   (message: string, code: string, status = 400) =>
    NextResponse.json({ error: message, code }, { status }),
  paginated: <T>(data: T[], count: number, page: number, pageSize: number) =>
    NextResponse.json({ data, meta: { count, page, pageSize, totalPages: Math.ceil(count / pageSize) } }),
}

// All routes use this — never raw NextResponse.json with ad-hoc shapes
return Response.ok(invoice)
return Response.created(booking)
return Response.error('Invoice not found', 'NOT_FOUND', 404)
return Response.paginated(bookings, count, page, PAGE_SIZE)
```

---

## 13. Database — Soft Delete + Financial Immutability

```typescript
// NEVER hard delete these tables:
// bookings, clients, invoices, payments, contracts, refunds

// Soft delete pattern:
await supabase.from('bookings')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id).eq('studio_id', studioId)

// NEVER update these fields after creation:
// invoices.total_amount (after status = 'sent')
// invoices.invoice_number
// payments.amount (ever)

// To correct an invoice — create a credit note:
await InvoiceService.createCreditNote(originalInvoiceId, reason)

// All queries filter soft-deleted:
.is('deleted_at', null)  // always
```

---

## 14. Database — Migration Files (mandatory for schema changes)

**Never change the schema directly in production. Always use migration files:**

```bash
# Create a new migration
npx supabase migration new descriptive_name_here
# Creates: supabase/migrations/20250315120000_descriptive_name_here.sql

# Apply locally
npx supabase db reset  # resets local DB and runs all migrations

# Check migration status
npx supabase migration list
```

**Migration file rules:**
```sql
-- supabase/migrations/20250315120000_add_booking_notes.sql

-- Always: make changes reversible where possible
-- Always: update affected indexes
-- Always: add comment explaining WHY this change was needed

-- Add column with safe default (never NOT NULL without default on existing table)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_ref TEXT;

-- For NOT NULL columns on existing table — add nullable first, backfill, then constrain
ALTER TABLE bookings ADD COLUMN shoot_confirmed BOOLEAN;
UPDATE bookings SET shoot_confirmed = FALSE WHERE shoot_confirmed IS NULL;
ALTER TABLE bookings ALTER COLUMN shoot_confirmed SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN shoot_confirmed SET DEFAULT FALSE;

-- Index new columns immediately
CREATE INDEX IF NOT EXISTS idx_bookings_shoot_confirmed
  ON bookings (studio_id, shoot_confirmed) WHERE shoot_confirmed = FALSE;
```

---

## 15. Security — Per-Route Checklist

Every route must pass this checklist before it's considered done:

```
[ ] Auth check is first line of handler (requireAuth/requireOwner)
[ ] All inputs validated with Zod schema
[ ] studio_id comes from auth context (never from request body)
[ ] No raw DB errors exposed in responses
[ ] Webhook routes verify signature before any processing
[ ] Webhook routes check idempotency_key before processing
[ ] Public routes (gallery, inquiry) validated by access_token/magic_token
[ ] No secrets in response bodies
[ ] Financial amounts validated as numeric strings not floats
[ ] Razorpay amounts converted to paise before API call
[ ] Error logged to error_logs for 5xx responses
[ ] Security events logged for 401/403 responses
```

---

## 16. Testing — Structure per Feature

**For every API module, write tests in this order:**

```
tests/
  unit/
    gst-calculator.test.ts    ← Pure logic, no DB
    formatters.test.ts
    razorpay-utils.test.ts
    crypto.test.ts
  integration/
    invoices.test.ts          ← Against local Supabase
    bookings.test.ts
    payments.test.ts
  api/
    invoices.api.test.ts      ← HTTP-level with next-test-api-route-handler
    webhooks.api.test.ts
```

**Test a route properly:**
```typescript
// tests/api/invoices.api.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import * as handler from '@/app/api/v1/invoices/route'

test('POST /api/v1/invoices returns 401 without auth', async () => {
  await testApiHandler({
    appHandler: handler,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'POST', body: JSON.stringify({}) })
      expect(res.status).toBe(401)
      const json = await res.json()
      expect(json.code).toBe('UNAUTHORIZED')
    }
  })
})

test('POST /api/v1/invoices creates with correct GST split', async () => {
  // Test intra-state: CGST + SGST
  // Test inter-state: IGST only
  // Test exempt: no tax
})
```

**Minimum tests before marking a module done:**
- 401 without auth
- 400 with invalid input (each required field)
- 404 for non-existent resource
- 403 for another studio's resource (RLS test)
- 200/201 happy path
- Edge cases specific to the module

---

## 17. India-Specific Rules (never skip)

```typescript
// GST — always split, never flat 18%
function calculateGst(subtotal, gstType) {
  if (gstType === 'cgst_sgst') {
    // intra-state: each = subtotal * 0.09
    const half = parseFloat((subtotal * 0.09).toFixed(2))
    return { cgst: half, sgst: half, igst: 0, total: half * 2 }
  }
  if (gstType === 'igst') {
    // inter-state: igst = subtotal * 0.18
    const igst = parseFloat((subtotal * 0.18).toFixed(2))
    return { cgst: 0, sgst: 0, igst, total: igst }
  }
  return { cgst: 0, sgst: 0, igst: 0, total: 0 } // exempt
}

// Razorpay — paise not rupees
const paise = Math.round(rupees * 100)  // 1250.00 → 125000

// Dates — IST always
new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

// Phone — +91 prefix for WhatsApp
const formatted = `+91${phone.replace(/\D/g, '').slice(-10)}`

// Invoice FY — April to March
// FY2526 = April 2025 to March 2026
```

---

## 18. Logging — When to Log What

```typescript
// error_logs: 5xx responses, unhandled exceptions, external API failures
await logError({ severity: 'critical', message: ..., studioId, context })

// security_events_log: 401, 403, rate limit hits, suspicious patterns
await logSecurityEvent({ eventType: 'unauthorized_access_attempt', req, studioId })

// webhook_logs: ALL inbound webhooks (before processing)
// payment_gateway_logs: ALL Razorpay API calls (request + response)
// automation_log: ALL WhatsApp/email sends (queued + result)
// booking_activity_feed: ALL booking status changes
// background_job_logs: ALL async job start/complete/fail

// NEVER log: phone numbers, bank details, API keys, full card numbers
// NEVER log: guest selfie data
// NEVER log: encryption keys or tokens in plaintext
```

---

## 19. Environment Variables — Validation

```typescript
// lib/env.ts — import this everywhere instead of process.env
// If any required var is missing → app crashes immediately with clear message
// Not silently undefined in the middle of a payment flow

import { env } from '@/lib/env'
env.RAZORPAY_KEY_SECRET    // ✅ typed, validated
process.env.RAZORPAY_KEY_SECRET  // ❌ banned — could be undefined
```

---

## 20. Banned Patterns — Quick Reference

| Banned | Why | Use Instead |
|---|---|---|
| `@supabase/auth-helpers-nextjs` | Deprecated | `@supabase/ssr` |
| `supabase.auth.getSession()` server-side | Doesn't re-validate JWT | `getUser()` |
| `cookies().get/set/remove` individually | Breaks Supabase auth | `getAll/setAll` |
| `.select('*')` | Performance, data exposure | List columns explicitly |
| Float arithmetic on money | Precision errors | `parseFloat + toFixed(2)` |
| Razorpay amount in rupees | 100× wrong charge | Always paise `× 100` |
| Flat 18% GST | Non-compliant invoice | Split CGST/SGST or IGST |
| Hard delete financial records | Audit trail destroyed | Soft delete only |
| `process.env.X` directly | Unvalidated, may be undefined | `env.X` from `lib/env.ts` |
| `console.log` in API code | Not structured, lost in prod | `logError()` utility |
| Synchronous Immich calls | Blocks user request | `file_upload_jobs` queue |
| Storing guest selfies | DPDP Act violation | Delete after face match |
| `service_role` key client-side | Full DB bypass | Server only |
| Skip webhook signature | Payment fraud risk | Always verify HMAC |
| Skip webhook idempotency | Double payment processing | Check `webhook_logs` first |
| Schema changes without migration | Untracked, breaks team sync | `supabase migration new` |
| Files > 300 lines | Hard to maintain | Split into modules |
| Functions > 50 lines | Hard to test | Extract helpers |
| `any` type | Defeats TypeScript | `unknown` + type guards |

---

## 21. Auth — Rules

```typescript
// ALWAYS use getUser() server-side — never getSession()
// getSession() trusts the cookie without re-validating the JWT
const { data: { user } } = await supabase.auth.getUser()  // ✅
const { data: { session } } = await supabase.auth.getSession()  // ❌

// ALWAYS check auth as the FIRST line of every protected route
// Nothing runs before auth — not even body parsing
export async function POST(req: NextRequest) {
  const { user, member } = await requireAuth(req)  // ← first line always
  // ... rest of handler
}

// NEVER trust studio_id from request body or URL params
// Always derive it from the authenticated user's studio_members record
const studioId = member.studio_id  // ✅ from auth context
const studioId = body.studio_id    // ❌ never trust client-supplied

// Password requirements (validated with Zod)
// min 8 chars, at least 1 uppercase, 1 number, 1 special character
const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character')

// Failed login tracking — log to security_events_log + failed_login_attempts
// After 5 failures from same IP within 15 minutes → log 'login_blocked'
// Do NOT lock the account — just log. Rate limiting handled at middleware level.

// Session tokens — never store in localStorage
// Supabase @supabase/ssr handles cookies automatically — don't touch them

// Magic links (client portal) — always time-limited
// Default: 72 hours. After use: mark is_used = TRUE immediately.
// Never reuse a consumed magic token.

// Invitation tokens — 48 hour expiry
// On accept: create studio_member, mark invitation accepted_at
// On expiry: studio owner must resend (increment resent_count)
```

---

## 22. Scalability — Connection Pooling

```typescript
// Supabase free tier = 60 direct DB connections max
// Without pooling: 60 concurrent serverless functions = DB saturated
// With Supavisor (transaction mode): 60 connections serves ~1,200 concurrent requests

// In Supabase dashboard → Connect → Transaction pooler
// Port 6543 (NOT 5432 — that is direct connection)
// Set in .env.local:
// DATABASE_POOLER_URL=postgresql://postgres.[ref]:[pass]@[host]:6543/postgres

// Connection budget:
// Supavisor pool:  48 connections (80%)
// Auth server:      6 connections
// Admin/cron:       6 connections
// Total:           60 → serves 1,000+ concurrent users

// @supabase/ssr already uses HTTP API — not raw connections
// Raw pg/postgres connections (migrations, admin scripts): always use pooler URL
```

---

## 23. Scalability — RLS Performance

```sql
-- auth.uid() called per-row = performance killer on large tables
-- Wrap in subselect to cache result for the entire query

-- ❌ Slow — evaluated for every row
USING (studio_id = (
  SELECT studio_id FROM studio_members WHERE user_id = auth.uid()
))

-- ✅ Fast — result cached for entire query
USING (studio_id = (
  SELECT studio_id FROM studio_members WHERE user_id = (SELECT auth.uid())
))

-- Apply this fix via migration before building any feature
-- File: supabase/migrations/[timestamp]_fix_rls_performance.sql
```

---

## 24. Scalability — Query Optimization

```typescript
// 1. Always paginate — never unbounded queries
const PAGE_SIZE = 20
const { data, count } = await supabase
  .from('bookings')
  .select('id, title, event_date, status', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('event_date', { ascending: false })

// count: 'exact' is expensive — only use when showing pagination UI
// count: 'estimated' for dashboard totals (much faster)

// 2. Never N+1 — use joins
// ❌ N queries inside a loop
for (const b of bookings) { b.client = await getClient(b.client_id) }
// ✅ Single join
.select('*, clients(full_name, phone)')

// 3. Batch inserts over loops
// ❌ Insert one by one
for (const item of items) { await supabase.from('table').insert(item) }
// ✅ Single batch
await supabase.from('table').insert(items)

// 4. Use indexed columns in filters and order
// All studio_id, status, event_date, created_at columns are indexed in V2 schema
// Never filter on unindexed text columns on large tables

// 5. Dashboard counts — use revenue_snapshots table
// Never do COUNT(*) on bookings/invoices at request time for dashboard
// The daily cron populates revenue_snapshots — query that instead
const { data } = await supabase
  .from('revenue_snapshots')
  .select('total_bookings, revenue_collected, revenue_pending')
  .eq('studio_id', studioId)
  .eq('snapshot_date', today)
  .single()
```

---

## 25. Scalability — Async Processing

```typescript
// NEVER block the HTTP response for these operations:
// - PDF generation (2-3 seconds)
// - Immich photo upload + face detection (10-60 seconds)
// - WhatsApp/email sending (1-2 seconds)
// - Razorpay payment link creation (ok to await — fast)

// Pattern: log a job → return immediately → process in background
await supabase.from('background_job_logs').insert({
  job_type: 'generate_invoice_pdf',
  status: 'queued',
  studio_id: studioId,
  metadata: { invoice_id: invoice.id }
})
return Response.ok({ invoice, pdf_status: 'generating' })

// Client polls status: GET /api/v1/invoices/[id]/pdf-status
// Or use Supabase Realtime to push the update when ready

// Immich uploads — always via file_upload_jobs queue
// Never call Immich API synchronously in a route handler
```

---

## 26. Scalability — Caching

```typescript
// Private user data — NEVER cache
// bookings, invoices, payments, clients, team
headers: { 'Cache-Control': 'no-store' }

// Public gallery pages — short cache
headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }

// Rarely-changing reference data — long cache
// Subscription plans, Indian states, HSN codes
import { unstable_cache } from 'next/cache'
const getPlans = unstable_cache(
  async () => supabase.from('subscription_plans').select('*'),
  ['subscription-plans'],
  { revalidate: 3600 }
)
```

---

## 27. Migration Rules

```bash
# EVERY schema change needs a migration file — no exceptions
# Never modify the schema directly via Supabase dashboard in dev

# Create migration
npx supabase migration new descriptive_name_here
# Creates: supabase/migrations/20250315120000_descriptive_name_here.sql

# Apply locally
npx supabase db reset   # resets local DB and runs all migrations in order

# Check status
npx supabase migration list
```

```sql
-- Migration file rules:
-- 1. Always use IF NOT EXISTS / IF EXISTS for safety
-- 2. Never add NOT NULL column without a DEFAULT on an existing table
-- 3. For NOT NULL on existing table: add nullable → backfill → constrain
-- 4. Always add index for new filterable columns immediately
-- 5. Add a comment explaining WHY the change was needed

-- Example: safe NOT NULL addition
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS shoot_confirmed BOOLEAN;
UPDATE bookings SET shoot_confirmed = FALSE WHERE shoot_confirmed IS NULL;
ALTER TABLE bookings ALTER COLUMN shoot_confirmed SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN shoot_confirmed SET DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_bookings_shoot_confirmed
  ON bookings (studio_id, shoot_confirmed);
```

---

## 28. Validation — Zod Schema Location

```typescript
// All schemas in lib/validations/[module].schema.ts
// Schemas are the single source of truth — types derived from them
const createBookingSchema = z.object({ ... })
type CreateBookingInput = z.infer<typeof createBookingSchema>  // ✅
// Never define a TypeScript interface separately from its Zod schema

// Common reusable schemas in lib/validations/common.schema.ts
// amountSchema, phoneSchema, gstinSchema, uuidSchema, dateSchema, paginationSchema
// Import and compose these — never redefine the same pattern twice

// Indian-specific validations:
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile')
const gstinSchema = z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
const panSchema   = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
const ifscSchema  = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/)
const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/)
const amountSchema  = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/)
```

---

## 29. Testing — Minimum per Module

```
Before marking any module DONE, these tests must pass:

[ ] 401 — unauthenticated request rejected
[ ] 403 — authenticated but wrong studio (RLS test)
[ ] 400 — invalid input (each required field missing)
[ ] 404 — resource not found
[ ] 200/201 — happy path returns correct shape
[ ] Module-specific edge cases (e.g. GST split, quota check, idempotency)

Test files location:
  tests/unit/          ← pure logic, no DB, no HTTP (formatters, GST, crypto)
  tests/integration/   ← against local Supabase (service + repo layer)
  tests/api/           ← HTTP level via next-test-api-route-handler

Test runner: Vitest (not Jest)
Local DB: supabase start → runs on port 54321 by default
Test env: .env.test pointing to local Supabase
```

---

## 30. API Versioning — From Day One

```
All routes under /api/v1/ — no exceptions
app/api/v1/auth/
app/api/v1/studio/
app/api/v1/bookings/
...

When a breaking change is needed later:
app/api/v2/bookings/  ← new version
app/api/v1/bookings/  ← kept for any existing integrations

Set version header on all responses:
response.headers.set('X-API-Version', '1')
```

---

## 31. Fixed Backend Structure — Mandatory, Never Deviate

Every file in the backend lives in exactly one place. No exceptions.
If a file does not fit a category below, discuss before creating it.

```
studiodesk/
│
├── app/
│   └── api/
│       └── v1/                          ← ALL routes versioned from day one
│           ├── auth/
│           │   ├── login/route.ts
│           │   ├── logout/route.ts
│           │   ├── signup/route.ts
│           │   └── me/route.ts
│           ├── studio/
│           │   ├── profile/route.ts
│           │   ├── storage/route.ts
│           │   └── onboarding/
│           │       └── [step]/route.ts
│           ├── team/
│           │   ├── route.ts             ← GET list, POST invite
│           │   ├── accept/
│           │   │   └── [token]/route.ts ← public
│           │   └── [memberId]/
│           │       ├── route.ts         ← DELETE
│           │       └── role/route.ts    ← PATCH
│           ├── packages/
│           │   ├── route.ts
│           │   ├── templates/route.ts
│           │   └── [id]/route.ts
│           ├── addons/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── clients/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── leads/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── convert/route.ts
│           ├── bookings/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── activity/route.ts
│           ├── proposals/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── accept/route.ts  ← public
│           ├── contracts/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── sign/route.ts    ← public (client signs)
│           ├── invoices/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       ├── send/route.ts
│           │       ├── payment-link/route.ts
│           │       └── credit-note/route.ts
│           ├── payments/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── team/                    ← shoot assignments (reuses team folder)
│           ├── automations/
│           │   ├── settings/route.ts
│           │   └── log/route.ts
│           ├── gallery/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       ├── upload/route.ts
│           │       ├── clusters/route.ts
│           │       ├── publish/route.ts
│           │       └── [slug]/
│           │           └── lookup/route.ts ← public (guest selfie)
│           ├── portal/                  ← client portal (public, magic link)
│           │   └── [token]/route.ts
│           ├── inquiry/                 ← public lead capture form
│           │   └── route.ts
│           └── webhooks/               ← public, no auth
│               ├── razorpay/route.ts
│               └── whatsapp/route.ts
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   ← createClient() for server components + API routes
│   │   ├── client.ts                   ← createClient() for browser components
│   │   └── admin.ts                    ← createAdminClient() — service role only
│   │
│   ├── auth/
│   │   └── guards.ts                   ← requireAuth(), requireOwner()
│   │
│   ├── repositories/                   ← DB queries only, zero business logic
│   │   ├── studio.repo.ts
│   │   ├── team.repo.ts
│   │   ├── client.repo.ts
│   │   ├── lead.repo.ts
│   │   ├── booking.repo.ts
│   │   ├── proposal.repo.ts
│   │   ├── contract.repo.ts
│   │   ├── invoice.repo.ts
│   │   ├── payment.repo.ts
│   │   ├── gallery.repo.ts
│   │   └── automation.repo.ts
│   │
│   ├── services/                       ← all business logic
│   │   ├── studio.service.ts
│   │   ├── team.service.ts
│   │   ├── client.service.ts
│   │   ├── lead.service.ts
│   │   ├── booking.service.ts
│   │   ├── proposal.service.ts
│   │   ├── contract.service.ts
│   │   ├── invoice.service.ts
│   │   ├── payment.service.ts
│   │   ├── gallery.service.ts
│   │   ├── automation.service.ts
│   │   ├── immich.service.ts
│   │   └── pdf.service.ts
│   │
│   ├── validations/                    ← Zod schemas, one file per module
│   │   ├── common.schema.ts            ← shared: amount, phone, gstin, pan, ifsc
│   │   ├── studio.schema.ts
│   │   ├── team.schema.ts
│   │   ├── client.schema.ts
│   │   ├── lead.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── proposal.schema.ts
│   │   ├── contract.schema.ts
│   │   ├── invoice.schema.ts
│   │   ├── payment.schema.ts
│   │   └── gallery.schema.ts
│   │
│   ├── gst/
│   │   └── calculator.ts               ← GST calc, FY utils, HSN codes
│   │
│   ├── razorpay/
│   │   └── client.ts                   ← paise conversion, payment link, webhook verify
│   │
│   ├── immich/
│   │   └── client.ts                   ← Immich API wrapper, retry logic
│   │
│   ├── resend/
│   │   └── client.ts                   ← sendEmail(), log to email_delivery_logs
│   │
│   ├── whatsapp/
│   │   └── client.ts                   ← sendTemplate(), log to whatsapp_delivery_logs
│   │
│   ├── pdf/
│   │   └── templates/
│   │       ├── invoice.template.tsx    ← React-PDF invoice template
│   │       ├── contract.template.tsx
│   │       └── proposal.template.tsx
│   │
│   ├── crypto.ts                       ← encrypt, decrypt, hashToken, generateSecureToken
│   ├── logger.ts                       ← logError(), logSecurityEvent()
│   ├── env.ts                          ← Zod env validation, typed env object
│   ├── response.ts                     ← ok, created, error, paginated helpers
│   ├── errors.ts                       ← ServiceError + Errors factory
│   └── formatters.ts                   ← formatINR, formatIndianDate etc.
│
├── types/
│   ├── database.ts                     ← generated by supabase gen types
│   └── index.ts                        ← shared app types
│
├── middleware.ts                        ← session refresh + route protection
│
├── supabase/
│   └── migrations/                     ← one file per schema change, never manual edits
│       ├── 20250101000001_initial_schema.sql
│       ├── 20250101000002_schema_fixes.sql
│       └── 20250101000003_fix_rls_performance.sql
│
├── tests/
│   ├── setup.ts                        ← global test setup
│   ├── unit/                           ← pure logic, no DB, no HTTP
│   │   ├── gst-calculator.test.ts
│   │   ├── formatters.test.ts
│   │   ├── crypto.test.ts
│   │   └── razorpay-utils.test.ts
│   ├── integration/                    ← against local Supabase
│   │   ├── studio.service.test.ts
│   │   ├── invoice.service.test.ts
│   │   └── payment.service.test.ts
│   └── api/                            ← HTTP level via next-test-api-route-handler
│       ├── studio-profile.api.test.ts
│       ├── invoices.api.test.ts
│       └── webhooks.api.test.ts
│
└── docs/
    └── api/                            ← one .md file per module
        ├── studio.md
        ├── team.md
        ├── clients.md
        ├── leads.md
        ├── bookings.md
        ├── invoices.md
        ├── payments.md
        ├── contracts.md
        ├── proposals.md
        ├── gallery.md
        ├── automations.md
        ├── portal.md
        └── webhooks.md
```

**Structure rules:**
- A repository file touches ONLY its own DB table group — `invoice.repo.ts` never queries `bookings` directly, it imports from `booking.repo.ts`
- A service file imports from its own repo + other service files if needed — never queries DB directly
- A route handler imports from its service only — never from a repo directly
- Validation schemas live in `lib/validations/` — never inline inside route handlers
- PDF templates live in `lib/pdf/templates/` — never inline in services
- Every new module follows the same pattern: repo → service → validation → route → test → docs
- `lib/supabase/admin.ts` is only imported in: webhooks routes, cron jobs, logger.ts — nowhere else

## 32. API Documentation — Mandatory for Every Route

Every API route must be documented in `docs/api/[module].md` before that route is considered done. Documentation is written alongside the code — not after.

**File structure:**
```
docs/
  api/
    auth.md
    studio.md
    bookings.md
    clients.md
    leads.md
    invoices.md
    payments.md
    contracts.md
    proposals.md
    team.md
    gallery.md
    automations.md
    portal.md
    webhooks.md
```

**Each route must document exactly this:**

```markdown
## POST /api/v1/invoices

**Auth:** Required (any member)
**Permission:** `invoices.create`

### Request Body
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| booking_id | string (uuid) | ✅ | valid UUID | Must belong to studio |
| invoice_type | string | ✅ | advance, balance, full | |
| due_date | string | ✅ | YYYY-MM-DD | Must be future date |
| line_items | array | ✅ | min 1 item | |
| notes | string | ❌ | max 1000 chars | Client-visible |

### Response — 201 Created
```json
{
  "data": {
    "id": "uuid",
    "invoice_number": "INV-FY2526-0001",
    "status": "draft",
    "subtotal": "10000.00",
    "cgst_amount": "900.00",
    "sgst_amount": "900.00",
    "igst_amount": "0.00",
    "total_amount": "11800.00",
    "payment_link_url": null
  }
}
```

### Error Responses
| Status | Code | When |
|--------|------|------|
| 401 | UNAUTHORIZED | No auth token |
| 403 | FORBIDDEN | Booking belongs to different studio |
| 404 | NOT_FOUND | booking_id does not exist |
| 400 | VALIDATION_ERROR | Invalid input |
| 422 | QUOTA_EXCEEDED | Studio storage limit reached |

### Side Effects
- Creates invoice_line_items rows
- Logs to booking_activity_feed (event: advance_invoice_sent)
- Triggers automation: advance_payment_reminder (scheduled 3 days before due_date)

### Notes
- invoice_number auto-generated by DB trigger (do not pass in request)
- GST type (cgst_sgst vs igst) auto-detected from studio + client state codes
- For credit notes: use POST /api/v1/invoices/[id]/credit-note instead
```

**Documentation rules:**
- Write the doc at the same time as the route — not later
- Every field in request body must be in the table — no undocumented fields
- Every possible error code must be listed
- Side effects section is mandatory — what else changes in the DB or triggers
- If a route has special business logic (GST split, idempotency, quota check) — explain it in Notes
- Keep docs in sync — if the route changes, the doc changes in the same commit