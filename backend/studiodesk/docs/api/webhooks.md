# Webhooks API

Endpoint:
- `POST /api/v1/webhooks/razorpay`

Critical behavior:
- Razorpay webhook signature is verified before business processing.
- Webhook requests are logged immediately in `webhook_logs`.
- Idempotency is enforced before processing duplicate captured events.
- The endpoint always returns HTTP `200` for provider retries, except fatal JSON parse failures.

Supported events:
- `payment.captured`
- `payment.failed`
- `refund.processed`

Processing notes:
- Captured payments create `payments` rows and rely on DB triggers to update invoice and booking balances.
- Failed payments create `payments` rows with `status='failed'`.
- Refund events create `refunds` rows when the original Razorpay payment is known.
- Duplicate captured events return `{ "status": "duplicate" }`.

Security:
- Never trust webhook payloads without signature validation.
- Never log card secrets; gateway logs store only request/response metadata.
