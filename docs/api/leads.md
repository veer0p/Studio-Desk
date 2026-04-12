# Leads API

## POST /api/v1/inquiry (public)

Public lead capture form. No auth. Rate limited.

- **Auth**: None (public)
- **Query**: `?studio=<studioSlug>` (required)
- **Body**: `inquiryFormSchema` — full_name, phone, email?, event_type?, event_date?, venue?, budget_min?, budget_max?, message?, guest_count?
- **Response**: `{ lead_id, message: "Thank you! We will get back to you shortly." }` (201 Created)
- **Side effects**:
  - Finds or creates client by phone; creates lead with source `inquiry_form`
  - Fire-and-forget: automation_log (lead_acknowledgment), optional WhatsApp/email auto-reply
- **Rate limit**: 5 submissions per IP per hour per studio (429 RATE_LIMITED)
- **Error codes**: 400 MISSING_STUDIO, 400 VALIDATION_ERROR, 404 NOT_FOUND (studio), 429 RATE_LIMITED

---

## GET /api/v1/leads

List leads with filters and pagination. Single join query; form_data excluded from list.

- **Auth**: Required (any member)
- **Query**: status?, source?, event_type?, assigned_to?, search?, from_date?, to_date?, page (default 0), pageSize (default 20)
- **Response**: Paginated `LeadSummary[]` with meta (count, page, pageSize, totalPages). Each item includes client (full_name, phone, email, whatsapp), priority label, days_since_created.
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403

---

## POST /api/v1/leads

Manual lead entry. Find-or-create client by phone if client_id not provided.

- **Auth**: Required (any member)
- **Body**: `createLeadSchema` — full_name, phone, email?, whatsapp?, client_id?, event_type?, event_date_approx?, venue?, budget_min?, budget_max?, source (default phone), priority (default medium), notes?, assigned_to?
- **Response**: Created LeadDetail (201 Created)
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR

---

## GET /api/v1/leads/:id

Single lead detail including form_data.

- **Auth**: Required (any member)
- **Params**: id (UUID)
- **Response**: LeadDetail
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND

---

## PATCH /api/v1/leads/:id

Update lead. Status transitions: forward only (except → lost). follow_up_at must be future.

- **Auth**: Required (any member)
- **Params**: id (UUID)
- **Body**: `updateLeadSchema` — status?, priority?, event_date_approx?, venue?, budget_min?, budget_max?, follow_up_at?, notes?, assigned_to?
- **Response**: Updated LeadDetail
- **Cache-Control**: `no-store`
- **Side effects**: On status change, last_contacted_at set to now
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND

---

## DELETE /api/v1/leads/:id

Soft delete: mark lead as lost. Converted leads cannot be deleted.

- **Auth**: Required (any member)
- **Params**: id (UUID)
- **Response**: 204 No Content
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND, 409 CONFLICT (already converted)

---

## POST /api/v1/leads/:id/convert

Convert lead to booking. Owner only.

- **Auth**: Required (owner only)
- **Params**: id (UUID)
- **Body**: `convertLeadSchema` — event_date (required), title?, total_amount?, advance_amount?, package_id?, gst_type (default cgst_sgst)
- **Response**: `{ booking_id }` (201 Created)
- **Side effects**:
  - Inserts booking; marks lead converted (status contract_signed, booking_id set)
  - Writes to booking_activity_feed (event_type: lead_converted)
  - On lead update failure after booking insert: soft-deletes booking and rethrows
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND, 409 CONFLICT (already converted or lost)
