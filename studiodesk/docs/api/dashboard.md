# Dashboard & Analytics API

Base paths:
- `/api/v1/dashboard`
- `/api/v1/analytics`
- `/api/v1/cron`

## Contract Notes

The API shape follows the requested dashboard contract, but the live schema in this repo is narrower in a few places:
- `revenue_snapshots` currently stores `total_bookings`, `new_leads`, `invoices_sent`, `revenue_collected`, `revenue_pending`, `photos_delivered`, and `storage_used_gb`.
- The dashboard layer derives missing prompt fields such as `revenue_overdue`, `active_bookings`, `converted_leads`, and `invoices_paid` from the raw tables.
- `shoot_assignments` stores `call_time` and `is_confirmed`; today’s shoot view uses those values plus booking and client data.
- `galleries` uses `is_published`, `view_count`, `download_count`, and `published_at` for delivery analytics.

## Endpoints

### GET `/api/v1/dashboard/overview`
- Auth: any studio member
- Cache-Control: `private, max-age=120, stale-while-revalidate=60`
- Returns the morning summary: greeting, up to 5 attention items, this month snapshot, and the upcoming week.
- Attention items are sorted by severity `red`, `amber`, then `blue`.

### GET `/api/v1/dashboard/today`
- Auth: any studio member
- Cache-Control: `no-store`
- Returns today’s shoots and tasks.
- Non-owner members only see shoots they are assigned to.

### GET `/api/v1/analytics/revenue`
- Auth: owner only
- Query: `months=3|6|12|24`, `compare=true|false`
- Cache-Control: `private, max-age=600`
- Returns chart data built from `revenue_snapshots`.

### GET `/api/v1/analytics/bookings`
- Auth: owner only
- Query: `period=this_month|last_month|this_quarter|this_fy|last_fy`
- Cache-Control: `private, max-age=600`
- Returns the booking funnel, lead source breakdown, and event type breakdown.

### GET `/api/v1/analytics/performance`
- Auth: owner only
- Query: `period=this_month|last_month|this_quarter|this_fy|last_fy`
- Cache-Control: `private, max-age=600`
- Returns team performance plus gallery delivery metrics.

### POST `/api/v1/cron/snapshot`
- Auth: `Authorization: Bearer <CRON_SECRET>`
- Purpose: populate one daily `revenue_snapshots` row per active studio.
- Intended to run once per day at midnight IST.
- Batch processing should be done in groups of 10 studios.

## Snapshot Fields

The cron job should write or update:
- `total_bookings`
- `new_leads`
- `invoices_sent`
- `revenue_collected`
- `revenue_pending`
- `photos_delivered`
- `storage_used_gb`

## Response Expectations

- Monetary values should be returned as numeric strings in dashboard summary responses.
- Analytics endpoints should return chart-friendly numeric values.
- Public client PII should never leak into analytics aggregates.
- The overview endpoint should remain fast by leaning on `revenue_snapshots` instead of raw aggregate scans.
