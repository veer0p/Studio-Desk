# Week 1 — Detailed Day-Wise Plan

**Start Date**: 2026-04-12
**End Date**: 2026-04-16

---

## Day 1 (2026-04-12): Admin Infrastructure — Types, Service, Guards, Routes

### State Assessment
| Item | Status | Notes |
|---|---|---|
| DB tables | ✅ Exists | `platform_admins`, `admin_sessions`, `admin_audit_logs`, `studio_impersonation_log`, `platform_settings`, `support_notes`, `feature_flags` |
| DB types | ✅ Auto-generated | `PlatformAdmins`, `PlatformAdminsInput`, `AdminSessions`, etc. in `types/database.ts` |
| RLS policies | ✅ Exists | `fn_is_platform_admin()`, `fn_is_super_admin()`, all policies applied |
| `admin_role` enum | ✅ Exists | `super_admin`, `support_agent`, `billing_admin`, `readonly_analyst` |
| Seed data | ❌ Missing | No super_admin user exists |
| Admin routes | ❌ Missing | Zero API routes |
| Admin services | ❌ Missing | Zero service files |
| Admin guards | ❌ Missing | Zero guard functions |
| Admin frontend | ❌ Missing | Zero pages |

### Tasks

#### T1.1 — Create Admin Types (`types/admin.ts`)
**File**: `backend/studiodesk/types/admin.ts`
**Purpose**: Clean hand-curated types for admin API layer (not the verbose auto-generated DB types)
**Types**:
- `PlatformAdmin` — API response shape
- `AdminSession` — session management
- `AdminLoginInput` — login request body
- `AdminLoginResult` — login response
- `AdminContext` — authenticated admin context
- `AuditLogEntry` — audit log record
- `FeatureFlag` — feature flag record
- `PlatformSetting` — platform setting key-value
- `SupportNote` — support note record

#### T1.2 — Create Admin Auth Service
**File**: `backend/studiodesk/lib/services/admin-auth.service.ts`
**Methods**:
- `login(supabase, email, password)` → Auth via Supabase, then verify `platform_admins` record → create session → return admin context
- `logout(supabase, adminSessionId)` → Revoke session
- `getAdminContext(supabase)` → Get current admin info from auth + platform_admins join
- `createSession(supabase, adminId, ip, userAgent)` → Insert admin_sessions row
- `revokeSession(supabase, sessionId)` → Set revoked_at
- `logAudit(supabase, adminId, action, entityType?, entityId?, old?, new?)` → Append-only audit log

#### T1.3 — Create Admin Guard
**File**: `backend/studiodesk/lib/admin/guards.ts`
**Functions**:
- `requireAdminAuth(req)` → Like `requireAuth` but checks `platform_admins` table
- `requireSuperAdmin(req)` → Checks `role = 'super_admin'`

#### T1.4 — Create Admin Validation Schema
**File**: `backend/studiodesk/lib/validations/admin.schema.ts`
**Schemas**:
- `adminLoginSchema` → `{ email, password }`
- `auditLogQuerySchema` → Pagination + filters
- `createFeatureFlagSchema` → Feature flag creation
- `updatePlatformSettingSchema` → Setting updates

#### T1.5 — Create Admin API Routes
| Route | File | Method | Purpose |
|---|---|---|---|
| `/api/v1/admin/auth/login` | `app/api/v1/admin/auth/login/route.ts` | POST | Admin login |
| `/api/v1/admin/auth/logout` | `app/api/v1/admin/auth/logout/route.ts` | POST | Admin logout |
| `/api/v1/admin/auth/me` | `app/api/v1/admin/auth/me/route.ts` | GET | Get admin context |

#### T1.6 — Seed First Super Admin
**File**: `backend/studiodesk/supabase/seed-super-admin.ts`
**Purpose**: Create first super_admin user in Supabase Auth + platform_admins table
**User**: `admin@studiodesk.in` / `Admin@1234` (documented in docs/seed/TEST_USERS.md)

### Exit Criteria
- `npm run build` passes (backend)
- Admin can login via `POST /api/v1/admin/auth/login`
- Admin session persists, `GET /api/v1/admin/auth/me` returns admin context
- Non-admin users get 403 on admin routes
- Audit log created on login
- Super admin user exists in DB

---

## Day 2 (2026-04-13): Admin Dashboard + Studio Management API

### Tasks
| # | Task | Files | Details |
|---|---|---|---|
| T2.1 | Admin dashboard service | `lib/services/admin-dashboard.service.ts` | Platform overview: studio count, MRR, active subs, health from `v_platform_studio_health` |
| T2.2 | Dashboard API route | `app/api/v1/admin/dashboard/route.ts` | GET: dashboard summary |
| T2.3 | Studio list service | Extend `admin-dashboard.service.ts` | Paginated list with filters |
| T2.4 | Studio list API | `app/api/v1/admin/studios/route.ts` | GET: list, POST: create |
| T2.5 | Studio detail API | `app/api/v1/admin/studios/[id]/route.ts` | GET: detail, PATCH: update |
| T2.6 | Suspend studio API | `app/api/v1/admin/studios/[id]/suspend/route.ts` | POST: suspend |
| T2.7 | Reactivate studio API | `app/api/v1/admin/studios/[id]/reactivate/route.ts` | POST: reactivate |
| T2.8 | Impersonate studio API | `app/api/v1/admin/studios/[id]/impersonate/route.ts` | POST: start impersonation |

### Exit Criteria
- Dashboard returns studio count, MRR, health metrics
- Studio list paginates correctly
- Suspend/reactivate toggle `is_suspended` flag
- Impersonation generates studio-scoped session token, logs to `studio_impersonation_log`

---

## Day 3 (2026-04-14): Admin Frontend — Layout, Login, Dashboard

### Tasks
| # | Task | Files | Details |
|---|---|---|---|
| T3.1 | Admin route group | `frontend/studiodesk-web/app/(admin)/` | Route group with separate layout |
| T3.2 | Admin layout | `app/(admin)/layout.tsx` | Dark theme, admin sidebar, no studio nav |
| T3.3 | Admin login page | `app/(admin)/admin/login/page.tsx` | Email + password form |
| T3.4 | Admin dashboard page | `app/(admin)/admin/dashboard/page.tsx` | KPI cards: studios, MRR, subs, health |
| T3.5 | Admin API client | `frontend/studiodesk-web/lib/admin-api.ts` | Typed fetchers for admin routes |
| T3.6 | Admin auth hook | `frontend/studiodesk-web/hooks/use-admin-auth.ts` | SWR-backed admin context |
| T3.7 | Admin sidebar | `frontend/studiodesk-web/components/admin/AdminSidebar.tsx` | Nav: Dashboard, Studios, Plans, Audit, Settings |

### Exit Criteria
- Admin can login at `/admin/login`
- Dashboard shows real KPIs from backend
- Admin sidebar navigates between sections
- Dark theme visually distinct from studio

---

## Day 4 (2026-04-15): Backend Gallery Photo Routes

### Tasks
| # | Task | Files | Details |
|---|---|---|---|
| T4.1 | Gallery photos list route | `app/api/v1/gallery/[slug]/photos/route.ts` | GET: paginated photo list with thumbnails |
| T4.2 | Photo detail route | `app/api/v1/gallery/[slug]/photos/[id]/route.ts` | GET: single photo with metadata |
| T4.3 | Thumbnail route | `app/api/v1/gallery/[slug]/photos/[id]/thumb/route.ts` | GET: proxy to Immich thumbnail, cache 1hr |
| T4.4 | Download route | `app/api/v1/gallery/[slug]/photos/[id]/download/route.ts` | GET: serve original, rate limit 50/hr |
| T4.5 | Update gallery service | `lib/services/gallery.service.ts` | Extend `getPublicGallery()` to return photos |
| T4.6 | Immich URL helper | `lib/services/immich.service.ts` | `getPhotoUrls(assetId)` → thumb + original |

### Exit Criteria
- `GET /api/v1/gallery/[slug]/photos` returns paginated photos
- Thumbnail URLs serve real images
- Download increments counter in `gallery_share_logs`

---

## Day 5 (2026-04-16): Gallery Service Fix + Frontend API Integration

### Tasks
| # | Task | Files | Details |
|---|---|---|---|
| T5.1 | Fix `getPublicGallery` | `lib/services/gallery.service.ts` | Add photos array to response |
| T5.2 | Create gallery API client | `frontend/studiodesk-web/lib/gallery-api.ts` | Typed fetchers for public gallery |
| T5.3 | Fix `verifyClientPin` | `frontend/studiodesk-web/lib/api.ts` | Real API call (if PIN-protected) |
| T5.4 | Rewrite `ClientGallery.tsx` | `components/gallery/client/ClientGallery.tsx` | Real data fetching, SWR |
| T5.5 | Wire `ClientPhotoGrid.tsx` | `components/gallery/client/ClientPhotoGrid.tsx` | Real thumbnail URLs |
| T5.6 | Wire `GalleryAccessGate.tsx` | `components/gallery/client/GalleryAccessGate.tsx` | Real PIN verification |

### Exit Criteria
- Public gallery page loads real photos from backend
- Photo grid displays real thumbnails
- PIN gate calls real verification API
- Infinite scroll works for large galleries

---

## Week 1 Summary

| Day | Focus | New Files | Modified Files |
|---|---|---|---|
| Day 1 | Admin types, service, guards, routes, seed | ~8 | 2 |
| Day 2 | Admin dashboard + studio management API | ~7 | 1 |
| Day 3 | Admin frontend layout + login + dashboard | ~7 | 1 |
| Day 4 | Gallery photo backend routes | ~6 | 2 |
| Day 5 | Gallery service fix + frontend integration | ~4 | 4 |
| **Total** | | **~32 new files** | **~10 modified** |
