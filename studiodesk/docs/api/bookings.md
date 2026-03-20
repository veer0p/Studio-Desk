# Bookings API

## GET /api/v1/bookings
List bookings for the studio.

- **Auth**: Required (any member)
- **Query Params**:
  - `status`: Filter by status (new_lead, booked, etc.)
  - `event_type`: Filter by event type
  - `search`: Search by title or client name
  - `from_date`: ISO date
  - `to_date`: ISO date
- **Response**: `200 OK` with paginated bookings list.

## POST /api/v1/bookings
Create a new booking manually.

- **Auth**: Required (any member)
- **Body**:
  ```json
  {
    "title": "Wedding: Rahul & Priya",
    "client_id": "uuid",
    "event_type": "wedding",
    "event_date": "2024-12-25T10:00:00Z",
    "total_amount": 150000,
    "advance_amount": 50000
  }
  ```
- **Response**: `201 Created`

## GET /api/v1/bookings/:id
Get full details of a single booking.

- **Auth**: Required (any member)

## PATCH /api/v1/bookings/:id
Update booking details.

- **Note**: `total_amount` cannot be changed if payments exist. `event_date` cannot be changed if status is `delivered`.

## DELETE /api/v1/bookings/:id
Soft delete a booking.

- **Auth**: Required (Owner only)
- **Note**: Only `new_lead` and `lost` bookings can be deleted.

## GET /api/v1/bookings/:id/activity
Get activity feed (audit trail) for a booking.

## PATCH /api/v1/bookings/:id/status
Update booking status with transition validation.

- **Body**: `{ "status": "shoot_completed" }`
