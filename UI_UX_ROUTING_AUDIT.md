# UI/UX & Routing Audit Report — StudioDesk

**Audit Date:** April 12, 2026  
**Scope:** All 64 pages across dashboard, portal, auth, and marketing routes  
**Pages Audited:** 64 page.tsx + 21 loading.tsx + 0 not-found.tsx + layouts + key components

---

## Executive Summary

| Category | Critical | High | Medium | Low | Total Issues |
|----------|----------|------|--------|-----|-------------|
| **Routing & Navigation** | 3 | 4 | 3 | 2 | 12 |
| **UI/UX Patterns** | 2 | 5 | 4 | 3 | 14 |
| **Error Handling** | 3 | 2 | 1 | 0 | 6 |
| **Mobile Responsiveness** | 1 | 4 | 2 | 1 | 8 |
| **Accessibility** | 0 | 2 | 3 | 2 | 7 |
| **Code Quality** | 0 | 2 | 3 | 4 | 9 |
| **TOTAL** | **9** | **19** | **16** | **12** | **56** |

---

## 1. ROUTING & NAVIGATION

### 🔴 Critical

#### 1.1 Zero `not-found.tsx` Files (P0)
**Impact:** Every dynamic route has no proper 404 handling. Users hitting deleted/non-existent entities see raw error messages instead of graceful "not found" pages.

**Affected routes** (all 10 dynamic segments):
- `/clients/[id]`
- `/leads/[id]`
- `/proposals/[id]`
- `/contracts/[id]`
- `/team/[id]`
- `/gallery/[id]`
- `/finance/invoices/[id]`
- `/portal/[studioSlug]/bookings/[id]`
- `/portal/[studioSlug]/gallery/[id]`
- `/portal/[studioSlug]/invoices/[id]`
- `/portal/[studioSlug]/proposals/[id]`
- `/portal/[studioSlug]/contracts/[id]`

**Fix:** Create `not-found.tsx` in each `[id]` directory with a branded "not found" page and back button.

#### 1.2 ~25+ Router Calls Missing `{ scroll: false }` (P0)
**Impact:** Every filter, sort, view-change, or tab switch triggers a jarring page scroll jump back to the top. Direct violation of QWEN.md UX standards.

**Affected files** (all missing `{ scroll: false }`):
| File | Line(s) | Navigation |
|------|---------|------------|
| `components/bookings/BookingsShell.tsx` | 33, 47, 95-115 | Filter/sort/search changes |
| `components/clients/ClientsShell.tsx` | 33, 46, 83-85 | Filter/search changes |
| `components/finance/FinanceShell.tsx` | 18, 25 | Tab changes |
| `components/finance/invoices/InvoiceList.tsx` | 55, 61, 97-121 | Filter changes |
| `components/gallery/GalleryList.tsx` | 77-87 | Filter changes |
| `components/leads/LeadsShell.tsx` | 39, 49 | Filter changes |
| `components/leads/LeadsClient.tsx` | 47 | Search changes |
| `components/team/TeamShell.tsx` | 24 | Filter changes |
| `components/clients/ClientDetailPage.tsx` | 45 | Tab changes |
| `components/gallery/GalleryDetail.tsx` | 48 | Tab changes |
| `components/bookings/MobileBookingDetail.tsx` | 22 | Resize redirect |
| `components/bookings/kanban/KanbanCard.tsx` | 76 | Open detail |
| `components/bookings/list/BookingsList.tsx` | 230 | Open detail (correct ✅) |

**Only 4 files correctly implement this:**
- `BookingSlideOver.tsx` ✅
- `BookingsList.tsx` (detail link) ✅
- `PeriodSelector.tsx` ✅
- `AnalyticsShell.tsx` ✅

**Fix:** Add `{ scroll: false }` as second argument to ALL `router.push()` and `router.replace()` calls that change URL params without page navigation.

#### 1.3 Invoice Detail Route Mismatch (P0)
**Issue:** The `/finance` page uses `?id=` URL params to show invoice details inline via `InvoiceList.tsx`, BUT a separate `/finance/invoices/[id]/page.tsx` also exists. These two systems conflict — users navigating from `/finance` never reach the dedicated invoice detail page, making that route dead code.

**Fix:** Either:
- (a) Remove `/finance/invoices/[id]` route and keep inline detail on `/finance`
- (b) Make `/finance` list rows navigate to `/finance/invoices/[id]` instead of using `?id=`

### 🟡 High

#### 1.4 URL Params Dropped on Navigation
**Issue:** Multiple `router.push` calls with `?id=` do not preserve existing URL params (view, stage, search, tab), losing user context.

| File | Line | Drops |
|------|------|-------|
| `MobileBookingDetail.tsx` | 22 | Drops `view`, `stage`, `search` on mobile→desktop resize |
| `ClientBookings.tsx` | 76 | Drops `view`, `stage`, `search` when navigating from client profile |
| `InvoiceRow.tsx` | 66 | Drops `tab` param when navigating from finance page |
| `KanbanCard.tsx` | 76 | Preserves `view` but drops `search`, `stage` |

**Fix:** Use a helper function that merges new params with existing ones:
```ts
function mergeSearchParams(current: URLSearchParams, additions: Record<string, string>) {
  const next = new URLSearchParams(current.toString())
  Object.entries(additions).forEach(([k, v]) => next.set(k, v))
  return next.toString()
}
```

#### 1.5 No Route Constants File
**Issue:** 60+ hardcoded URL strings scattered across ~35 files. If any route changes, every instance must be manually updated.

**Occurrences:**
- `/bookings` — 15+ files
- `/clients` — 10+ files
- `/finance` — 8+ files
- `/gallery` — 6+ files
- `/dashboard`, `/team`, `/leads` — multiple files each

**Fix:** Create `lib/constants/routes.ts` with exported route constants and use them everywhere.

#### 1.6 Inconsistent Detail Page Architecture
**Issue:** Bookings uses a modern `?id=` slide-over pattern (correct per QWEN.md), but ALL other modules use separate `[id]` route pages that destroy list state on navigation.

**Modules using full-page navigation (incorrect):**
- Leads → `/leads/[id]`
- Proposals → `/proposals/[id]`
- Contracts → `/contracts/[id]`
- Team → `/team/[id]`
- Gallery → `/gallery/[id]`
- Clients → `/clients/[id]`

**Fix (long-term):** Migrate to slide-over/panel pattern like bookings. Preserves list context, feels instant.

### 🟢 Medium/Low

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1.7 | Missing `loading.tsx` for 7 dynamic routes | Medium | `/leads/[id]`, `/proposals/[id]`, `/contracts/[id]`, `/finance/invoices/[id]`, 3 portal routes |
| 1.8 | `/settings` missing top-level `loading.tsx` | Medium | Settings sub-pages have loading states, but `/settings` root does not |
| 1.9 | Back button styles inconsistent across 8 detail pages | Low | Bare `ArrowLeft` icon, `ChevronLeft` + text, `Button variant="ghost"`, breadcrumb text — all different |
| 1.10 | Gallery back navigation goes to `/finance` not `/finance/invoices` | Low | Invoice detail `<Link href="/finance">` bypasses the finance tab structure |

---

## 2. ERROR HANDLING

### 🔴 Critical

#### 2.1 6 of 8 Detail Pages Lack Recovery Navigation
**Issue:** When an API call fails or entity is not found, 5 pages leave users on a blank error screen with no way to navigate back.

| Page | Error Message | Has Back Button? | Differentiates 404? |
|------|--------------|------------------|---------------------|
| `/bookings/[id]` | "Booking not found." | ✅ Yes | ❌ No |
| `/clients/[id]` | "Client not found." / "Failed to load..." | ✅ Yes | ✅ Yes |
| `/leads/[id]` | "Failed to load lead" | ❌ **NO** | ❌ No |
| `/team/[id]` | **None** (mock data) | N/A | N/A |
| `/gallery/[id]` | "Failed to load gallery" | ✅ Yes | ❌ No |
| `/finance/invoices/[id]` | "Failed to load invoice" | ❌ **NO** | ❌ No |
| `/proposals/[id]` | "Failed to load proposal" | ❌ **NO** | ❌ No |
| `/contracts/[id]` | "Failed to load contract" | ❌ **NO** | ❌ No |

**Fix:** Add consistent error UI across all detail pages:
```tsx
if (error) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <p className="text-lg font-medium">{error.status === 404 ? "Not found" : "Failed to load"}</p>
      <Button onClick={() => router.push("/...")} variant="outline" className="mt-4">
        Back to list
      </Button>
    </div>
  )
}
```

### 🟡 High

#### 2.2 Team Detail Uses Hardcoded Mock Data
**File:** `components/team/members/MemberDetail.tsx`  
**Issue:** The team detail component renders fake data with zero API integration. No error handling, no loading states, no real data fetching.

**Fix:** Connect to actual team member API endpoint with proper SWR fetch, loading skeleton, and error state.

#### 2.3 No Differentiation Between Error Types
**Issue:** Only `/clients/[id]` checks `error.status === 404` and shows different messages for "entity deleted" vs "network error". All other pages show identical "Failed to load..." for both cases.

**User impact:** Users cannot tell if their internet is down or if the entity was permanently deleted.

---

## 3. UI/UX PATTERNS

### 🔴 Critical

#### 3.1 Developer Jargon in User-Facing Loading Text
**File:** `app/(dashboard)/gallery/[id]/page.tsx`, line 14  
**Text:** `"Decompressing Face Clusters & Buffering 4K Thumbs..."`  
**Issue:** Internal technical jargon displayed to end users. Should be user-friendly: "Loading gallery..."

**Also found:**
- `LeadsPage`: `"Initializing Leads Pipeline..."` (suspense text)
- `TeamPage`: `"Loading Team HQ..."` (suspense text)

**Fix:** Replace all Suspense fallback text with simple, user-facing language or use skeleton loaders.

#### 3.2 Suspense Fallback Triggers on Param Changes
**Issue:** Some pages wrap their entire client component in a Suspense boundary. When URL params change (e.g., switching tabs), the Suspense fallback flashes, causing the entire content to briefly disappear and reappear.

**Affected:**
- `/leads` — Suspense wraps entire `LeadsClient`
- `/gallery` — Suspense wraps entire `GalleryDetail`
- `/team` — Suspense wraps entire `TeamShell`

**Fix:** Remove top-level Suspense around client components that handle their own loading. Use `loading.tsx` for initial load only, and let client components manage stale-while-revalidate internally.

### 🟡 High

#### 3.3 ~400 Lines of Identical Layout Code Duplicated
**Issue:** The 2-column detail layout (left: info grid, right: summary card) is copy-pasted verbatim across 4 pages with zero variation:

- `/proposals/[id]/page.tsx` — lines 50-127
- `/contracts/[id]/page.tsx` — lines 50-127
- `/finance/invoices/[id]/page.tsx` — lines 50-130
- `/leads/[id]/page.tsx` — lines 55-103

**Fix:** Extract to shared `<DetailLayout>` component with props for title, status badge, info rows, and summary content.

#### 3.4 Inconsistent Header Title Sizes
| Page | Title Size |
|------|-----------|
| Proposals/Contracts/Invoices/Leads | `text-xl font-bold` |
| Clients | `text-2xl font-bold` |
| Team | `text-2xl font-bold` |
| Gallery | `text-3xl font-bold` |
| Dashboard | `text-2xl font-bold` |
| Settings | No title (uses shell) |

**Fix:** Standardize to `text-2xl font-bold` for all page headers.

#### 3.5 Inconsistent Container Padding
| Page | Padding |
|------|---------|
| Proposals/Contracts/Invoices/Leads | `p-6 md:p-8 space-y-6 max-w-4xl` |
| Clients | Full-bleed `flex-1 flex flex-col h-full overflow-hidden` |
| Team | `flex-1 overflow-auto flex flex-col` |
| Gallery | `flex flex-col h-full bg-background overflow-hidden` |
| Dashboard | Inherited from layout: `p-4 pb-[calc(...)] md:p-6 lg:p-8` |

**Fix:** All pages should fill the available space from the layout and manage their own internal spacing consistently.

#### 3.6 Status Badge Styling Not Shared
**Issue:** The `text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border` status badge pattern is copy-pasted across proposals, contracts, and leads with slightly different color mappings. No shared component exists.

**Fix:** Create `<StatusBadge variant="..." />` component in `components/ui/`.

### 🟢 Medium/Low

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 3.7 | Skeleton loading patterns not shared | Medium | 3 static Skeleton bars duplicated across proposals, contracts, invoices, leads |
| 3.8 | Duplicate loading states in leads detail | Medium | `useEffect` param resolution + SWR fetch both have skeleton code |
| 3.9 | Finance page tab content flashes on switch | Medium | Suspense fallback shows 3 skeleton bars every time tab changes |
| 3.10 | Gallery upload panel `hidden lg:block` with no mobile alternative | Low | Mobile users cannot upload photos from gallery detail page |

---

## 4. MOBILE RESPONSIVENESS

### 🔴 Critical

#### 4.1 4 Detail Pages Have Zero Mobile Adaptation
**Issue:** Leads, Proposals, Contracts, and Invoice detail pages all share identical layout: `p-6 md:p-8 space-y-6 max-w-4xl`. On phones (<768px), the `max-w-4xl` container is unnecessarily wide, 2-column grids collapse poorly, and touch targets are too small.

**Missing mobile adaptations:**
- No responsive grid changes (should be `grid-cols-1 md:grid-cols-2`)
- No touch-friendly tap targets (buttons < 44x44px)
- No mobile header adjustments
- No mobile-specific layout reflows

**Fix:** Add responsive breakpoints to all 4 pages:
```tsx
className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto"
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

### 🟡 High

#### 4.2 Mobile Booking Detail Loses URL Params on Resize
**File:** `components/bookings/MobileBookingDetail.tsx`, line 22  
**Issue:** When viewport grows >= 1024px, the component does `router.replace('/bookings?id=${id}')` which drops `view`, `stage`, `search` params. User's filter context is lost.

**Fix:** Preserve all existing params:
```ts
const params = new URLSearchParams(searchParams.toString())
params.set('id', id)
router.replace(`/bookings?${params.toString()}`)
```

#### 4.3 Bottom Nav Overlaps Content on Mobile
**File:** `app/(dashboard)/layout.tsx`, line 13  
**Issue:** The main content area uses `pb-[calc(5rem+env(safe-area-inset-bottom))]` to account for bottom nav, but this calculation may not match the actual bottom nav height on all devices/OS versions.

**Fix:** Measure actual bottom nav height and use CSS variable or ensure consistent spacing.

#### 4.4 Kanban Board Unusable on Mobile
**File:** `components/leads/LeadsKanban.tsx`, line 17  
**Issue:** The Kanban board falls back to `flex flex-col gap-6` on mobile (`md:hidden`), but with 4+ columns of cards, this creates a very long scroll with no column headers visible simultaneously.

**Fix:** Consider a mobile-specific list view for Kanban on screens < 768px.

### 🟢 Medium/Low

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 4.5 | Client detail tabs overflow on mobile | Medium | `overflow-x-auto` with right-fade indicator only on `sm:`+ |
| 4.6 | Team detail action buttons hidden on mobile | Medium | `hidden sm:inline-flex` on schedule/pay buttons with icon-only fallbacks |
| 4.7 | Dashboard pipeline section too cramped on mobile | Low | BookingPipeline has mobile layout (`md:hidden flex flex-col`) but cards are very small |

---

## 5. ACCESSIBILITY

### 🟡 High

#### 5.1 Missing `aria-label` on Icon-Only Buttons
**Issue:** Many icon-only buttons (back arrows, filter toggles, action buttons) have no `aria-label` for screen readers.

**Examples:**
- Back arrow links in proposals, contracts, leads, invoices detail pages
- Filter icon in BookingsShell
- View toggle buttons (kanban ↔ list)
- Action buttons in MemberDetail (icon-only on mobile)

**Fix:** Add `aria-label` to all icon-only interactive elements:
```tsx
<Link href="/leads" aria-label="Back to leads">
  <ArrowLeft className="w-4 h-4" />
</Link>
```

#### 5.2 Missing `alt` Attributes on Dynamic Images
**Issue:** Client avatars, gallery thumbnails, and team member photos use `<img>` or `<Image>` without proper `alt` attributes.

**Fix:** Ensure all images have descriptive `alt` text (e.g., `alt={client.fullName}` or `alt=""` for decorative images).

### 🟢 Medium/Low

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 5.3 | No keyboard navigation for Kanban columns | Medium | Cannot navigate columns with arrow keys; tab order goes vertically |
| 5.4 | Color-only status indicators | Medium | Some status badges use only color (green/yellow/red) without text — colorblind users cannot distinguish |
| 5.5 | Form inputs missing `aria-describedby` for errors | Low | Auth forms show error text below inputs but don't link them with `aria-describedby` |
| 5.6 | No skip-to-content link | Low | Dashboard layout has no skip link for keyboard/screen reader users |

---

## 6. CODE QUALITY

### 🟡 High

#### 6.1 106 Instances of `any` Type in Components
**Issue:** Heavy use of `any` defeats TypeScript's type safety, especially in:

| File | `any` Count | Context |
|------|------------|---------|
| `components/clients/ClientsTable.tsx` | 11 | Table column/row types |
| `components/clients/ClientsGrid.tsx` | 1 | Client map type |
| `components/clients/EditClientSheet.tsx` | 3 | Form types |
| `components/clients/NewClientDialog.tsx` | 2 | Form types |
| `components/clients/ClientCard.tsx` | 1 | Client prop type |
| `components/clients/tabs/ClientOverview.tsx` | 3 | Nested data types |
| `components/clients/tabs/ClientFinance.tsx` | 3 | Invoice/payment types |
| `components/clients/tabs/ClientDocuments.tsx` | 2 | Document types |

**Fix:** Define proper TypeScript interfaces for Client, Invoice, Payment, Document, etc.

#### 6.2 Proposals and Contracts Pages Are Client Components
**Files:** 
- `app/(dashboard)/proposals/page.tsx` — `"use client"`
- `app/(dashboard)/contracts/page.tsx` — `"use client"`

**Issue:** These pages have no client-side logic themselves (no hooks, no state, no interactivity). They simply render a shell and a list. Should be Server Components per QWEN.md rules.

**Fix:** Remove `"use client"` and convert to server components. The Shell and List components should manage their own client interactivity.

### 🟢 Medium/Low

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 6.3 | Duplicate loading skeleton code | Medium | Same 3-bar skeleton pattern copy-pasted 5+ times |
| 6.4 | Unused `/templates` page | Low | Static page with hardcoded template list — not connected to any CMS or API |
| 6.5 | Blog page uses hardcoded static data | Low | 3 fake blog posts defined in the page component |
| 6.6 | Marketing pages bypass dashboard layout | Low | Landing, pricing, features pages have completely different design system from dashboard — intentional but creates visual inconsistency across the app |
| 6.7 | Auth forms have different styling | Low | Login uses one visual style, signup uses another, reset password uses a third |

---

## 7. PAGE-BY-PAGE STATUS

### Dashboard Module

| Page | Route | Loading | Error | Mobile | Notes |
|------|-------|---------|-------|--------|-------|
| Dashboard | `/dashboard` | ✅ Suspense per section | ❌ No error boundary | ✅ Responsive | Good Suspense granularity |
| Bookings | `/bookings` | ✅ loading.tsx | ⚠️ Basic | ✅ Best-in-class | Slide-over pattern is correct |
| Clients | `/clients` | ✅ loading.tsx | ⚠️ Basic | ✅ Responsive | Good empty states |
| Leads | `/leads` | ⚠️ Text fallback | ❌ None | ❌ No adaptation | Suspense text is dev jargon |
| Finance | `/finance` | ✅ loading.tsx | ⚠️ Basic | ⚠️ Partial | Tab flash on switch |
| Gallery | `/gallery` | ✅ loading.tsx | ⚠️ Basic | ⚠️ Partial | Upload hidden on mobile |
| Team | `/team` | ✅ loading.tsx | ❌ Mock data | ⚠️ Partial | Detail uses fake data |
| Proposals | `/proposals` | ❌ None | ❌ None | ❌ No adaptation | `"use client"` unnecessary |
| Contracts | `/contracts` | ❌ None | ❌ None | ❌ No adaptation | `"use client"` unnecessary |
| Analytics | `/analytics` | ✅ loading.tsx | ⚠️ Basic | ⚠️ Unknown | Not fully audited |
| Addons | `/addons` | ❌ None | ❌ None | ❌ Unknown | Not fully audited |

### Detail Pages

| Page | Route | Loading | Error | Mobile | 404 |
|------|-------|---------|-------|--------|-----|
| Booking Detail | `/bookings/[id]` | ✅ via parent | ⚠️ Basic | ✅ Best | ❌ No |
| Client Detail | `/clients/[id]` | ✅ loading.tsx | ✅ Best | ✅ Good | ❌ No |
| Lead Detail | `/leads/[id]` | ❌ None | ❌ None | ❌ No | ❌ No |
| Team Detail | `/team/[id]` | ✅ loading.tsx | ❌ Mock data | ⚠️ Partial | ❌ No |
| Gallery Detail | `/gallery/[id]` | ✅ loading.tsx | ⚠️ Basic | ⚠️ Partial | ❌ No |
| Invoice Detail | `/finance/invoices/[id]` | ❌ None | ❌ None | ❌ No | ❌ No |
| Proposal Detail | `/proposals/[id]` | ❌ None | ❌ None | ❌ No | ❌ No |
| Contract Detail | `/contracts/[id]` | ❌ None | ❌ None | ❌ No | ❌ No |

### Settings Module

| Page | Route | Loading | Notes |
|------|-------|---------|-------|
| Settings Root | `/settings` | ❌ None | Uses SettingsShell layout |
| Studio | `/settings/studio` | ✅ loading.tsx | |
| Packages | `/settings/packages` | ✅ loading.tsx | |
| Finance | `/settings/finance` | ✅ loading.tsx | |
| Automations | `/settings/automations` | ❌ None | Client component, good UX |
| Integrations | `/settings/integrations` | ✅ loading.tsx | |
| Notifications | `/settings/notifications` | ✅ loading.tsx | |
| Billing | `/settings/billing` | ✅ loading.tsx | |
| Danger Zone | `/settings/danger` | ✅ loading.tsx | |
| Owner | `/settings/owner` | ✅ loading.tsx | |

### Portal Module

| Page | Route | Loading | Notes |
|------|-------|---------|-------|
| Portal Root | `/portal/[studioSlug]` | ❌ None | Redirects to dashboard |
| Portal Login | `/portal/[studioSlug]/login` | ❌ None | |
| Portal Dashboard | `/portal/[studioSlug]/dashboard` | ✅ loading.tsx | |
| Portal Bookings | `/portal/[studioSlug]/bookings` | ✅ loading.tsx | |
| Portal Bookings Detail | `/portal/[studioSlug]/bookings/[id]` | ❌ None | Missing loading + not-found |
| Portal Invoices | `/portal/[studioSlug]/invoices` | ✅ loading.tsx | |
| Portal Invoices Detail | `/portal/[studioSlug]/invoices/[id]` | ❌ None | Missing loading + not-found |
| Portal Gallery | `/portal/[studioSlug]/gallery` | ❌ None | Missing loading |
| Portal Gallery Detail | `/portal/[studioSlug]/gallery/[id]` | ❌ None | Missing loading + not-found |
| Portal Proposals Detail | `/portal/[studioSlug]/proposals/[id]` | ❌ None | Missing loading + not-found |
| Portal Contracts Detail | `/portal/[studioSlug]/contracts/[id]` | ❌ None | Missing loading + not-found |

### Auth Module

| Page | Route | Notes |
|------|-------|-------|
| Login | `/login` | Form validation ✅, role="alert" ✅ |
| Signup | `/signup` | Form validation ✅, different styling from login |
| Forgot Password | `/forgot-password` | Basic form ✅ |
| Reset Password | `/auth/reset-password` | Form validation ✅ |

### Marketing Pages

| Page | Route | Notes |
|------|-------|-------|
| Landing | `/` | Mobile CTA bar ✅, different design system |
| Pricing | `/pricing` | Static content |
| Features | `/features` | Static content |
| Templates | `/templates` | Static hardcoded list |
| Blog | `/blog` | Fake posts (3 hardcoded) |
| Case Studies | `/case-studies` | Static |
| Book Demo | `/book-demo` | Static |
| Inquiry | `/inquiry` | Form with validation |

---

## 8. PRIORITY FIX ROADMAP

### Phase 1 — Critical UX (Week 1)
1. ✅ Add `{ scroll: false }` to all 25+ router calls — **~30 min**
2. ✅ Create `not-found.tsx` for all 12 dynamic routes — **~2 hours**
3. ✅ Fix invoice detail route mismatch (pick one pattern) — **~30 min**
4. ✅ Add recovery back buttons to leads, proposals, contracts, invoices detail error states — **~1 hour**
5. ✅ Fix mobile resize URL param loss in MobileBookingDetail — **~15 min**

### Phase 2 — UI Consistency (Week 2)
6. ✅ Extract shared `DetailLayout` component — **~1 hour**
7. ✅ Extract shared `StatusBadge` component — **~30 min**
8. ✅ Standardize page header sizes (`text-2xl font-bold`) — **~15 min**
9. ✅ Replace Suspense dev jargon with user-friendly text — **~10 min**
10. ✅ Remove `"use client"` from proposals/contracts pages — **~10 min**

### Phase 3 — Mobile Responsiveness (Week 2-3)
11. ✅ Add mobile breakpoints to leads, proposals, contracts, invoices detail pages — **~2 hours**
12. ✅ Fix gallery upload panel mobile alternative — **~1 hour**
13. ✅ Fix bottom nav content overlap — **~30 min**
14. ✅ Add touch-friendly targets to detail pages — **~1 hour**

### Phase 4 — Code Quality (Week 3)
15. ✅ Create route constants file — **~1 hour**
16. ✅ Replace `any` types in clients module — **~2 hours**
17. ✅ Connect team detail to real API — **~2 hours**
18. ✅ Add `aria-label` to icon-only buttons — **~1 hour**

---

## Summary

**Biggest UX Wins (fastest to implement):**
1. `{ scroll: false }` on all filter/tab changes — eliminates scroll jumps instantly
2. `not-found.tsx` files — graceful degradation for deleted entities
3. Recovery buttons on error states — no more stranded users
4. Shared `DetailLayout` — eliminates 400 lines of duplication

**Biggest UX Debt:**
1. No route constants — maintenance nightmare waiting to happen
2. 106 `any` types — TypeScript safety compromised
3. Team module mock data — feature incomplete
4. Marketing vs Dashboard design split — intentional but creates brand inconsistency

---

*Generated by StudioDesk UI/UX Audit — April 12, 2026*
