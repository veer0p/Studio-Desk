# Team Management API

## GET /api/v1/team

List all active studio members.

- **Auth**: Required (any member)
- **Response**: TeamMember[]
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403

---

## POST /api/v1/team/invite

Invite a new member by email. Owner only.

- **Auth**: Required (owner only)
- **Body**: `{ email: string, role: "photographer" | "videographer" | "editor" | "assistant" }`
- **Response**: `{ invitation_id, email, resent }` (201 Created)
- **Cache-Control**: `no-store`
- **Side effects**:
  - Creates `studio_invitations` row
  - Sends invitation email via Resend
  - Logs to `email_delivery_logs` and `automation_log`
  - If pending invite exists: resends and resets expiry
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 409 CONFLICT, 422 QUOTA_EXCEEDED

---

## POST /api/v1/team/accept/:token

Accept an invitation (public, no auth). Token must be 64 hex characters.

- **Auth**: None (public)
- **Params**: `token` — 64-character hex string
- **Response**: `{ studio_name, role, email, user_existed, message }`
- **Cache-Control**: `no-store`
- **Side effects**:
  - Creates or reuses Supabase auth user
  - Creates or reactivates `studio_members` row
  - Marks invitation as accepted
  - Logs security event
- **Rate limit**: 10 attempts per IP per hour (429 RATE_LIMITED)
- **Error codes**: 400 INVALID_TOKEN, 404 NOT_FOUND, 409 CONFLICT, 400 VALIDATION_ERROR, 429 RATE_LIMITED

---

## PATCH /api/v1/team/:memberId/role

Change a member’s role. Owner only. Cannot set or change owner role.

- **Auth**: Required (owner only)
- **Body**: `{ role: "photographer" | "videographer" | "editor" | "assistant" }`
- **Response**: Updated TeamMember
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND

---

## DELETE /api/v1/team/:memberId

Deactivate a team member (soft remove). Owner only. Cannot remove self or owner.

- **Auth**: Required (owner only)
- **Response**: 204 No Content
- **Error codes**: 401, 403, 400 VALIDATION_ERROR, 404 NOT_FOUND
