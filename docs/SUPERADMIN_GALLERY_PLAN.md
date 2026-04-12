# StudioDesk — Super Admin Panel & Public Gallery Delivery Website

**Date**: 2026-04-12
**Source**: Compiled from `docs/` knowledge base + codebase audit + web research

---

## Executive Summary

Two major systems need to be built:

### A. Super Admin Panel
Platform-level admin dashboard for managing studios, subscriptions, revenue, and platform health. **Zero existing code** — entirely greenfield.

### B. Public Gallery Delivery Website
Client-facing public gallery for photo/video delivery with face-recognition selfie lookup. **Infrastructure partially exists** (backend routes, DB tables, components) but all are stubs or incomplete.

---

## Part A: Super Admin Panel

### Current State Assessment

**✅ What Exists:**
- DB tables planned in IMPLEMENTATION_PLAN.md Stage 5: `platform_admins`, `admin_sessions`, `admin_audit_logs`, `studio_impersonation_log`, `platform_settings`, `support_notes`, `v_platform_studio_health` (view)
- `settings/billing` endpoint exists (studio-facing, shows subscription info)
- Subscription billing Stage 4 partially implemented (BillingSettings.tsx bound to real API)
- Studio health view: `v_platform_studio_health` database view exists

**❌ What Does NOT Exist:**
- Zero admin auth routes
- Zero admin frontend pages
- Zero admin backend API routes
- Zero admin middleware/guards
- Admin DB tables NOT yet created in migrations
- Impersonation system not built

### Architecture

```
Super Admin Panel (separate Next.js route group)
├── app/(admin)/admin/
│   ├── layout.tsx           ← Admin-only layout (dark theme, separate branding)
│   ├── login/page.tsx       ← Admin login page
│   ├── dashboard/page.tsx   ← Platform overview
│   ├── studios/page.tsx     ← Studio list
│   ├── studios/[id]/page.tsx ← Studio detail
│   ├── subscriptions/page.tsx
│   ├── plans/page.tsx       ← Subscription plan management
│   ├── audit-logs/page.tsx
│   ├── feature-flags/page.tsx
│   └── settings/page.tsx    ← Platform settings
├── app/api/v1/admin/         ← Admin API routes
│   ├── auth/login/route.ts
│   ├── auth/me/route.ts
│   ├── auth/logout/route.ts
│   ├── dashboard/route.ts
│   ├── studios/route.ts
│   ├── studios/[id]/route.ts
│   ├── studios/[id]/suspend/route.ts
│   ├── studios/[id]/reactivate/route.ts
│   ├── studios/[id]/impersonate/route.ts
│   ├── subscriptions/route.ts
│   ├── plans/route.ts
│   ├── plans/[id]/route.ts
│   ├── settings/route.ts
│   ├── audit-logs/route.ts
│   ├── feature-flags/route.ts
│   └── feature-flags/[id]/route.ts
├── lib/
│   ├── services/admin-auth.service.ts
│   ├── services/platform.service.ts
│   └── admin/guards.ts       ← requireAdminAuth()
└── middleware.ts             ← Admin route guard (separate from studio)
```

### Database Schema (NEW migrations needed)

```sql
-- 1. Platform Admins
CREATE TABLE platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'support_agent', 'billing_agent')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin Sessions
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES platform_admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin Audit Logs (append-only, never deleted)
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES platform_admins(id),
  action TEXT NOT NULL,
  target_type TEXT,        -- 'studio', 'subscription', 'plan', 'settings'
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Studio Impersonation Log
CREATE TABLE studio_impersonation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES platform_admins(id),
  studio_id UUID REFERENCES studios(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address TEXT,
  actions_taken INT DEFAULT 0
);

-- 5. Platform Settings
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES platform_admins(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Support Notes
CREATE TABLE support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES platform_admins(id),
  note TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  studio_ids UUID[],        -- NULL = global, array = per-studio
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Implementation Stages

#### Stage A1: Database Schema + Seed (Week 1)
**Goal**: Create all admin DB tables, seed first super admin user

| Task | Files | Details |
|---|---|---|
| Create migration SQL | `supabase/migrations/20260412_super_admin.sql` | All 7 tables above + indexes |
| Seed first super admin | `supabase/seed-super-admin.ts` | Email/password for initial admin user |
| Create types | `types/admin.ts` | `PlatformAdmin`, `AdminSession`, `AuditLog`, `PlatformSettings`, `FeatureFlag` |
| RLS policies | Migration file | Admin tables: admin-only access, audit_logs: append-only, impersonation_log: admin-only |

**Exit criteria**: `npx supabase db push` succeeds, 1 admin user exists in DB, RLS policies applied

#### Stage A2: Admin Auth Service + API Routes (Week 1-2)
**Goal**: Admin login/logout/me with session management and audit logging

| Task | Files | Details |
|---|---|---|
| Admin auth service | `lib/services/admin-auth.service.ts` | Login, logout, me, session management |
| Admin guards | `lib/admin/guards.ts` | `requireAdminAuth()` — validates admin session, NOT studio session |
| Admin login route | `app/api/v1/admin/auth/login/route.ts` | POST: email+password → session token |
| Admin logout route | `app/api/v1/admin/auth/logout/route.ts` | POST: invalidate session |
| Admin me route | `app/api/v1/admin/auth/me/route.ts` | GET: current admin info |
| Admin middleware | `middleware.ts` | Separate auth check for `/admin/*` routes |
| Session cleanup | Cron job or DB trigger | Expire old sessions daily |

**Exit criteria**: Admin can login, session persists, `requireAdminAuth()` returns admin context, audit log created on login

#### Stage A3: Admin Dashboard + Studio Management (Week 2-3)
**Goal**: Platform overview dashboard + full studio CRUD

| Task | Files | Details |
|---|---|---|
| Dashboard API | `app/api/v1/admin/dashboard/route.ts` | Studio count, revenue, active subscriptions, health metrics from `v_platform_studio_health` |
| Studio list API | `app/api/v1/admin/studios/route.ts` | Paginated list with filters (plan, status, created date) |
| Studio detail API | `app/api/v1/admin/studios/[id]/route.ts` | Full studio info, subscription, usage, support notes |
| Suspend studio API | `app/api/v1/admin/studios/[id]/suspend/route.ts` | Sets studio `is_suspended = true`, blocks studio login |
| Reactivate studio API | `app/api/v1/admin/studios/[id]/reactivate/route.ts` | Reverses suspension |
| Impersonate API | `app/api/v1/admin/studios/[id]/impersonate/route.ts` | Generates studio-scoped session token, logs to impersonation_log |
| Stop impersonate API | `app/api/v1/admin/admin/stop-impersonate/route.ts` | Ends impersonation, updates ended_at |
| Admin dashboard page | `app/(admin)/admin/dashboard/page.tsx` | KPI cards: total studios, MRR, active subs, health alerts |
| Studio list page | `app/(admin)/admin/studios/page.tsx` | Searchable table with suspend/reactivate actions |
| Studio detail page | `app/(admin)/admin/studios/[id]/page.tsx` | Tabs: overview, subscription, usage, support notes |

**Exit criteria**: Admin can view dashboard, search studios, suspend/reactivate, view studio detail with all tabs

#### Stage A4: Subscription Plan Management (Week 3)
**Goal**: CRUD for subscription plans

| Task | Files | Details |
|---|---|---|
| Plans API | `app/api/v1/admin/plans/route.ts` | GET list, POST create |
| Plan detail API | `app/api/v1/admin/plans/[id]/route.ts` | GET, PATCH, DELETE |
| Plans page | `app/(admin)/admin/plans/page.tsx` | Plan list + create/edit dialog |
| Subscription overview | `app/api/v1/admin/subscriptions/route.ts` | Platform-wide subscription stats |

**Exit criteria**: Admin can create/edit/delete subscription plans, view platform subscription stats

#### Stage A5: Audit Logs + Feature Flags + Settings (Week 3-4)
**Goal**: Operational tooling

| Task | Files | Details |
|---|---|---|
| Audit log API | `app/api/v1/admin/audit-logs/route.ts` | Paginated list with admin/action filters |
| Audit log page | `app/(admin)/admin/audit-logs/page.tsx` | Log viewer with search |
| Feature flags API | `app/api/v1/admin/feature-flags/route.ts` | CRUD |
| Feature flags page | `app/(admin)/admin/feature-flags/page.tsx` | Toggle panel |
| Platform settings API | `app/api/v1/admin/settings/route.ts` | GET/PUT platform config |
| Platform settings page | `app/(admin)/admin/settings/page.tsx` | GSTIN, SAC codes, platform-wide config |
| Support notes API | `app/api/v1/admin/studios/[id]/support-notes/route.ts` | GET list, POST note |
| Support notes UI | In studio detail page | Add/view notes per studio |

**Exit criteria**: Full audit trail visible, feature flags togglable, platform settings editable, support notes addable

#### Stage A6: Admin UI Polish + Security (Week 4)
**Goal**: Production-ready admin panel

| Task | Details |
|---|---|
| Separate admin theme | Dark theme, different from studio (no shared styles) |
| Visual impersonation indicator | Red banner when impersonating a studio |
| IP rate limiting on admin login | 5 attempts/hour |
| Session timeout | 30 minutes idle |
| 2FA for super_admin role | Optional TOTP |
| Export audit logs | CSV download |
| Admin layout | Separate sidebar navigation, no studio nav |

**Exit criteria**: Admin panel passes security audit, impersonation clearly visible, rate limiting active

---

## Part B: Public Gallery Delivery Website

### Current State Assessment

**✅ What Exists:**
- **Backend routes**: `GET /api/v1/gallery/[slug]/route.ts` (metadata only), `POST /api/v1/gallery/[slug]/lookup/route.ts` (selfie lookup)
- **Frontend page**: `app/gallery/p/[slug]/page.tsx` (Server Component with stub selfie)
- **Components**: `ClientGallery.tsx`, `ClientPhotoGrid.tsx`, `ClientVideoPlayer.tsx`, `GalleryAccessGate.tsx`, `SelectionPanel.tsx` — **ALL MOCKED**
- **DB tables**: `galleries`, `gallery_photos`, `face_clusters`, `gallery_share_logs`, `guest_selfie_lookups`
- **Gallery service methods**: `getPublicGallery()` (returns metadata only, no photos), `guestSelfieLookup()` (full logic but returns URLs to nonexistent routes)
- **GalleryAccessGate**: Calls `verifyClientPin()` which is a no-op stub (always returns true)

**❌ Critical Gaps:**
1. **Missing backend routes**: `/api/v1/gallery/[slug]/photos`, `/api/v1/gallery/[slug]/photos/[assetId]/thumb`, `/api/v1/gallery/[slug]/photos/[assetId]/original`
2. **`getPublicGallery` returns NO photos** — only metadata
3. **`ClientGallery.tsx` is 100% mock data** — no API calls
4. **`verifyClientPin` is a no-op** — PIN gate always opens
5. **`fetchSelfiePhotos` in page.tsx** — local stub returns `{}`
6. **No selfie upload UI** — page.tsx has TODO placeholder
7. **Immich photo URLs** — thumbnail/original URLs point to nonexistent routes
8. **No download functionality** — no download endpoint for photos
9. **No photo selection/favorites feature** — component exists but not wired
10. **No social sharing** — no OG tags, no share buttons

### Architecture

```
Public Gallery Website
├── app/gallery/p/[slug]/
│   ├── page.tsx              ← Server Component (gallery detail)
│   └── loading.tsx           ← Skeleton for initial load
├── app/gallery/p/[slug]/download/[photoId]
│   └── route.ts              ← Download endpoint (serves original photo)
├── components/gallery/client/
│   ├── ClientGallery.tsx     ← Full rewrite: real data fetching
│   ├── ClientPhotoGrid.tsx   ← Wire to real photo URLs
│   ├── ClientVideoPlayer.tsx ← Wire to real video URLs
│   ├── GalleryAccessGate.tsx ← Wire verifyClientPin to real API
│   ├── SelectionPanel.tsx    ← Photo selection UI (keep, wire to state)
│   ├── SelfieLookup.tsx      ← NEW: selfie upload component
│   ├── PhotoLightbox.tsx     ← NEW: full-screen photo viewer
│   ├── DownloadButton.tsx    ← NEW: download trigger
│   └── ShareButton.tsx       ← NEW: social share with OG tags
├── lib/
│   ├── gallery-api.ts        ← NEW: typed fetchers for public gallery
│   └── api.ts                ← Fix verifyClientPin, fetchSelfiePhotos
└── middleware.ts             ← Gallery routes are PUBLIC (already configured in proxy.ts)
```

### Backend Routes Needed

```
GET    /api/v1/gallery/[slug]/photos          ← List photos for gallery (paginated, with thumbnails)
GET    /api/v1/gallery/[slug]/photos/[id]     ← Single photo detail
GET    /api/v1/gallery/[slug]/photos/[id]/thumb  ← Thumbnail (Immich proxy or CDN)
GET    /api/v1/gallery/[slug]/photos/[id]/download ← Original photo download
POST   /api/v1/gallery/[slug]/lookup          ← EXISTS: Selfie face lookup
POST   /api/v1/gallery/[slug]/favorites       ← Mark photos as favorites (optional PIN)
GET    /api/v1/gallery/[slug]/videos          ← List videos (if any)
POST   /api/v1/gallery/[slug]/download-all   ← Queue bulk download (async job)
```

### Implementation Stages

#### Stage B1: Backend Photo Serving Routes (Week 1)
**Goal**: Real API routes for listing and serving gallery photos

| Task | Files | Details |
|---|---|---|
| Photos list route | `app/api/v1/gallery/[slug]/photos/route.ts` | GET: paginated list with thumbnail URLs, Immich asset IDs, face cluster data |
| Photo detail route | `app/api/v1/gallery/[slug]/photos/[id]/route.ts` | GET: single photo with full metadata, EXIF data |
| Thumbnail route | `app/api/v1/gallery/[slug]/photos/[id]/thumb/route.ts` | GET: proxy to Immich thumbnail or serve from CDN, cache `public, max-age=3600` |
| Download route | `app/api/v1/gallery/[slug]/photos/[id]/download/route.ts` | GET: serve original file, increment download count, rate limit 50/hour/IP |
| Update gallery service | `lib/services/gallery.service.ts` | `getPublicGallery()` → also return photos array, not just metadata |
| Immich photo URL helper | `lib/services/immich.service.ts` | New method: `getPhotoUrls(assetId)` → returns thumbnail + original URLs |

**Exit criteria**: `/api/v1/gallery/[slug]/photos` returns paginated photos with working thumbnail URLs

#### Stage B2: Fix Gallery Service (Week 1)
**Goal**: `getPublicGallery` returns full gallery payload including photos

| Task | Files | Details |
|---|---|---|
| Update `getPublicGallery` | `lib/services/gallery.service.ts` | Add photos array to response (join with `gallery_photos`, fetch Immich thumbnails) |
| Add photo pagination | Service method | `page`, `pageSize` params, cursor-based pagination for large galleries |
| Add face clusters to public response | Service method | Only return labeled clusters (never expose unlabeled/person IDs) |
| Add rate limiting | Route layer | 100 photo list requests per IP per hour |

**Exit criteria**: Single API call returns gallery metadata + first page of photos + labeled face clusters

#### Stage B3: Rewrite Client Components (Week 1-2)
**Goal**: Replace all mock data with real API integration

| Task | Files | Details |
|---|---|---|
| Rewrite `ClientGallery.tsx` | `components/gallery/client/ClientGallery.tsx` | Fetch from `/api/v1/gallery/[slug]/photos`, real SWR, loading/error/empty states |
| Wire `ClientPhotoGrid.tsx` | `components/gallery/client/ClientPhotoGrid.tsx` | Use real thumbnail URLs from API response, infinite scroll |
| Wire `GalleryAccessGate.tsx` | `components/gallery/client/GalleryAccessGate.tsx` | Connect `verifyClientPin` to real backend route (if PIN-protected galleries) |
| Wire `SelectionPanel.tsx` | `components/gallery/client/SelectionPanel.tsx` | Client photo selection, POST favorites to API |
| Create `SelfieLookup.tsx` | `components/gallery/client/SelfieLookup.tsx` | NEW: camera/file upload → POST to `/api/v1/gallery/[slug]/lookup` → display matched photos |
| Create `PhotoLightbox.tsx` | `components/gallery/client/PhotoLightbox.tsx` | NEW: full-screen viewer with zoom, download button, prev/next navigation |
| Create `ShareButton.tsx` | `components/gallery/client/ShareButton.tsx` | NEW: Web Share API, copy link, social share with OG meta tags |
| Fix `verifyClientPin` | `lib/api.ts` | Real API call to backend (if galleries have PIN protection) |
| Fix `fetchSelfiePhotos` | `lib/api.ts` | Send base64 selfie to lookup endpoint, handle response |

**Exit criteria**: Client gallery page loads real photos, face recognition works, PIN gate functional, selfie lookup working

#### Stage B4: Public Gallery Page Rewrite (Week 2)
**Goal**: Complete public gallery page with all features

| Task | Files | Details |
|---|---|---|
| Rewrite `page.tsx` | `app/gallery/p/[slug]/page.tsx` | Server Component: fetch gallery + photos server-side for SEO, pass as props to client components |
| Add `loading.tsx` | `app/gallery/p/[slug]/loading.tsx` | Skeleton for initial load |
| Add OG meta tags | `page.tsx` metadata | title, description, image (first photo), studio branding |
| Add sitemap entries | Next.js config | Dynamic sitemap for all published galleries |
| Add PWA support | `manifest.json`, service worker | Offline caching for viewing galleries |
| Responsive design | All components | Mobile-first (primary viewing device), touch-friendly, swipe navigation |

**Exit criteria**: Lighthouse score >90 for public gallery page, OG tags render correctly, responsive at 390px

#### Stage B5: Advanced Features (Week 2-3)
**Goal**: Premium gallery features

| Task | Details |
|---|---|
| Photo favorites | POST `/api/v1/gallery/[slug]/favorites` — clients mark favorites (optional PIN required) |
| Bulk download | POST `/api/v1/gallery/[slug]/download-all` — async job, email notification when ready |
| Video playback | Wire `ClientVideoPlayer.tsx` to real video URLs from Immich |
| Face cluster browsing | Navigate by labeled person (e.g., "Bride", "Groom") |
| Search within gallery | Filter by face cluster label, date range |
| Watermark on previews | CSS overlay on thumbnails (remove on download) |
| Download tracking | Log downloads to `gallery_share_logs` |
| Expiry handling | Show "gallery expired" state when `expires_at` passed |

**Exit criteria**: All gallery features functional, download tracking accurate, expired galleries show proper state

#### Stage B6: Performance + Security (Week 3)
**Goal**: Production-ready gallery delivery

| Task | Details |
|---|---|
| CDN for thumbnails | Serve thumbnails via CloudFront/Cloudflare, not direct Immich proxy |
| Rate limiting on downloads | 50 downloads/hour/IP, prevent abuse |
| Selfie lookup rate limit | 10 lookups/hour/IP (already in backend) |
| Selfie data privacy | Confirm selfie assets deleted after lookup (already in `finally` block) |
| Gallery access logging | Log all access to `gallery_share_logs` (already in service) |
| Photo URL signing | Generate signed/expiring URLs for original photos (prevent direct linking) |
| Error boundaries | Graceful fallbacks for Immich failures |
| Monitoring | Alert on Immich connection failures, high download rates |

**Exit criteria**: Gallery handles 10K+ photo views/day, zero selfie data leakage, CDN caching effective

---

## Implementation Order (Combined)

```
Week 1:
  A1 - Database schema for admin (migration + seed)
  A2 - Admin auth service + API routes (partial)
  B1 - Backend photo serving routes
  B2 - Fix gallery service to return photos

Week 2:
  A2 - Complete admin auth + middleware
  A3 - Admin dashboard + studio list pages
  B3 - Rewrite client gallery components (partial)
  B4 - Public gallery page rewrite

Week 3:
  A3 - Complete studio management (suspend/reactivate/impersonate)
  A4 - Subscription plan management
  B3 - Complete client components (selfie lookup, lightbox, share)
  B5 - Advanced gallery features

Week 4:
  A5 - Audit logs + feature flags + settings
  A6 - Admin UI polish + security (2FA, rate limiting)
  B5 - Complete advanced features
  B6 - Performance + security hardening
```

---

## Dependencies & Risks

| Risk | Mitigation |
|---|---|
| Immich API instability | Add circuit breaker, fallback to cached thumbnails |
| Large gallery performance | Cursor pagination, CDN for thumbnails, lazy loading |
| Admin impersonation security | Audit log every action, visual indicator, session timeout |
| Selfie lookup privacy | Already deletes assets in `finally` block — verify with tests |
| Photo download abuse | Rate limiting, signed URLs, download tracking |
| Multi-studio data isolation | All admin queries use `platform_admins` not `studio_members` — completely separate auth |
| DB migration conflicts | Run admin migrations first (no dependencies on existing tables) |

---

## What Can Be Reused

| Component | Current State | Reuse Plan |
|---|---|---|
| `GalleryAccessGate.tsx` | Exists, PIN gate stub | Wire to real `verifyClientPin` API |
| `ClientPhotoGrid.tsx` | Exists, mock photos | Wire to real API photo URLs |
| `ClientVideoPlayer.tsx` | Exists | Wire to real video URLs |
| `SelectionPanel.tsx` | Exists | Wire to favorites API |
| `ClientGallery.tsx` | Exists, 100% mock | Full rewrite with real data |
| `gallery/[slug]/route.ts` | Exists, metadata only | Extend to return photos |
| `gallery/[slug]/lookup/route.ts` | Exists, working | No changes needed |
| `getPublicGallery()` | Exists, metadata only | Extend to return photos array |
| `guestSelfieLookup()` | Exists, working | No changes needed |
| `fetchSelfiePhotos()` in api.ts | Exists, correct endpoint | Wire UI to call it |
| `proxy.ts` PUBLIC_PATTERNS | Already configured | No changes needed |
| `v_platform_studio_health` | DB view exists | Use for admin dashboard health metrics |
| Subscription billing (Stage 4) | Partially implemented | Extend for admin plan management |

---

## Total Scope Summary

| Area | New Files | Modified Files | Complexity |
|---|---|---|---|
| Admin DB schema | 1 migration | 0 | Low |
| Admin auth | 5 files | 1 (middleware) | Medium |
| Admin dashboard | 8 files | 0 | Medium |
| Studio management | 7 files | 0 | Medium |
| Plan management | 4 files | 0 | Low |
| Admin operational | 6 files | 0 | Medium |
| Gallery photo routes | 5 new routes | 1 (gallery.service.ts) | Medium |
| Gallery components | 3 new + 5 rewritten | 5 existing | High |
| Gallery page | 1 page + 1 loading | 1 existing | Medium |
| Gallery API helpers | 1 new file | 1 (api.ts) | Low |
| **Total** | **~40 new files** | **~8 modified** | **4 weeks** |
