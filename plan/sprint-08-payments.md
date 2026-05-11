# Sprint 8 — Payments

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Payments ledger: read-only list of all payments with status/method filters, detail slide-over, method + status badges. No creation form — payments are created via "Record payment" in Invoice slide-over (Sprint 7).

## API contracts verified
- [x] `GET /payments` → `Response.paginated` — `apiGetList` works
- [x] `GET /payments/[id]` → `Response.ok(payment)` — amounts are decimal strings
- [x] No POST on `/payments` — creation is via `/invoices/[id]/record-payment`
- [x] Filters: invoice_id, booking_id, status, method

## Build tasks
- [x] `src/features/payments/types.ts`
- [x] `src/lib/api/endpoints/payments.ts`
- [x] `src/lib/api/queryKeys.ts` — add payments keys
- [x] `src/features/payments/hooks/index.ts`
- [x] `src/features/payments/components/PaymentStatusBadge.tsx`
- [x] `src/features/payments/PaymentsPage.tsx`
- [x] `src/features/payments/PaymentSlideOver.tsx`
- [x] `src/app/router.tsx`, `NavTree.tsx`, `CommandPalette.tsx`

## Polish
- [x] Method icons (Cash/UPI/Card visual distinction)
- [x] Razorpay payments show payment ID
- [x] Failed payments show failure_reason
- [x] Empty state: "No payments yet — record a payment against an invoice."

## Test file
- [x] `frontend/testing/payments.md`

## Sign-off
- [ ] User says "looks good, move on"
