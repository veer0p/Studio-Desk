# Team & Scheduling API

Base paths:
- `/api/v1/bookings/:id/assignments`
- `/api/v1/assignments/:id`
- `/api/v1/team/schedule`
- `/api/v1/team/:memberId/assignments`
- `/api/v1/bookings/:id/shoot-brief`

Endpoints:
- `GET /api/v1/bookings/:id/assignments`
- `POST /api/v1/bookings/:id/assignments`
- `PATCH /api/v1/assignments/:id`
- `DELETE /api/v1/assignments/:id`
- `GET /api/v1/team/schedule`
- `GET /api/v1/team/:memberId/assignments`
- `GET /api/v1/bookings/:id/shoot-brief`
- `POST /api/v1/bookings/:id/shoot-brief`

Key rules:
- Assignment conflicts are warnings, never blocking errors.
- Only owners can create or delete assignments.
- Members can confirm or decline only their own assignments.
- Non-owners can only view their own assignment list in `/team/:memberId/assignments`.
- Schedule queries are capped to a 90-day range.
- Shoot brief writes are upserts, so `POST` handles both create and update.
- Declining an assignment always requires `decline_reason`.
