# Service Packages & Add-ons API

## GET /api/v1/packages

List active service packages for the studio. Response includes computed `gst_amount` and `total_with_gst`.

- **Auth**: Required (any member)
- **Response**: ServicePackage[]
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403

---

## POST /api/v1/packages

Create a new service package. Owner only.

- **Auth**: Required (owner only)
- **Body**: createPackageSchema (name, event_type, base_price, description?, deliverables?, turnaround_days?, line_items?, etc.)
- **Response**: Created ServicePackage (201)
- **Side effects**: None (audit_logs on update only)
- **Error codes**: 401, 403, 400 VALIDATION_ERROR

---

## GET /api/v1/packages/templates

Return pre-built package templates. No DB query — returns constant list of 6 templates.

- **Auth**: Required (any member)
- **Response**: PackageTemplate[] (each has `is_template: true`)
- **Cache-Control**: `public, max-age=3600`
- **Error codes**: 401, 403

---

## GET /api/v1/packages/:id

Fetch a single package by id.

- **Auth**: Required (any member)
- **Response**: ServicePackage
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403, 404 NOT_FOUND, 400 VALIDATION_ERROR

---

## PATCH /api/v1/packages/:id

Update a package. Owner only. Partial body allowed.

- **Auth**: Required (owner only)
- **Body**: Any subset of package fields (updatePackageSchema)
- **Response**: Updated ServicePackage
- **Side effects**: audit_logs row (fire-and-forget)
- **Error codes**: 401, 403, 404 NOT_FOUND, 400 VALIDATION_ERROR

---

## DELETE /api/v1/packages/:id

Soft-delete a package. Owner only. Blocked if package is linked to active bookings.

- **Auth**: Required (owner only)
- **Response**: 204 No Content
- **Error codes**: 401, 403, 404 NOT_FOUND, 409 CONFLICT (when linked to active bookings)

---

## GET /api/v1/addons

List active add-ons for the studio.

- **Auth**: Required (any member)
- **Response**: Addon[]
- **Cache-Control**: `no-store`
- **Error codes**: 401, 403

---

## POST /api/v1/addons

Create a new add-on. Owner only.

- **Auth**: Required (owner only)
- **Body**: createAddonSchema (name, price, description?, unit?)
- **Response**: Created Addon (201)
- **Error codes**: 401, 403, 400 VALIDATION_ERROR

---

## PATCH /api/v1/addons/:id

Update an add-on. Owner only.

- **Auth**: Required (owner only)
- **Body**: updateAddonSchema (partial)
- **Response**: Updated Addon
- **Error codes**: 401, 403, 404 NOT_FOUND, 400 VALIDATION_ERROR

---

## DELETE /api/v1/addons/:id

Soft-delete an add-on. Owner only.

- **Auth**: Required (owner only)
- **Response**: 204 No Content
- **Error codes**: 401, 403, 404 NOT_FOUND, 400 VALIDATION_ERROR
