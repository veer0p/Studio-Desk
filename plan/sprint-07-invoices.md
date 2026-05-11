# Sprint 7 — Invoices

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
GST-compliant invoice list, slide-over with line items + GST totals, create from booking (line items + type selector), send, record payment, credit note.

## API contracts verified
- [x] `GET /invoices` → `Response.paginated` — `apiGetList` works
- [x] `POST /invoices` → `Response.created(invoice)` — requires booking_id + line_items (min 1)
- [x] `GET /invoices/[id]` → `Response.ok({ ...invoice, line_items })` — amounts are decimal strings
- [x] `PATCH /invoices/[id]` → notes / internal_notes / due_date only
- [x] `POST /invoices/[id]/send`
- [x] `POST /invoices/[id]/record-payment` → RecordPaymentInput (amount as string, method, optional ref/date/bank/notes)
- [x] `POST /invoices/[id]/credit-note` → { amount (string), reason (min 10 chars) }
- [x] `POST /invoices/[id]/payment-link` → generates Razorpay link

## Build tasks
- [x] `src/features/invoices/types.ts`
- [x] `src/lib/validations/invoice.schema.ts`
- [x] `src/lib/api/endpoints/invoices.ts`
- [x] `src/lib/api/queryKeys.ts` — add invoices keys
- [x] `src/features/invoices/hooks/index.ts`
- [x] `src/features/invoices/components/InvoiceStatusBadge.tsx`
- [x] `src/features/invoices/InvoicesPage.tsx`
- [x] `src/features/invoices/InvoiceSlideOver.tsx`
- [x] `src/features/invoices/NewInvoiceDialog.tsx`
- [x] `src/app/router.tsx`, `NavTree.tsx`, `CommandPalette.tsx`

## Polish
- [x] INR amounts from decimal strings via Number()
- [x] Line items table with subtotal + GST breakdown
- [x] Record payment dialog (method selector + ref number)
- [x] Credit note button (signed invoices only)
- [x] "Overdue" badge with red styling
- [x] Payment link copy button

## Test file
- [x] `frontend/testing/invoices.md`

## Sign-off
- [ ] User says "looks good, move on"
