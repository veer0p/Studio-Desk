# Automations API

## Overview

The Automations API exposes the studio automation control plane for WhatsApp and email messaging.
The public API keeps the prompt-shaped fields used by the frontend:

- `delay_days`
- `delay_hours`
- `channel`
- `send_time`
- `message_preview`
- `error_message`
- `scheduled_at`

Internally, the live database stores those values using the current schema columns:

- `trigger_offset_days`
- `trigger_delay_hours`
- `send_email`
- `send_whatsapp`
- `custom_subject`
- `custom_message`
- `message_body`
- `failure_reason`
- `scheduled_for`

`send_time` is an API-level presentation field in the current schema bridge; the database stores the trigger offset fields and the service layer uses the prompt defaults for display.

## Endpoints

### GET `/api/v1/automations/settings`
- Auth: owner
- Returns all studio automation settings.
- Auto-seeds default settings on first read.
- Cache-Control: `no-store`

### PATCH `/api/v1/automations/settings`
- Auth: owner
- Body: `settings[]`
- Updates the automation controls for the studio.
- `delay_days` is validated to `0-30`, `delay_hours` to `0-23`, and `send_time` to `HH:MM`.

### GET `/api/v1/automations/log`
- Auth: owner
- Returns paginated automation delivery logs.
- Filters: `automation_type`, `channel`, `status`, `booking_id`, `lead_id`, `from_date`, `to_date`
- Cache-Control: `no-store`

### POST `/api/v1/automations/trigger`
- Auth: owner
- Manually triggers an automation for a booking or lead.
- Manual trigger is immediate and does not apply studio delay rules.

### GET `/api/v1/automations/templates`
- Auth: owner
- Returns active WhatsApp templates plus built-in automation template metadata.
- The repository returns custom studio templates from `whatsapp_templates`; built-in templates are merged by the service layer.
- Cache-Control: `no-store`

### POST `/api/v1/automations/test`
- Auth: owner
- Sends a test automation message to a studio-provided phone number.
- Rate limited to `10` per hour per studio.

### GET `/api/v1/automations/stats`
- Auth: owner
- Returns delivery stats for the selected period.
- Cache-Control: `private, max-age=300`

## Automation Types

- `lead_acknowledgment`
- `lead_follow_up`
- `proposal_sent`
- `proposal_reminder`
- `contract_sent`
- `contract_reminder`
- `contract_signed`
- `advance_payment_reminder`
- `balance_payment_reminder`
- `payment_overdue_reminder`
- `payment_received`
- `gallery_ready`
- `gallery_reminder`
- `shoot_reminder`
- `post_shoot_followup`

## Notes

- `sendAutomation` is always fire-and-forget in the calling services.
- Disabled automations never send.
- WhatsApp recipients are normalized with the `+91` prefix in the service layer.
- Log previews are capped at `200` characters.
- Delivery stats are computed from the live log table and cached at the API layer for `5` minutes.
