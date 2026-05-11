# StudioDesk - Stage-Wise Implementation Plan

> Generated from full repo scan. Follows plan.md, Backend_rules.md, frontend rules.md, and ui.md (Artisan design system).
> Priority: Ship a production-ready studio-facing app first, then platform/SaaS features, then extended features.

---

## STAGE 0 - FOUNDATION (Do this first, blocks everything)

**Goal:** Remove mock data infrastructure, set up typed API layer, establish binding patterns.

### 0.1 - API Client Layer
- Audit `lib/api.ts` - ensure every backend endpoint has a typed fetcher
- Create `lib/portal-api.ts` for portal-specific calls (if not present)
- Create `types/api.ts` for all API response/request types
- Ensure ZERO `any` types in API layer
- Add proper error normalization (map HTTP status -> user-facing messages)

### 0.2 - Remove Global Mock Data
- Find and remove all mock/hardcoded data arrays across components
- Remove fallback-to-mock patterns in all components
- Replace with proper loading/error/empty states

### 0.3 - Shared UI Patterns
- Create `components/shared/EmptyState.tsx` - consistent empty state for all lists
- Create `components/shared/DataSkeleton.tsx` - section-level skeleton
- Verify all components follow Artisan UI (ui.md): `rounded-sm`/`rounded-md`, `border-border/60`, `shadow-sm`, monochromatic, no gradients
- Fix BillingSettings.tsx - remove gradient backgrounds, rounded-2xl, glow effects (violates Artisan UI rules)

### 0.4 - Form Infrastructure
- Verify react-hook-form + Zod + shadcn pattern works end-to-end
- Ensure all validation schemas exist in `lib/validations/` for every module
- Create shared form submit handler with toast notifications

**Exit criteria:** `npx tsc --noEmit` passes with 0 errors, no mock data in any component, API layer fully typed.

---

## STAGE 1 - CORE STUDIO MODULES (API binding per plan.md)

**Goal:** Bind every existing studio frontend page to real backend. This is the plan.md execution.

**Order matters:** Dashboard first (most visible), then transactional modules, then settings.

### 1.1 - Dashboard (highest visibility)
**Backend:** `GET /api/v1/dashboard/overview`, `GET /api/v1/dashboard/today`
**Frontend:** `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/page.tsx`
**Components:** `components/dashboard/GreetingSection.tsx`, dashboard overview cards

Tasks:
- Bind real overview cards (bookings count, revenue, outstanding, today's shoots)
- Bind today's shoot strip with real data
- Build recent bookings/activity panel from `/api/v1/bookings` (limit 5-10)
- Build payment/outstanding summaries from `/api/v1/finance/outstanding`
- Build quick insights section from available backend data
- Remove legacy dead API calls (old summary/pipeline/upcoming/action routes)
- GreetingSection: bind real user name from `/api/v1/auth/me`
- Show real studio plan/usage data (remove placeholder)

### 1.2 - Bookings
**Backend:** `GET/POST /api/v1/bookings`, `GET/PATCH /api/v1/bookings/[id]`, `[id]/status`, `[id]/activity`, `[id]/assignments`, `[id]/shoot-brief`
**Frontend:** `app/(dashboard)/bookings/page.tsx`, `app/(dashboard)/bookings/[id]/page.tsx`

Tasks:
- Bookings list with real data, filters (status, date range, event type), search
- Booking detail page with real data binding
- Create booking flow - rebuild form around real backend contract (client linkage, title, event metadata, dates, package references)
- Edit booking flow - same contract alignment
- Status update action wired to `[id]/status`
- Activity feed wired to `[id]/activity`
- Assignments panel wired to `[id]/assignments`
- Shoot brief panel wired to `[id]/shoot-brief`
- Remove legacy call patterns (`/bookings/[id]/stage`, `/bookings/[id]/notes`)
- Loading skeletons matching real list/detail layout
- Empty state when no bookings exist

### 1.3 - Clients
**Backend:** `GET/POST /api/v1/clients`, `GET/PATCH /api/v1/clients/[id]`
**Frontend:** `app/(dashboard)/clients/page.tsx`, `app/(dashboard)/clients/[id]/page.tsx`

Tasks:
- Client list with real data, search, filters
- Client create/update forms bound to API
- Client detail with real data
- Booking linkage on client detail (filter bookings by client_id)
- Invoice/payment linkage on client detail (filter invoices by client_id)
- Remove mock communication/timeline panels OR disable if no backend support
- Remove mock notes/timelines

### 1.4 - Finance (Invoices + Payments)
**Backend:** `/api/v1/finance/summary`, `/api/v1/finance/outstanding`, `/api/v1/finance/mark-overdue`, `/api/v1/invoices/*`, `/api/v1/payments/*`
**Frontend:** `app/(dashboard)/finance/page.tsx`

Tasks:
- Finance summary dashboard bound to `/api/v1/finance/summary`
- Outstanding list bound to `/api/v1/finance/outstanding`
- Invoice list with real data, filters (status, date range)
- Invoice create/update forms with real API binding
- Invoice detail page with line items, totals, payment history
- Invoice send action (`POST /api/v1/invoices/[id]/send`)
- Payment link generation (`POST /api/v1/invoices/[id]/payment-link`)
- Record payment action (`POST /api/v1/invoices/[id]/record-payment`)
- Credit note action (`POST /api/v1/invoices/[id]/credit-note`)
- Payments list with real data
- Mark overdue action (`POST /api/v1/finance/mark-overdue`)
- Remove all mock invoice/payment rows
- INR formatting: Indian comma format in tables, compact in KPI cards

### 1.5 - Gallery
**Backend:** `GET/POST /api/v1/galleries`, `GET/PATCH /api/v1/galleries/[id]`, `[id]/upload`, `[id]/upload-status`, `[id]/publish`, `[id]/share`, `[id]/clusters`, `[id]/clusters/[cid]`
**Frontend:** `app/(dashboard)/gallery/page.tsx`, `app/(dashboard)/gallery/[id]/page.tsx`

Tasks:
- Gallery list with real data from `/api/v1/galleries`
- Gallery detail with real data
- Upload flow: create upload job -> file upload -> poll `[id]/upload-status`
- Upload progress indicator (polling-based)
- Publish action wired to `[id]/publish`
- Share action wired to `[id]/share`
- Face clusters list wired to `[id]/clusters`
- Cluster detail wired to `[id]/clusters/[cid]`
- Remove singular `gallery` endpoint assumptions
- Remove mock galleries/photos
- Handle upload errors gracefully (retry, partial failure)

### 1.6 - Team
**Backend:** `GET /api/v1/team`, `POST /api/v1/team/invite`, `GET/PATCH /api/v1/team/[memberId]`, `[memberId]/role`, `[memberId]/assignments`, `GET /api/v1/team/schedule`
**Frontend:** `app/(dashboard)/team/page.tsx`, `app/(dashboard)/team/[id]/page.tsx`

Tasks:
- Team member list with real data
- Team member detail with real data
- Invite member form wired to `POST /api/v1/team/invite`
- Role update wired to `PATCH /api/v1/team/[memberId]/role`
- Assignments view wired to `[memberId]/assignments`
- Schedule view wired to `GET /api/v1/team/schedule`
- Remove mock member data
- Disable/hide blocked features with explicit messaging:
  - Payouts (no backend route)
  - Conflicts (no backend route)
  - Bank details (no backend route)

### 1.7 - Analytics
**Backend:** `GET /api/v1/analytics/revenue`, `GET /api/v1/analytics/bookings`, `GET /api/v1/analytics/performance`
**Frontend:** `app/(dashboard)/analytics/page.tsx`

Tasks:
- Replace placeholder shell with real tab routing
- Revenue analytics chart bound to `/api/v1/analytics/revenue`
- Booking analytics chart bound to `/api/v1/analytics/bookings`
- Performance metrics bound to `/api/v1/analytics/performance`
- Build chart adapters that transform backend responses to chart-friendly types
- Remove hardcoded arrays and fake KPI data
- Dynamic import recharts (bundle optimization per frontend rules)
- Remove gallery/team analytics tabs if backend doesn't support them
- Empty states for charts with no data

### 1.8 - Settings (all sections)
**Backend:** `/api/v1/studio/profile`, `/api/v1/studio/storage`, `/api/v1/settings/notifications`, `/api/v1/settings/billing`, `/api/v1/settings/integrations`, `/api/v1/settings/integrations/test`
**Frontend:** `/settings`, `/settings/studio`, `/settings/owner`, `/settings/finance`, `/settings/notifications`, `/settings/integrations`, `/settings/billing`, `/settings/danger`, `/settings/packages`

Tasks:
- Studio profile settings: initial load from `/api/v1/studio/profile`, update via `PATCH /api/v1/studio/profile`
- Owner profile settings: load from `/api/v1/auth/me`
- Storage settings: load from `GET /api/v1/studio/storage`, update via `PUT /api/v1/studio/storage`
- Package settings: bind to existing `/api/v1/packages` and `/api/v1/packages/templates`
- Notifications settings: load/update via `/api/v1/settings/notifications`
- Billing settings: load/update via `/api/v1/settings/billing`
  - **Replace mock billing card** (BillingSettings.tsx) with real subscription/usage data
  - Remove hardcoded payment history - bind to real billing API
  - Remove gradient/rounded-2xl styling (Artisan UI violation)
- Integrations settings: load/update via `/api/v1/settings/integrations`
- Integration test action: `POST /api/v1/settings/integrations/test`
- Remove all hardcoded defaults and console-only submit handlers
- Verify mutation payload shapes field-by-field for each form
- Remove local package fixtures and static form defaults

### 1.9 - Leads
**Backend:** `GET/POST /api/v1/leads`, `GET/PATCH /api/v1/leads/[id]`, `POST /api/v1/leads/[id]/convert`
**Frontend:** `app/(dashboard)/leads/page.tsx`

Tasks:
- Leads list with real data, filters (status, source, date)
- Lead detail with real data
- Lead conversion flow wired to `POST /api/v1/leads/[id]/convert`
- Status progression via update endpoint
- Navigation entry in studio sidebar
- Empty state for no leads

### 1.10 - Proposals
**Backend:** `GET/POST /api/v1/proposals`, `GET/PATCH /api/v1/proposals/[id]`, `POST /api/v1/proposals/[id]/send`
**Frontend:** `app/(dashboard)/proposals/page.tsx`

Tasks:
- Proposal list with real data, filters (status, date)
- Proposal detail with line items, pricing, client/booking references
- Proposal create form with line items builder
- Proposal send action wired to `POST /api/v1/proposals/[id]/send`
- Status tracking in studio UI
- Verify proposal line items and pricing fields before binding
- Public proposal view stays out of scope

### 1.11 - Contracts
**Backend:** `GET/POST /api/v1/contracts`, `GET/PATCH /api/v1/contracts/[id]`, `POST /api/v1/contracts/[id]/send`, `POST /api/v1/contracts/[id]/remind`
**Frontend:** `app/(dashboard)/contracts/page.tsx`

Tasks:
- Contract list with real data, filters (status, date)
- Contract detail with signer info, booking/client relation, document state
- Contract create form
- Contract send action
- Reminder action in studio UI
- Verify request/response structures for all actions
- Public sign/view token flows stay out of scope

### 1.12 - Addons (management completion)
**Backend:** `GET/POST /api/v1/addons`, `GET/PATCH/DELETE /api/v1/addons/[id]`
**Frontend:** `app/(dashboard)/addons/page.tsx`

Tasks:
- Addon list with real data
- Addon create/edit forms wired to API
- Addon delete with confirmation
- Verify addon pricing and package relation fields
- Integration into booking/package forms after CRUD is stable

**Exit criteria:** Every studio module page loads real data, zero mock data remaining, all CRUD actions functional, loading/error/empty states present on every page, dark mode tested.

---

## STAGE 2 - CUSTOMER PORTAL COMPLETION

**Goal:** Complete the client-facing portal so studios can share it with their customers.

**Backend exists:** `/api/v1/portal/[token]`, `[token]/invoices`, `[token]/gallery`, `[token]/contracts`, `[token]/pay`, `send-link`
**Frontend exists:** `/portal/[studioSlug]/...` (7 pages)

Tasks:
- Portal login page: authenticate via magic token
- Portal dashboard: show client overview (upcoming shoots, recent invoices, galleries)
- Portal invoices: list + detail with payment capability
- Portal payments: wire `POST /api/v1/portal/[token]/pay` to Razorpay checkout
- Portal gallery: list + detail with photo viewing, face-cluster-based lookup
- Portal bookings: show upcoming/past booking details
- Portal proposals: view proposal with accept action
- Portal contracts: view contract with sign action
- All pages use `lib/portal-api.ts` (separate from studio API)
- Portal session completely separate from studio session (security rule)
- Loading skeletons for all portal pages
- Error boundaries for all portal pages
- Mobile-responsive (portal is primarily viewed on phones)
- INR formatting for all amounts
- Date formatting per India-specific rules

**Exit criteria:** Full client journey works - login, view invoices, pay, view gallery, view bookings, view/accept proposals, view/sign contracts.

---

## STAGE 3 - BACKEND API GAPS (Studio-facing)

**Goal:** Build missing backend routes that studio frontend modules need.

### 3.1 - Automations Frontend
**Backend exists** (6 routes): settings, stats, log, templates, test, trigger
**Frontend:** Does not exist

Tasks:
- Create `/settings/automations` page
- Automation list with status, templates
- Automation settings toggle on/off
- Automation log viewer
- Test automation trigger
- Stats dashboard for automations
- Follow Artisan UI patterns

### 3.2 - Contract Templates UI
**Backend exists:** `/api/v1/contract-templates`, `/api/v1/contract-templates/[id]`
**Frontend:** Does not exist

Tasks:
- Create `/settings/contract-templates` page
- Template list, create, edit, delete
- Integration with contract create flow (select template)

### 3.3 - Shoot Brief UI
**Backend exists:** `GET /api/v1/bookings/[id]/shoot-brief`
**Frontend:** Does not exist (shown as panel within booking detail)

Tasks:
- Add shoot brief panel/section to booking detail page
- Display brief data from backend

### 3.4 - Inquiry Form (Public)
**Backend exists:** `POST /api/v1/inquiry`
**Frontend:** Does not exist

Tasks:
- Create public inquiry form page (no auth required)
- Form with name, email, phone, event type, date, message
- Zod validation
- Submit to `POST /api/v1/inquiry`
- Success/thank you page
- Follow Artisan UI patterns
- Can be embedded on studio's public gallery page

### 3.5 - Missing Backend Routes (if frontend needs them)
Audit whether these are needed by frontend:
- `GET /api/v1/analytics/clients` (mentioned in plan.md but route doesn't exist)
- `DELETE /api/v1/invoices/[id]` (if UI needs delete)
- `DELETE /api/v1/payments/[id]` (if UI needs delete)
- Any other endpoint the frontend expects but backend doesn't provide

**Exit criteria:** All studio-facing backend needs are met. No dead frontend buttons pointing to nonexistent endpoints.

---

## STAGE 4 - SAAS SUBSCRIPTION BILLING

**Goal:** Build the platform-level subscription system so StudioDesk can bill studios.

**DB tables exist:** `subscription_plans`, `subscription_events`, `platform_subscription_invoices`, `billing_history`, `promo_codes`, `referral_codes`, `referral_redemptions`, `platform_settings`

### 4.1 - Subscription Backend Routes
Create API routes under `/api/v1/subscription/`:
- `GET /plans` - List available plans (public, cacheable)
- `GET /subscription` - Get current studio subscription
- `POST /subscription` - Create subscription (trial or paid)
- `POST /subscription/upgrade` - Upgrade plan
- `POST /subscription/downgrade` - Downgrade plan
- `POST /subscription/cancel` - Cancel subscription
- `POST /subscription/resume` - Resume cancelled subscription
- `GET /subscription/invoices` - Studio's subscription invoices
- `GET /subscription/usage` - Current usage vs plan limits
- `POST /subscription/promo` - Apply promo code
- `GET /billing-history` - Billing history for studio
- `POST /webhooks/razorpay-subscription` - Razorpay subscription webhooks

### 4.2 - Subscription Service Layer
- `lib/services/subscription.service.ts` - Plan management, upgrades, downgrades
- `lib/services/billing.service.ts` - Invoicing studios for subscriptions
- Integrate with Razorpay for recurring payments / subscription mandates
- Usage limit enforcement (team members, storage, bookings)
- Trial management (start, end, conversion to paid)
- Plan change proration calculations
- Event logging to `subscription_events`

### 4.3 - Subscription Frontend (Studio Settings)
Replace mock BillingSettings.tsx with real subscription management:
- Current plan display with tier badge
- Usage bars against plan limits (team, storage, bookings, clients)
- Upgrade/downgrade flow with plan comparison
- Payment method management via Razorpay
- Billing history table (real data)
- Apply promo code input
- Cancel/resume subscription actions
- Trial status and countdown (if applicable)

### 4.4 - Plan Activation on Signup/Onboarding
- Integrate plan selection into studio signup flow
- Default trial activation on studio creation
- Onboarding step for plan configuration
- Usage limit enforcement in all other modules (block actions when over limit)

**Exit criteria:** Studio can sign up, get trial, upgrade to paid, pay via Razorpay, view billing history, manage subscription. Usage limits enforced across all modules.

---

## STAGE 5 - PLATFORM ADMIN (Super Admin)

**Goal:** Build the platform admin system for managing studios, subscriptions, and platform health.

**DB tables exist:** `platform_admins`, `admin_sessions`, `admin_audit_logs`, `studio_impersonation_log`, `platform_settings`, `support_notes`, `v_platform_studio_health`

### 5.1 - Admin Auth
- Separate admin login route (`/admin/login`)
- Admin auth guard (different from studio auth)
- Admin session management
- Admin audit logging on every action

### 5.2 - Admin Backend Routes
Create API routes under `/api/v1/admin/`:
- `GET /dashboard` - Platform overview (studio count, revenue, active subscriptions)
- `GET /studios` - List all studios with filters
- `GET /studios/[id]` - Studio detail
- `POST /studios/[id]/suspend` - Suspend studio
- `POST /studios/[id]/reactivate` - Reactivate studio
- `POST /studios/[id]/impersonate` - Start impersonation
- `POST /admin/stop-impersonate` - End impersonation
- `GET /subscriptions` - Platform subscription overview
- `POST /plans` - Create/update subscription plans
- `GET /settings` - Platform settings
- `PUT /settings` - Update platform settings
- `GET /studios/[id]/support-notes` - View support notes
- `POST /studios/[id]/support-notes` - Add support note
- `GET /health` - Platform health dashboard (using `v_platform_studio_health`)
- `GET /audit-logs` - Admin audit log viewer

### 5.3 - Admin Frontend
Create separate admin app or route group:
- `app/(admin)/admin/` - Admin route group
- Admin dashboard: studio count, revenue, active subscriptions, health metrics
- Studios list: search, filter, sort, suspend/reactivate
- Studio detail: view settings, subscription, usage, support notes
- Impersonation flow: start/stop, visual indicator when impersonating
- Plan management: CRUD for subscription plans
- Platform settings: GSTIN, SAC codes, platform-wide config
- Audit log viewer
- Support notes interface
- Completely separate UI from studio (different layout, different nav)

**Exit criteria:** Admin can log in, view all studios, inspect studio details, suspend/reactivate, impersonate, manage plans, view audit logs, add support notes.

---

## STAGE 6 - ADVANCED FEATURES (Post-MVP)

**Priority-ordered within stage. Each feature is independent.**

### 6.1 - Referral System (DB exists, needs implementation)
- Backend: `/api/v1/referral` routes (generate, apply, track redemption)
- Frontend: referral code display in settings, apply promo/referral input
- Service: referral tracking, commission calculation
- Tables: `referral_codes`, `referral_redemptions`

### 6.2 - Feature Flags Management (DB exists)
- Backend: `/api/v1/admin/feature-flags` CRUD routes
- Frontend: admin panel for feature flag management
- Service: feature flag evaluation middleware
- Table: `feature_flags`

### 6.3 - API Key Management for Studios (DB exists)
- Backend: `/api/v1/settings/api-keys` CRUD routes
- Frontend: `/settings/api-keys` page
- Service: API key generation, validation, rate limiting per key
- Table: `api_keys`

### 6.4 - WhatsApp Templates Management (DB exists)
- Backend: `/api/v1/settings/whatsapp-templates` CRUD routes
- Frontend: template list, create, edit in settings
- Integration with WhatsApp Business API
- Table: `whatsapp_templates`

### 6.5 - Email Templates Management (DB exists)
- Backend: `/api/v1/settings/email-templates` CRUD routes
- Frontend: template list, create, edit in settings
- Integration with Resend (already in codebase)
- Table: `email_templates`

### 6.6 - Notifications System (DB exists)
- Backend: `/api/v1/notifications` routes (list, mark read, mark all read)
- Frontend: notification bell in header, notifications dropdown page
- Real-time via polling or WebSocket
- Table: `notifications`

### 6.7 - Data Export / GDPR (DB exists)
- Backend: `/api/v1/settings/data-export` routes
- Frontend: export request form in settings
- Async job processing, email notification on completion
- Table: `data_export_requests`

### 6.8 - Photo Comments & Favorites (DB exists)
- Backend: `/api/v1/galleries/[id]/photos/[photoId]/comments` CRUD
- Backend: `/api/v1/galleries/[id]/photos/[photoId]/favorite` toggle
- Frontend: comment sidebar in gallery detail, favorite button on photos
- Tables: `photo_comments`, `photo_favorites`

### 6.9 - Gallery Videos (DB exists)
- Backend: extend gallery routes for video support
- Frontend: video player in gallery detail
- Table: `gallery_videos`

### 6.10 - Contract Clause Library (DB exists)
- Backend: `/api/v1/contract-clauses` CRUD routes
- Frontend: clause library in settings, insert into contract builder
- Table: `contract_clause_library`

### 6.11 - Member Unavailability Tracking (DB exists)
- Backend: `/api/v1/team/unavailability` CRUD routes
- Frontend: availability calendar in team section
- Table: `member_unavailability`

### 6.12 - NPS Responses (DB exists)
- Backend: `/api/v1/nps` routes (send survey, view responses)
- Frontend: NPS dashboard in analytics
- Table: `nps_responses`

### 6.13 - Inquiry Form Configuration (DB exists)
- Backend: `/api/v1/settings/inquiry-form` CRUD routes
- Frontend: form builder in settings
- Table: `inquiry_form_configs`

### 6.14 - Freelancer Payments (DB exists)
- Backend: `/api/v1/freelancers` routes (CRUD, payments)
- Frontend: freelancer management page in finance or team
- Table: `freelancer_payments`

### 6.15 - Expenses Module (DB exists, was blocked)
- **Unblock:** Build backend expense routes
- Backend: `/api/v1/expenses` CRUD routes
- Backend: `/api/v1/expenses/categories` routes
- Frontend: `/finance/expenses` page
- Table: `expense_tracking`

**Exit criteria:** Each feature is independently complete (backend + frontend), follows all project rules, and passes type checking.

---

## STAGE 7 - POLISH & PRODUCTION READINESS

**Goal:** Make the product production-ready with proper UX polish, performance, and reliability.

### 7.1 - PWA Support
- Service worker for offline caching
- Manifest.json for install prompt
- Cache static assets for offline portal access
- Push notifications (future)

### 7.2 - Performance Optimization
- Audit all pages with Lighthouse
- Optimize bundle size (dynamic imports, tree shaking)
- Add proper caching headers per route type (per Backend_rules.md)
- Verify RLS performance fix is applied (subselect pattern)
- Add database indexes for common query patterns
- Optimize image loading (next/image with proper sizes)

### 7.3 - Error Monitoring
- Sentry or equivalent error tracking
- Backend error logging to `error_logs` table
- Frontend error boundaries with user-friendly fallbacks
- API error response standardization

### 7.4 - Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader testing
- Color contrast verification (especially in dark mode)

### 7.5 - Mobile Responsiveness
- Test all pages at 390px width
- Mobile navigation (drawer menu)
- Touch-friendly interactions
- Mobile-optimized tables (horizontal scroll or card layout)

### 7.6 - SEO & Public Pages
- Meta tags for public gallery pages
- Open Graph tags for gallery sharing
- Sitemap generation
- Public inquiry form SEO

### 7.7 - Testing
- E2E tests for critical flows (booking creation, invoice payment, gallery upload)
- Integration tests for service layer
- Unit tests for utilities (GST calc, formatting)

**Exit criteria:** Lighthouse scores >90 on all metrics, zero accessibility violations, all pages responsive at 390px, error monitoring active, E2E tests for critical paths.

---

## IMPLEMENTATION ORDER SUMMARY

```
Stage 0  - Foundation (API layer, remove mocks, UI patterns)
Stage 1  - Core studio module API binding (12 modules)
Stage 2  - Customer portal completion
Stage 3  - Backend API gaps (automations UI, contract templates, inquiry form)
Stage 4  - SaaS subscription billing (plans, payments, usage limits)
Stage 5  - Platform admin (super admin dashboard, studio management)
Stage 6  - Advanced features (15 independent features, priority-ordered)
Stage 7  - Polish & production readiness (PWA, performance, accessibility, testing)
```

## HARD RULES (Apply to every stage)

1. Follow 3-layer architecture (route -> service -> repository) for all backend
2. Follow frontend rules: server components for pages, SWR for client data, skeletons for loading
3. Follow Artisan UI: monochromatic, `rounded-sm`/`rounded-md`, `border-border/60`, no gradients/glows
4. India-specific: INR formatting, date format, phone format, placeholder names
5. Zero `any` types, zero inline styles, zero hardcoded colors
6. Every page: loading.tsx, error.tsx, empty state, dark mode, mobile responsive
7. Every form: react-hook-form + Zod + shadcn, validation schemas in `lib/validations/`
8. Every API call: through typed API layer, never direct fetch in components
9. `npx tsc --noEmit` must pass with 0 errors before every commit
10. No mock data in production - loading/error/empty states instead

## BLOCKED FEATURES (Do not implement until backend routes exist)

- Team payouts (no backend route)
- Team conflicts (no backend route)
- Team bank details (no backend route)
- Client communication history (no dedicated endpoint)

These stay blocked until explicitly unblocked. Do not build mock behavior.
