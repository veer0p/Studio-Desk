# Studio-Desk Knowledge Index

## Architecture

| Layer | Stack | Path |
|---|---|---|
| **Backend API** | Next.js 15 App Router, TypeScript, Supabase (PostgreSQL + RLS) | `backend/studiodesk/` |
| **Frontend Web** | Next.js 15 App Router, React 19, SWR, Tailwind, shadcn/ui | `frontend/studiodesk-web/` |
| **Database** | PostgreSQL 16 via Supabase, Row-Level Security | `backend/studiodesk/supabase/` |
| **Payments** | Razorpay (payment links, webhooks, UPI) | `backend/studiodesk/lib/razorpay/` |
| **Email** | Resend API | `backend/studiodesk/lib/resend/` |
| **DAMS** | Immich (self-hosted photo/video management) | `backend/studiodesk/lib/services/immich.service.ts` |
| **PDF Gen** | @react-pdf/renderer | `backend/studiodesk/lib/services/pdf.service.tsx` |
| **Validation** | Zod (both backend and frontend) | `*/validations/` |
| **Testing** | Vitest (unit + integration + API) | `backend/studiodesk/tests/` |

## Folder Map

| Path | Responsibility | Tech | `.ai.md` Status |
|------|---------------|------|-----------------|
| `backend/studiodesk/` | Backend root config (middleware, vitest, tailwind) | TS | ✅ |
| `backend/studiodesk/app/` | Backend app root (layout, page) | TS | ✅ |
| `backend/studiodesk/app/api/v1/` | REST API: 95 route handlers | TS | ✅ (parent) |
| `backend/studiodesk/app/api/v1/*/` | Individual route folders (95 dirs) | TS | 📋 (documented by parent) |
| `backend/studiodesk/lib/services` | Business logic: 21 domain services | TS | ✅ |
| `backend/studiodesk/lib/repositories` | Data access: 15 Supabase repos | TS | ✅ |
| `backend/studiodesk/lib/validations` | Zod schemas: 53 input validators | TS | ✅ |
| `backend/studiodesk/lib/supabase` | Client factories (admin/server/browser) | TS | ✅ |
| `backend/studiodesk/lib` | Utilities: crypto, errors, logging, rate-limit, formatting | TS | ✅ |
| `backend/studiodesk/lib/email` | Email client wrapper (SMTP/Resend) | TS | ✅ |
| `backend/studiodesk/lib/gst` | GST calculator (Indian tax) | TS | ✅ |
| `backend/studiodesk/lib/razorpay` | Razorpay SDK wrapper | TS | ✅ |
| `backend/studiodesk/lib/resend` | Resend email SDK wrapper | TS | ✅ |
| `backend/studiodesk/lib/auth` | Auth guards (requireAuth, requireOwner) | TS | ✅ |
| `backend/studiodesk/lib/api` | Route helpers (error handling, param resolution) | TS | ✅ |
| `backend/studiodesk/lib/whatsapp` | WhatsApp messaging client | TS | ✅ |
| `backend/studiodesk/types` | DB types (80+ tables, 35 enums), Supabase adapter | TS | ✅ |
| `backend/studiodesk/supabase` | Seed scripts + MCP Edge Function | TS | ✅ |
| `backend/studiodesk/scripts` | VPS ops, type gen, DB migrations (13 scripts) | TS/JS | ✅ |
| `backend/studiodesk/tests` | Vitest test suite root | TS | ✅ |
| `backend/studiodesk/tests/unit` | Unit tests: 22 files, ~163 cases | TS | ✅ |
| `backend/studiodesk/tests/api` | API route tests: 9 files, ~84 cases | TS | ✅ |
| `backend/studiodesk/tests/integration` | Integration tests: 18 files, ~311 cases | TS | ✅ |
| `backend/studiodesk/tests/integration/helpers` | Test fixtures (4 files) | TS | ✅ |
| `backend/studiodesk/tests/deep` | Deep/E2E smoke tests: 17 files | TS | ✅ |
| `backend/studiodesk/tests/helpers` | Test utilities: 6 files | TS | ✅ |
| `frontend/studiodesk-web/` | Frontend root config | TS | ✅ |
| `frontend/studiodesk-web/app` | Next.js pages: auth, dashboard, portal, gallery, onboarding | TSX | ✅ (parent) |
| `frontend/studiodesk-web/app/*/` | Individual page folders (50+ dirs) | TSX | 📋 (documented by parent) |
| `frontend/studiodesk-web/components` | React components: 188 files across 12 domains | TSX | ✅ (parent) |
| `frontend/studiodesk-web/components/dashboard/` | Dashboard shell, stats, pipeline | TSX | ✅ |
| `frontend/studiodesk-web/components/analytics/` | Analytics shell, period selector | TSX | ✅ |
| `frontend/studiodesk-web/components/analytics/tabs/` | Revenue, booking, client, gallery, team tabs | TSX | ✅ |
| `frontend/studiodesk-web/components/bookings/` | Bookings shell, mobile detail | TSX | ✅ |
| `frontend/studiodesk-web/components/bookings/kanban/` | Kanban board, column, card | TSX | ✅ |
| `frontend/studiodesk-web/components/bookings/slideover/` | SlideOver, tabs | TSX | ✅ |
| `frontend/studiodesk-web/components/clients/` | Client shell, grid, table, detail, dialogs | TSX | ✅ |
| `frontend/studiodesk-web/components/clients/tabs/` | Overview, bookings, finance, communication, docs | TSX | ✅ |
| `frontend/studiodesk-web/components/contracts/` | Contract list, shell, create dialog | TSX | ✅ |
| `frontend/studiodesk-web/components/crm/` | Client directory, lightning nodes, mission control | TSX | ✅ |
| `frontend/studiodesk-web/components/finance/` | Finance shell, summary bar, payment collection | TSX | ✅ |
| `frontend/studiodesk-web/components/finance/invoices/` | Invoice list, detail, preview, create | TSX | ✅ |
| `frontend/studiodesk-web/components/finance/shared/` | GST breakdown, payment method badge | TSX | ✅ |
| `frontend/studiodesk-web/components/gallery/` | Gallery hub, lightbox, proofing overlay | TSX | ✅ |
| `frontend/studiodesk-web/components/gallery/studio/` | Studio gallery CRUD, upload, face clustering | TSX | ✅ |
| `frontend/studiodesk-web/components/gallery/client/` | Client gallery, photo grid, access gate | TSX | ✅ |
| `frontend/studiodesk-web/components/leads/` | Leads shell, kanban, list, card, new dialog | TSX | ✅ |
| `frontend/studiodesk-web/components/marketing/` | Hero, nav, category cards, demo, social proof | TSX | ✅ |
| `frontend/studiodesk-web/components/onboarding/` | Wizard, steps, progress | TSX | ✅ |
| `frontend/studiodesk-web/components/onboarding/steps/` | 5 step components | TSX | ✅ |
| `frontend/studiodesk-web/components/portal/` | Portal shell, nav, login | TSX | ✅ |
| `frontend/studiodesk-web/components/proposals/` | Proposal shell, list, create dialog | TSX | ✅ |
| `frontend/studiodesk-web/components/settings/` | Settings shell, nav, layout, sections | TSX | ✅ |
| `frontend/studiodesk-web/components/settings/sections/` | 8 settings section components | TSX | ✅ |
| `frontend/studiodesk-web/components/team/` | Team shell | TSX | ✅ |
| `frontend/studiodesk-web/components/team/members/` | Member list, card, detail, edit, invite | TSX | ✅ |
| `frontend/studiodesk-web/components/team/schedule/` | Team schedule calendar, conflicts | TSX | ✅ |
| `frontend/studiodesk-web/components/ui/` | shadcn/ui primitives | TSX | ✅ |
| `frontend/studiodesk-web/components/shared/` | Shared utility components | TSX | ✅ |
| `frontend/studiodesk-web/components/skeletons/` | Loading skeleton components | TSX | ✅ |
| `frontend/studiodesk-web/components/layout/` | Header, sidebar, bottom-nav | TSX | ✅ |
| `frontend/studiodesk-web/components/addons/` | Addon list, shell | TSX | ✅ |
| `frontend/studiodesk-web/lib` | API fetchers, auth, formatting, constants | TS | ✅ |
| `frontend/studiodesk-web/lib/supabase` | Browser/server Supabase clients | TS | ✅ |
| `frontend/studiodesk-web/lib/validations` | Zod form schemas (5 files) | TS | ✅ |
| `frontend/studiodesk-web/hooks` | Custom React hooks (useAuth) | TS | ✅ |

**Legend**: ✅ = Full `.ai.md` with detailed docs | 📋 = Documented by parent `.ai.md` (thin stub sufficient)

## Critical Data Flows

### 1. Lead → Payment (Revenue Pipeline)
```
Inquiry Form → Lead (pipeline) → Proposal → Contract → Booking → Invoice → Payment (Razorpay)
   ↓                ↓                  ↓           ↓           ↓           ↓            ↓
/api/v1/inquiry  /leads/*         /proposals/*  /contracts/*  /bookings/*  /invoices/*  /payments/*
   ↓                ↓                  ↓           ↓           ↓           ↓            ↓
LeadService    LeadService      ProposalService  ContractService  BookingService  InvoiceService  PaymentService
```

### 2. Upload → Delivery (Gallery Pipeline)
```
Photo Upload → Immich Upload → Face Detection → Clustering → Labeling → Public Gallery → Client Viewing
     ↓              ↓               ↓              ↓           ↓           ↓                  ↓
queuePhotoUpload  createAlbum    waitForFace    getFace     labelFace   publishGallery     getPublicGallery
                  uploadAsset    Detection      Clusters    Person      getShareInfo       guestSelfieLookup
```

### 3. Auth Everywhere
```
Login → JWT Session → Middleware → Supabase RLS → studio_id scope → Tenant Isolation
  ↓         ↓            ↓             ↓                ↓
AuthService  cookies    middleware    RLS policy        Every query includes studio_id
```

### 4. Automation Pipeline
```
Booking Created → Automation Trigger → Email/WhatsApp → Delivery Log → Stats
      ↓                  ↓                  ↓              ↓          ↓
createBooking    sendAutomation    sendEmail/      createLogEntry  getStats
                                    sendWhatsApp
```

## Conventions

### Tenant Isolation
- **Every database query** MUST include `tenant_id = $1` (studio_id)
- Services accept `studioId: string` as second parameter (after supabase client)
- API routes extract `studio_id` from authenticated session, never trust client-provided IDs

### Money Handling
- **All amounts stored in smallest currency unit** (₹ stored as-is in DECIMAL, not paise — verify per table)
- **INR formatting**: `en-IN` locale with `Intl.NumberFormat`
- **GST**: Indian GST calculation with CGST+SGST (intra-state) or IGST (inter-state)
- **GST types**: `cgst_sgst`, `igst`, `exempt`

### Dates & Time
- **Stored**: UTC in PostgreSQL
- **Displayed**: IST (Asia/Kolkata) via `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`
- **Format**: `dd MMM yyyy` (e.g., `15 Mar 2025`) or `dd MMM yyyy, h:mm a`

### Files & Assets
- **Naming**: UUID-based, never original filenames
- **Storage**: Immich DAMS for photos/videos, Supabase Storage for documents
- **Gallery access**: Token-based (access_token), optional password protection

### Auth Guards
- **`requireAuth`**: Any authenticated member (read operations)
- **`requireOwner`**: Only studio owners (write operations: CREATE/UPDATE/DELETE)
- **Token-based**: Public links (invoice view, contract sign, proposal accept, gallery view)
- **Portal auth**: Client portal uses separate token stored in `portal_sessions`

### API Response Format
```json
// Success
{ "data": <payload>, "error": null }
// Paginated
{ "data": [...], "meta": { "count": N, "page": N, "pageSize": N, "totalPages": N }, "error": null }
// Error
{ "data": null, "error": "message", "code": "ERROR_CODE" }
```

### Code Conventions
- **File naming**: PascalCase for components, camelCase for utilities
- **Imports**: Absolute paths (`@/lib/...`, `@/components/...`)
- **Server vs Client**: Default to Server Components; "use client" only for interactivity
- **Data fetching**: SWR on client with appropriate dedupingInterval; direct fetch on server

## Emergency Debugging

| Issue | Check |
|---|---|
| Payment webhook failures | `lib/services/.ai.md` → PaymentService, `lib/razorpay/.ai.md` |
| Face recognition errors | `lib/services/.ai.md` → ImmichService, GalleryService |
| GST calculation bugs | `lib/gst/.ai.md` → calculateGst, calculateInvoiceTotals |
| Auth/session issues | `lib/supabase/.ai.md` → client factories, `lib/auth/.ai.md` → guards |
| Email not sending | `lib/resend/.ai.md`, `lib/services/.ai.md` → sendEmail calls |
| Rate limiting | `lib/.ai.md` → rate-limit.ts, `lib/services/.ai.md` → rate limit calls |
| RLS policy errors | `supabase/migrations/`, `lib/supabase/.ai.md` → admin vs user clients |
| PDF generation fails | `lib/services/.ai.md` → pdf.service.tsx |
