# Clients API

## GET /api/v1/clients

List clients with optional search and pagination. Search uses full_name, phone, email (ILIKE).

- **Auth**: Required (any member)
- **Query**: search?, page (default 0), pageSize (default 20)
- **Response**: Paginated ClientSummary[] with meta (count, page, pageSize, totalPages)
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403

---

## POST /api/v1/clients

Create client. Duplicate phone within studio returns 409.

- **Auth**: Required (any member)
- **Body**: `createClientSchema` — full_name, phone, email?, whatsapp?, address?, city?, state?, state_id?, pincode?, company_name?, gstin?, notes?, tags?
- **Response**: Created ClientSummary (201 Created)
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 409 CONFLICT (phone already exists)

---

## GET /api/v1/clients/:id

Client detail with booking history and stats (total_bookings, total_revenue, total_paid). Three parallel queries.

- **Auth**: Required (any member)
- **Params**: id (UUID)
- **Response**: ClientDetail (id, full_name, contact fields, address, stats, bookings[])
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND

---

## PATCH /api/v1/clients/:id

Update client. If phone is changed, must not conflict with another client in studio.

- **Auth**: Required (any member)
- **Params**: id (UUID)
- **Body**: `updateClientSchema` (partial create; at least one field)
- **Response**: Updated ClientSummary
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND, 409 CONFLICT (phone)

---

## DELETE /api/v1/clients/:id

Soft delete client. Owner only. Blocked if client has active bookings (status not closed/lost).

- **Auth**: Required (owner only)
- **Params**: id (UUID)
- **Response**: 204 No Content
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND, 409 CONFLICT (active bookings)
