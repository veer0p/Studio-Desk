# Sprint 04 — Proposals

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Ship the Proposals module: list with status filter tabs, slide-over (Quote / Info / Notes), new/edit dialog with dynamic line items + live GST calc, send action.

## API contracts confirmed

- [x] `backend/studiodesk/app/api/v1/proposals/route.ts` — GET list, POST create
- [x] `backend/studiodesk/app/api/v1/proposals/[id]/route.ts` — GET detail, PATCH, DELETE
- [x] `backend/studiodesk/app/api/v1/proposals/[id]/send/route.ts` — POST send
- [x] `backend/studiodesk/app/api/v1/proposals/[id]/accept/route.ts` — POST accept/reject (public; not wired in Sprint 4)
- [x] `backend/studiodesk/lib/validations/proposal.schema.ts` — Zod source of truth
- [x] `backend/studiodesk/lib/services/proposal.service.ts` — ProposalSummary + ProposalDetail shapes confirmed

### Non-obvious backend behavior
- GET /proposals uses `Response.ok({ items, total })` not `Response.paginated` → frontend uses `apiGet` (see api-issues.md #1)
- POST /proposals requires **both** `booking_id` AND `client_id` (UUID); dialog uses text field until Sprint 6 (see api-issues.md #2)
- PATCH /proposals/[id]: only editable when `status === 'draft'`; backend throws 409 for non-draft
- Line items are **replaced entirely** when `line_items` is included in PATCH
- `valid_until` defaults to 7 days from now if omitted
- GST: `cgst_sgst` = CGST 9% + SGST 9%; `igst` = IGST 18%; `none` = 0
- `sendProposal`: transitions `draft → sent`; resending re-fires email/WhatsApp side-effects
- Amounts are decimal-as-strings (subtotal, total_amount, cgst_amount, etc.)

## 4.1 — Types, Zod, API, hooks
- [x] `src/features/proposals/types.ts`
- [x] `src/lib/validations/proposal.schema.ts`
- [x] `src/lib/api/endpoints/proposals.ts`
- [x] `src/lib/api/queryKeys.ts` — add `proposals.all/list/detail`
- [x] `src/features/proposals/hooks/index.ts`

## 4.2 — Status badge component
- [x] `src/features/proposals/components/ProposalStatusBadge.tsx`

## 4.3 — Proposals list page
- [x] `src/features/proposals/ProposalsPage.tsx`
- [x] Status filter tabs: All / Draft / Sent / Accepted / Rejected / Expired
- [x] Desktop table: Client / Booking / Amount / Valid until / Status
- [x] Mobile cards
- [x] Pagination
- [x] Loading skeleton, empty state, error state

## 4.4 — Proposal slide-over
- [x] `src/features/proposals/ProposalSlideOver.tsx`
- [x] Quote tab: line items table, GST breakdown, grand total
- [x] Info tab: client, booking, status, dates (sent/viewed/accepted/valid until)
- [x] Notes tab: inline save ⌘↵ / Esc
- [x] "Send" action (draft only, disabled if expired)

## 4.5 — New proposal dialog
- [x] `src/features/proposals/NewProposalDialog.tsx`
- [x] Dynamic line items with useFieldArray (add/remove rows)
- [x] Live GST calculation preview
- [x] booking_id text field (temporary until Sprint 6 bookings combobox)

## 4.6 — Nav + router + ⌘K
- [x] Enable Proposals in NavTree
- [x] Add `/proposals` route
- [x] ⌘K "New proposal" command

## Test file
- [x] `frontend/testing/proposals.md` — 12 tests

## API issues found this sprint
- api-issues.md row #1: GET /proposals non-paginated envelope
- api-issues.md row #2: New proposal dialog needs booking combobox (Sprint 6)

## Sign-off
- [ ] User says "Sprint 4 looks good, start Sprint 5"
