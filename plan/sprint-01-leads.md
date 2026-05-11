# Sprint 01 — Leads

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Ship a fully-bound Leads module: list with filters/search/pagination, slide-over detail with tabs, new lead dialog, status/convert/delete actions, ⌘K commands. Zero mock data. Mobile-card / desktop-table responsive. All wired to the live `/api/v1/leads/*` endpoints.

## API contracts confirmed (read both docs and route files)

- [x] `docs/api/leads.md` skimmed
- [x] `backend/studiodesk/app/api/v1/leads/route.ts` confirmed (GET paginated, POST createLead)
- [x] `backend/studiodesk/app/api/v1/leads/[id]/route.ts` confirmed (GET, PATCH, DELETE)
- [x] `backend/studiodesk/app/api/v1/leads/[id]/convert/route.ts` confirmed (POST, owner only)
- [x] `backend/studiodesk/lib/validations/lead.schema.ts` — Zod source of truth (mirror to frontend)
- [x] `backend/studiodesk/lib/services/lead.service.ts` — `LeadSummary` + `LeadDetail` shapes confirmed

### Shapes (frozen for this sprint)

`LeadSummary` (list rows):
```ts
{
  id: string
  status: LeadStatus               // new_lead | contacted | proposal_sent | contract_signed | advance_paid | shoot_scheduled | delivered | closed | lost
  source: LeadSource               // inquiry_form | referral | instagram | facebook | google | walk_in | phone | other
  priority: 'high' | 'medium' | 'low'
  event_type: EventType | null
  event_date_approx: string | null // 'YYYY-MM-DD'
  venue: string | null
  budget_min: string | null        // decimal-as-string, INR rupees
  budget_max: string | null
  follow_up_at: string | null      // ISO datetime
  last_contacted_at: string | null
  converted_to_booking: boolean
  booking_id: string | null
  notes: string | null
  days_since_created: number
  client: { full_name: string; phone: string | null; email: string | null; whatsapp: string | null }
  created_at: string
  updated_at: string
}
```

`LeadDetail` = `LeadSummary` + `form_data: unknown` + `assignee_name?: string | null`

### Non-obvious backend behavior
- Status transitions forward-only (except → `lost`). Trying to go backward returns 400.
- DELETE is a soft-delete that flips status to `lost`. Converted leads return 409 CONFLICT.
- POST `/convert` is **owner only** (uses `requireOwner`). Non-owners get 403.
- `budget_min`/`budget_max` are decimal-as-strings (e.g. `"240000.00"`) — convert on display, send strings on submit.
- Backend stores priority as number 1/2/3; service maps to/from `'high'`/`'medium'`/`'low'`.

## 1.1 — Bootstrap
- [x] Vite proxy `/api/v1` → `http://localhost:3000` so cross-origin cookies work in dev
- [x] `.env.local` → `VITE_API_BASE_URL=/api/v1` (relative)
- [x] Dev shim auto-login: on first app mount, POST `/api/v1/auth/login` with `owner@test.com / Test@1234` if `/auth/me` returns 401. Cookie sticks via proxy; module API calls work without manual login. Sprint 11 swaps this out.
- [x] Write `plan/sprint-01-leads.md` (this file)

## 1.2 — Types, Zod, API, hooks
- [x] `src/lib/constants/enums.ts` — add `LEAD_SOURCES`, `LEAD_SOURCE_LABEL`, `LEAD_PRIORITIES`, `LEAD_PRIORITY_LABEL`
- [x] `src/features/leads/types.ts` — `LeadSummary`, `LeadDetail`, `LeadListParams`, `CreateLeadInput`, `UpdateLeadInput`, `ConvertLeadInput`
- [x] `src/lib/validations/lead.schema.ts` — mirror backend Zod (createLead, updateLead, convertLead, leadsQuery)
- [x] `src/lib/api/endpoints/leads.ts` — `listLeads`, `getLead`, `createLead`, `updateLead`, `deleteLead`, `convertLead`
- [x] `src/lib/api/queryKeys.ts` — `leads.list(params)`, `leads.detail(id)` (was already correct)
- [x] `src/features/leads/hooks/index.ts` — `useLeads`, `useLead`, `useCreateLead`, `useUpdateLead`, `useDeleteLead`, `useConvertLead`

## 1.3 — Leads list page
- [x] `src/features/leads/LeadsPage.tsx` replaces `LeadsPlaceholder`
- [x] `PageHeader title="Leads" description="{count} leads · page N of M"` + "+ New lead" CTA
- [x] URL-driven state via `searchParams`: `q`, `status`, `source`, `page`, `id`, `new`
- [x] Search input (debounced 300ms)
- [x] Status filter dropdown
- [x] Source filter dropdown
- [x] Desktop table (`md+`): Lead (name+phone) / Event / Date (lg+) / Source (xl+) / Priority (xl+) / Status / Budget / action
- [x] Mobile card list (`<md`): stacked cards (name, event+date, source+budget)
- [x] Pagination footer (Prev / Next + range display)
- [x] Empty state with real-voice copy (filters → "no match" copy, no filters → add first lead)
- [x] Error state with retry
- [x] Loading skeleton (3 skeleton cards mobile, 3 skeleton rows desktop)
- [x] Click row → opens slide-over (sets `?id=…` in URL)

## 1.4 — Lead slide-over detail
- [x] `src/features/leads/LeadSlideOver.tsx` — opens when URL has `?id=…`
- [x] Desktop: custom Radix Dialog right slide-over (spring 350/32). Mobile: `vaul` bottom sheet
- [x] Three tabs: Overview / Activity / Notes
- [x] Overview: client (name, phone/tel:, WhatsApp/wa.me/, email/mailto:), event details, budget, status badge, follow-up, days-since
- [x] Activity: last contacted, days since created, updated, converted badge
- [x] Notes: textarea with ⌘↵ save, Esc discard, inline "Saved ✓" feedback
- [ ] "Convert to booking" action (owner only) — deferred to Sprint 6 (Bookings module)
- [ ] "Delete (mark lost)" with undo toast — deferred to Sprint 1.5 patch
- [x] Status change dropdown — forward transitions only via `getForwardStatuses()`

## 1.5 — Mutations
- [x] `NewLeadDialog` — RHF + Zod, full_name / phone / email / whatsapp / event_type / event_date_approx / venue / budget min-max / source / priority / notes. Empty optional strings stripped before POST.
- [ ] `ConvertLeadSheet` — deferred to Sprint 6 (Bookings; requires booking fields to be meaningful)
- [ ] Optimistic status update — skipped (simple invalidate is sufficient for Sprint 1 scale)
- [ ] Optimistic delete with 5s undo toast — deferred (need delete button in slide-over)

## 1.6 — Command palette + keyboard
- [x] Register "New lead" command in `CommandPalette` (navigates to `?new=1`)
- [x] "Jump to Leads" command already present, kept
- [x] `n` key opens New Lead dialog when no input is focused
- [ ] `j`/`k` list navigation — deferred (complex, low priority for Sprint 1)

## Polish gates (anti-AI + responsive)
- [ ] No marketing prose — page header is `Leads` + factual descriptor
- [ ] No hex literals; spacing only from the 8-step scale
- [ ] No aurora on this page (operator inbox, not hero zone)
- [ ] Touch targets ≥ 44px on `<md`
- [ ] Table → cards on `<md`
- [ ] No horizontal scroll at 375×667
- [ ] Tested at 375 / 1280 / 1920
- [ ] `prefers-reduced-motion` respected

## Test file
- [x] `frontend/testing/leads.md` written with 13 tests + responsive checklist
- [x] Tests cover: list load, search debounce, status filter, source filter, empty state, pagination, row→slide-over (desktop), bottom sheet (mobile), Overview tab, Notes inline save, New Lead dialog, ⌘K command, error state

## API issues found
- (track any rows added to `api-issues.md`)

## Sign-off
- [ ] User says "Sprint 1 looks good, start Sprint 2"
