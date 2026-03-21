# Contracts API

## Endpoints

### GET /api/v1/contracts
- Auth: required
- Query: `status`, `booking_id`, `page`, `pageSize`
- Returns paginated contract summaries
- Cache-Control: `no-store`

### POST /api/v1/contracts
- Auth: owner
- Body: `booking_id`, optional `template_id`, `custom_content`, `notes`
- Creates a draft contract
- Uses event-specific template first, then the studio default template
- Returns `422` when no template exists and no custom content is supplied

### GET /api/v1/contracts/:id
- Auth: required
- Returns full contract detail for the studio
- Cache-Control: `no-store`

### PATCH /api/v1/contracts/:id
- Auth: owner
- Updates `content_html` and/or `notes`
- Only `draft` contracts are editable

### DELETE /api/v1/contracts/:id
- Auth: owner
- Hard deletes a `draft` contract
- Sent, signed, and cancelled contracts are immutable

### POST /api/v1/contracts/:id/send
- Auth: owner
- Sends or resends a contract link to the client
- Side effects:
  - marks `draft` as `sent`
  - writes `booking_activity_feed`
  - writes `automation_log`
  - writes `email_delivery_logs` through Resend logging

### POST /api/v1/contracts/:id/remind
- Auth: owner
- Resends the contract reminder
- Only allowed for contracts in `sent` state
- 24-hour cooldown based on `reminder_sent_at`

### GET /api/v1/contracts/view/:token
- Auth: none
- Token-only public access
- Returns public contract view with studio branding and booking details
- Never exposes `signed_ip`, `signed_user_agent`, `access_token`, or tax details
- Marks `viewed_at` asynchronously
- Cache-Control: `private, max-age=60`

### POST /api/v1/contracts/sign/:token
- Auth: none
- Token-only public access
- Body: `signature_data`, optional `signed_name`
- Signs only when current state is `sent`
- Stores `signed_ip` and `signed_user_agent` for the audit trail
- Updates the related booking to `contract_signed`

### GET /api/v1/contract-templates
- Auth: required
- Lists active templates for the studio
- Auto-seeds default templates when none exist
- Cache-Control: `no-store`

### POST /api/v1/contract-templates
- Auth: owner
- Creates a template
- Strips `<script>` tags from `content_html`
- Setting `is_default=true` clears the previous default template

### PATCH /api/v1/contract-templates/:id
- Auth: owner
- Updates template metadata or HTML
- Strips `<script>` tags from `content_html`

### DELETE /api/v1/contract-templates/:id
- Auth: owner
- Soft deletes a template by setting `is_active=false`
- Blocked when any draft contract still uses the template

## Contract Rules

- Status flow: `draft -> sent -> signed | cancelled`
- `draft`: editable, deletable, sendable
- `sent`: resendable, not editable, not deletable
- `signed` and `cancelled`: terminal and immutable
- Signed contracts are protected against double-signing with `WHERE status='sent'`

## Template Variables

- `{{client_name}}`
- `{{event_date}}`
- `{{venue}}`
- `{{event_type}}`
- `{{package_name}}`
- `{{total_amount}}`
- `{{advance_amount}}`
- `{{balance_amount}}`
- `{{studio_name}}`
- `{{studio_phone}}`
- `{{studio_email}}`
- `{{turnaround_days}}`
- `{{today_date}}`

## Security Notes

- HTML content is sanitized by stripping `<script>` tags before storage
- Signature payload is stored as raw data only and never executed server-side
- Public endpoints rely on a 64-character hex token
- Signature audit trail stores IP and user agent, but public responses never expose them
