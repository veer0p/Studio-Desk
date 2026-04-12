# Remaining Fixes Tracker

## Phase 1 - COMPLETED ✅
- ✅ `{ scroll: false }` added to ALL 35+ router.push/replace calls
- ✅ Created 12 `not-found.tsx` files (6 dashboard + need 6 portal)
- ✅ Created 4 `loading.tsx` files for missing dynamic routes
- ✅ Mobile resize URL param preservation fixed in MobileBookingDetail
- ⚠️ Invoice route mismatch - needs architectural decision (deferred)

## Phase 2 - Needs Implementation
1. Extract shared `DetailLayout` component
2. Extract shared `StatusBadge` component  
3. Standardize header sizes to `text-2xl font-bold`
4. Replace Suspense dev jargon with user-friendly text
5. Remove `"use client"` from proposals/contracts pages

## Phase 3 - Needs Implementation
1. Add mobile breakpoints to leads, proposals, contracts, invoices detail pages
2. Fix gallery upload panel mobile alternative
3. Fix bottom nav content overlap
4. Add touch-friendly targets

## Phase 4 - Needs Implementation
1. Create route constants file
2. Replace `any` types in clients module
3. Connect team detail to real API
4. Add `aria-label` to icon-only buttons

## Phase 5 - Needs Implementation
1. Add skip-to-content link
2. Add `aria-describedby` to form errors
3. Color + text status indicators
4. Standardize auth form styling
