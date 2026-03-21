# Payments API

Base path: `/api/v1/payments`

Endpoints:
- `GET /api/v1/payments`
- `GET /api/v1/payments/:id`

Key behavior:
- Payment rows are never hard deleted.
- Captured payments are the source of truth for financial totals.
- Database triggers sync `invoice.amount_paid`, `invoice.status`, and `booking.amount_paid`.
- Manual payments are recorded through `POST /api/v1/invoices/:id/record-payment`.

Filtering:
- `invoice_id`
- `booking_id`
- `status`
- `method`
- `page`
- `pageSize`

Payment methods:
- `cash`
- `neft`
- `rtgs`
- `cheque`
- `upi`
- `card`
- `net_banking`
- `wallet`
- `other`
