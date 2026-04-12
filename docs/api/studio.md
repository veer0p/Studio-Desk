# Studio Profile API

Manage studio profile settings, branding, and billing info.

## GET /api/v1/studio/profile

Retrieves the profile of the studio associated with the current user.

- **Auth**: Required (any role)
- **Cache-Control**: `no-store`

### Success Response
- **Code**: `200 OK`
- **Body**:
```json
{
  "data": {
    "id": "uuid",
    "name": "Studio Name",
    "slug": "studio-slug",
    "bank_account_number": "XXXX1234",
    "storage": {
      "used_gb": 10,
      "limit_gb": 100,
      "usage_pct": 10.0
    }
  }
}
```

## PATCH /api/v1/studio/profile

Updates studio profile fields.

- **Auth**: Required (Owner only)
- **Cache-Control**: `no-store`

### Request Body
Partial update. At least one field required.

- `name`: string (2-100)
- `tagline`: string (max 200)
- `logo_url`: url
- `brand_color`: hex code (#RRGGBB)
- `gstin`: Indian GSTIN format
- `pan`: Indian PAN format
- `invoice_prefix`: alphanumeric (max 10)
- `bank_account_number`: string (max 20)
- `bank_ifsc`: Indian IFSC format

### Success Response
- **Code**: `200 OK`
- **Body**: Updated `StudioProfile` object.

### Error Responses
- `400 VALIDATION_ERROR`: Invalid field format.
- `403 FORBIDDEN`: Non-owner attempt to update.
- `409 CONFLICT`: Slug already taken.

---

## GET /api/v1/studio/storage

Returns storage usage and limit for the studio.

- **Auth**: Required (any member)
- **Response**: StorageStats
- **Cache-Control**: `no-store`

### Success Response — 200 OK
```json
{
  "data": {
    "used_gb": 12.5,
    "limit_gb": 200,
    "available_gb": 187.5,
    "usage_pct": 6.3,
    "status": "ok",
    "plan_tier": "studio"
  }
}
```
- `status`: one of `ok`, `warning`, `critical` (based on usage_pct thresholds).

### Error Responses
- `401 UNAUTHORIZED`: No auth token.
- `403 FORBIDDEN`: Not a studio member.
- `404 NOT_FOUND`: Studio not found.

---

## GET /api/v1/studio/onboarding

Returns onboarding progress and all 5 steps with completion state.

- **Auth**: Required (any member)
- **Response**: OnboardingStatus with all 5 steps
- **Cache-Control**: `no-store`

### Success Response — 200 OK
```json
{
  "data": {
    "is_completed": false,
    "current_step": 3,
    "progress_pct": 40,
    "steps": [
      {
        "step_number": 1,
        "step_name": "basic_info",
        "label": "Basic Info",
        "is_completed": true,
        "completed_at": "2025-03-15T10:00:00Z",
        "skipped": false
      }
    ]
  }
}
```

### Error Responses
- `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

## POST /api/v1/studio/onboarding/:step

Marks an onboarding step as complete and persists step-specific data.

- **Auth**: Required (any member)
- **Params**: `step` = 1–5
- **Body**: `{ "data": step-specific object, "time_spent_sec"?: number }`
- **Response**: Updated OnboardingStatus
- **Cache-Control**: `no-store`

### Step 1 — basic_info
- **Required**: `name`, `phone`, `city`, `state`
- Writes to: `studios` (name, phone, city, state)

### Steps 2–5
- **Data**: all optional (can skip with empty `data`).
- Step 2: business details (gstin, pan, business_address, pincode, email, website).
- Step 3: payment setup (bank_name, bank_account_number, bank_ifsc, invoice_prefix, default_advance_pct). Bank account number is encrypted.
- Step 4: inquiry form (form_title, button_text, success_message, show_event_type, show_event_date, show_budget, require_phone). Upserts `inquiry_form_configs`.
- Step 5: optional package (name, event_type, base_price, deliverables, turnaround_days). Creates `service_packages` if provided; sets `onboarding_completed` and `onboarding_completed_at` on studios.

### Error Responses
- `400 VALIDATION_ERROR`: Invalid or missing step data (e.g. Step 1 missing required fields).
- `400 INVALID_STEP`: `step` not 1–5.
- `401 UNAUTHORIZED`, `403 FORBIDDEN`
