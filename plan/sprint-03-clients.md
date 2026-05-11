# Sprint 03 — Clients

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Ship the Clients module: list with search/pagination, slide-over (Overview/Bookings/Notes), new/edit dialog. All wired to live `/api/v1/clients/*` endpoints.

## API contracts confirmed

- [x] `backend/studiodesk/app/api/v1/clients/route.ts` — GET paginated, POST createClient
- [x] `backend/studiodesk/app/api/v1/clients/[id]/route.ts` — GET detail, PATCH, DELETE (owner-only)
- [x] `backend/studiodesk/lib/validations/client.schema.ts` — Zod source of truth
- [x] `backend/studiodesk/lib/services/client.service.ts` — ClientSummary + ClientDetail shapes confirmed

### Shapes (frozen)

`ClientSummary` (list rows):
```ts
{
  id: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  city: string | null
  state: string | null
  company_name: string | null
  gstin: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}
```

`ClientDetail` = `ClientSummary` + `address | null` + `pincode | null` + `notes | null` +
```ts
stats: { total_bookings: number; total_revenue: string; total_paid: string }
bookings: Array<{ id, title, event_type, event_date, status, total_amount, amount_paid, amount_pending }>
```

### Non-obvious backend behavior
- Phone uniqueness per studio: POST / PATCH returns 409 CONFLICT if another client has the same phone
- DELETE is soft-delete, owner-only (non-owners get 403)
- `stats.total_revenue` / `total_paid` are decimal-as-strings — convert before display
- `tags` is `string[]` — send as array, display as pills
- `state_id` (int) is accepted by backend but optional; `state` (string) is what's shown in the UI

## 3.1 — Types, Zod, API, hooks
- [x] `src/features/clients/types.ts` — ClientSummary, ClientDetail, ClientListParams
- [x] `src/lib/validations/client.schema.ts` — mirror backend Zod
- [x] `src/lib/api/endpoints/clients.ts` — listClients, getClient, createClient, updateClient, deleteClient
- [x] `src/lib/api/queryKeys.ts` — add `clients.all/list/detail`
- [x] `src/features/clients/hooks/index.ts` — useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient

## 3.2 — Clients list page
- [x] `src/features/clients/ClientsPage.tsx`
- [x] URL-driven state: `q`, `page`, `id`
- [x] Search input (debounced 300ms)
- [x] Desktop table: Name / Phone / Email / City / Tags / →
- [x] Mobile cards: name + phone + city + tags
- [x] Pagination footer
- [x] Loading skeleton, empty state, error state
- [x] Click row → slide-over (`?id=`)

## 3.3 — Client slide-over
- [x] `src/features/clients/ClientSlideOver.tsx`
- [x] Desktop: Radix Dialog right panel. Mobile: vaul bottom sheet
- [x] Overview tab: contact info (tel:/wa.me:/mailto: links), address, GSTIN, company, tags, stats card
- [x] Bookings tab: list of linked bookings with status, date, amounts
- [x] Notes tab: inline save ⌘↵ / Esc

## 3.4 — New/Edit client dialog
- [x] `src/features/clients/NewClientDialog.tsx` — RHF + Zod, all fields, 409-conflict handling
- [x] `n` key shortcut + ⌘K "New client" command

## 3.5 — Nav + router
- [x] Enable Clients in NavTree (`enabled: true`)
- [x] Add `/clients` route to router

## Test file
- [x] `frontend/testing/clients.md` — 10 tests

## Sign-off
- [ ] User says "Sprint 3 looks good, start Sprint 4"
