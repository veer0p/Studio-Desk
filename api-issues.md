# API Issues Log

Running list of backend API gaps and contract mismatches discovered while building the frontend. Each row tells you what's blocking which screen so you can prioritize backend fixes.

**Convention:**
- I append a row whenever I hit a missing route, broken response shape, or docs/route disagreement.
- The affected frontend UI is disabled with a tooltip ("Coming soon — waiting on backend route X") — never mocked.
- Once you fix the backend, flip Status to **Resolved** in the same row and I'll re-enable the UI path on next sprint touch.

## Open issues

| # | Module | Endpoint | Type | Frontend impact | Detail | Status |
|---|--------|----------|------|------------------|--------|--------|
| 1 | Proposals | GET /proposals | Contract mismatch | Frontend uses `apiGet` instead of `apiGetList`; `totalPages` computed client-side from `total ÷ 20` | Response uses `Response.ok({ items, total })` — not `Response.paginated()`. Missing `meta.page/pageSize/totalPages`. Low priority. | Open |
| 2 | Proposals | POST /proposals | UX constraint | New proposal dialog uses raw UUID text fields for `booking_id` and `client_id` | `createProposalSchema` requires both as UUIDs; booking combobox will replace the booking_id field in Sprint 7 (Invoices touch); client field already has a combobox from Sprint 6 | Open |
| 3 | Bookings | GET /bookings | Contract mismatch | Frontend uses `apiGet` instead of `apiGetList`; pagination computed client-side from `count ÷ 20` | Response uses `Response.ok({ data, count })` — not `Response.paginated()`. Same pattern as proposals (issue #1). Low priority. | Open |

## Resolved issues

| # | Module | Endpoint | Type | Resolution | Closed on |
|---|--------|----------|------|------------|-----------|
| _none yet_ | — | — | — | — | — |
