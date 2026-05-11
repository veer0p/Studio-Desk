# Sprint 05 — Contracts

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Ship the Contracts module: list with status tabs, slide-over (Contract HTML preview / Info / Notes), send + reminder actions, new contract dialog.

## API contracts confirmed

- [x] GET /contracts — uses `Response.paginated` ✅ standard `apiGetList` works
- [x] POST /contracts — requires only `booking_id` (template auto-selected by event type)
- [x] GET /contracts/[id]
- [x] PATCH /contracts/[id] — draft only; only `content_html` and `notes`
- [x] POST /contracts/[id]/send
- [x] POST /contracts/[id]/remind — rate-limited: once per 24 hours per contract

### Non-obvious backend behavior
- `createContract` auto-selects a template by `booking.event_type` if no `template_id` given; throws 422 if no template exists for the studio yet (seeded on first call to `getTemplates`)
- PATCH: throws 409 for non-draft; only `content_html` and `notes` are patchable
- `sendContract`: draft → sent; throws if signed or cancelled; resend allowed (refreshes sent_at)
- `remindContract`: only for status=sent; throws 409 if reminded in last 24h
- `signed_ip` is stored but not shown in the public-facing UI (internal only)
- DELETE is soft-delete (owner only); contract stays in DB

## 5.1 — Types, Zod, API, hooks
- [x] `src/features/contracts/types.ts`
- [x] `src/lib/validations/contract.schema.ts`
- [x] `src/lib/api/endpoints/contracts.ts`
- [x] `src/lib/api/queryKeys.ts` — add `contracts.all/list/detail`
- [x] `src/features/contracts/hooks/index.ts`

## 5.2 — Status badge component
- [x] `src/features/contracts/components/ContractStatusBadge.tsx`

## 5.3 — Contracts list page
- [x] `src/features/contracts/ContractsPage.tsx`
- [x] Status tabs: All / Draft / Sent / Signed / Cancelled
- [x] Desktop table: Client / Booking / Status / Sent / Signed
- [x] Mobile cards
- [x] Pagination
- [x] Loading skeleton, empty state, error state

## 5.4 — Contract slide-over
- [x] `src/features/contracts/ContractSlideOver.tsx`
- [x] Contract tab: sanitized HTML preview (dangerouslySetInnerHTML with DOMPurify-style trust; backend already sanitizes)
- [x] Info tab: client, booking, status, timeline dates
- [x] Notes tab: inline save ⌘↵ / Esc
- [x] "Send" action (draft)
- [x] "Remind" action (sent, disabled < 24h since last reminder)

## 5.5 — New contract dialog
- [x] `src/features/contracts/NewContractDialog.tsx`
- [x] booking_id text field (same amber warning as proposals — Sprint 6 will replace with combobox)

## 5.6 — Nav + router + ⌘K
- [x] Enable Contracts in NavTree
- [x] Add `/contracts` route
- [x] ⌘K "New contract" command

## Test file
- [x] `frontend/testing/contracts.md` — 11 tests

## API issues found this sprint
- No new issues (contracts API is clean)

## Sign-off
- [ ] User says "Sprint 5 looks good, start Sprint 6"
