# Settings & Admin API

All endpoints are owner-only unless noted. API keys are encrypted at rest and are never returned in raw form.

## `GET /api/v1/settings/notifications`
Returns the studio notification preferences. The current StudioDesk schema stores the core email/WhatsApp toggles in `studio_settings` and keeps the extended preference payload in a JSON blob inside `invoice_footer_text` for backward-compatible round-tripping.

## `PATCH /api/v1/settings/notifications`
Updates notification preferences. Supported fields:
`notify_new_lead`, `notify_payment`, `notify_contract_signed`, `notify_gallery_viewed`, `notify_team_confirmed`, `notify_team_declined`, `notify_via_email`, `notify_via_whatsapp`, `working_hours_start`, `working_hours_end`, `timezone`.

## `GET /api/v1/settings/integrations`
Returns masked integration status for WhatsApp, Razorpay, and Immich. The response never includes decrypted keys.

## `PATCH /api/v1/settings/integrations`
Updates integration keys and connection metadata. WhatsApp and Immich keys are encrypted before storage.

## `POST /api/v1/settings/integrations/test`
Tests one integration at a time. This endpoint always returns HTTP `200` for delivery success/failure; the result is reported in the JSON body. The only HTTP `400` responses are for invalid input or missing configuration.

## `GET /api/v1/settings/billing`
Returns plan, pricing, usage, and upgrade recommendations. Cache header: `private, max-age=300`.

## Notes
- Working hours are stored as `HH:MM`.
- Billing uses the active plan, member count, and current usage to calculate limits and upgrade recommendations.
- The settings routes follow the same auth and response conventions as the rest of StudioDesk.
