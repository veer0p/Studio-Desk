# Proposals API

## GET /api/v1/proposals

List proposals for the studio.

- **Auth**: Required (any member)
- **Query Params**:
  - `status`: `draft`, `sent`, `accepted`, `rejected`, `expired`
  - `booking_id`: UUID
  - `page`: number (default 0)
  - `pageSize`: number (default 20)
- **Response**: `ProposalSummary[]`
- **Cache-Control**: `no-store`

---

## POST /api/v1/proposals

Create a new proposal in `draft` status.

- **Auth**: Required (any member)
- **Body**: `createProposalSchema`
- **Response**: `ProposalDetail` (201)
- **Side effects**: Audit log entry (fire-and-forget)

---

## GET /api/v1/proposals/:id

Fetch detailed proposal with line items. Flattens booking and client info.

- **Auth**: Required (any member)
- **Response**: `ProposalDetail`
- **Cache-Control**: `no-store`

---

## PATCH /api/v1/proposals/:id

Update a draft proposal. Replaces line items if provided.

- **Auth**: Required (any member)
- **Body**: `updateProposalSchema` (partial)
- **Response**: `ProposalDetail`
- **Side effects**: Audit log entry (fire-and-forget)
- **Error codes**: 409 CONFLICT if status is not `draft`

---

## DELETE /api/v1/proposals/:id

Delete a draft proposal (hard delete). Prohibited for sent/accepted proposals.

- **Auth**: Required (any member)
- **Response**: 200 `{ deleted: true }`
- **Error codes**: 409 CONFLICT if status is not `draft`

---

## POST /api/v1/proposals/:id/send

Mark proposal as `sent` and notify client via email/WhatsApp.

- **Auth**: Required (any member)
- **Response**: `ProposalDetail`
- **Side effects**: 
  - Status set to `sent`
  - Client emailed via Resend
  - WhatsApp log entry created
  - Booking activity feed updated
- **Error codes**: 409 CONFLICT if already accepted or expired

---

## GET /api/v1/proposals/view/:token

Public view of the proposal for the client. No auth required.

- **Auth**: None
- **Response**: `PublicProposalView`
- **Side effects**: Marks proposal as `viewed` (fire-and-forget)

---

## POST /api/v1/proposals/:id/accept

Public endpoint for client to accept or reject a proposal.

- **Auth**: None
- **Body**: 
  - `token`: Required (access_token)
  - `action`: `accept` | `reject`
  - `reason`: string (optional for rejection)
- **Response**: 200 `{ success: true, booking_id }`
- **Side effects**: 
  - Status set to `accepted` or `rejected`
  - Booking status updated to `contract_signed` (if accepted)
  - Booking activity feed updated
- **Error codes**: 409 CONFLICT if expired or already accepted
