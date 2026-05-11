# Sprint 6 — Bookings

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Build the bookings module: list with status tabs, slide-over (Overview / Activity / Notes / Shoot Brief), new-booking dialog with a real client combobox (first sprint where the Sprint 3 client list is used as a dependency).

## API contracts verified
- [x] `GET /bookings` → `Response.ok({ data: BookingSummary[], count: N })` — same non-paginated pattern as proposals; using `apiGet`. Logged api-issues.md #3.
- [x] `POST /bookings` → `Response.created(booking)` — requires title, client_id, event_type, total_amount, advance_amount
- [x] `GET /bookings/[id]` → `Response.ok(booking)` — full detail
- [x] `PATCH /bookings/[id]` → `Response.ok(booking)` — general update
- [x] `DELETE /bookings/[id]` → `Response.ok({ success: true })` — soft delete
- [x] `GET /bookings/[id]/activity` → `Response.ok(feed)` — activity array
- [x] `GET|POST /bookings/[id]/shoot-brief` → assignments service
- [x] `PATCH /bookings/[id]/status` → `{ status: BookingStatus }`
- [x] `GET|POST /bookings/[id]/assignments` — team assignments

## Build tasks
- [x] `src/features/bookings/types.ts`
- [x] `src/lib/validations/booking.schema.ts`
- [x] `src/lib/api/endpoints/bookings.ts`
- [x] `src/lib/api/queryKeys.ts` — add bookings keys
- [x] `src/features/bookings/hooks/index.ts`
- [x] `src/features/bookings/components/BookingStatusBadge.tsx`
- [x] `src/features/bookings/BookingsPage.tsx` — list + status tabs + search
- [x] `src/features/bookings/BookingSlideOver.tsx` — 4 tabs
- [x] `src/features/bookings/NewBookingDialog.tsx` — with client combobox
- [x] `src/app/router.tsx` — add `/bookings` route
- [x] `src/components/layout/NavTree.tsx` — enable Bookings
- [x] `src/components/kbar/CommandPalette.tsx` — add Bookings commands + Sprint 6 label

## Polish tasks
- [x] Empty state with real-voice copy
- [x] Loading skeleton matching list
- [x] Error state with retry
- [x] `n` key shortcut
- [x] `?new=1` URL param dialog trigger
- [x] Mobile responsive (vaul bottom sheet on mobile)
- [x] Status change optimistic from slide-over header
- [x] Activity feed with typed icons

## Test file
- [x] `frontend/testing/bookings.md` written

## API issues found this sprint
- #3: GET /bookings uses Response.ok not Response.paginated — same workaround as proposals

## Sign-off
- [ ] User says "looks good, move on"
