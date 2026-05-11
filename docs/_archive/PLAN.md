# Studio Frontend API Binding Plan

## Summary
Complete the studio-facing logged-in frontend by replacing all remaining mock, placeholder, and partially wired flows with real backend integrations. Every binding must be done through a typed API boundary, and for each endpoint we must verify both:
- request payload shape against backend validation/schema/route expectations
- response payload shape before mapping into frontend domain types

This plan covers only studio modules for now. Admin flows, public/token flows, webhooks, and cron routes are out of scope.

## Binding Rules
- Use typed endpoint-specific fetchers and mutations only; do not introduce `any`, `unknown` passthroughs, or component-level ad hoc parsing.
- Before binding any screen, verify:
  - backend route path
  - HTTP method
  - required request fields
  - optional request fields
  - response envelope and nested data shape
  - error response shape and user-facing fallback behavior
- Normalize backend/frontend naming mismatches only inside the API layer.
- Remove production mock data instead of silently falling back to fake values.
- If backend support is missing, mark the feature blocked and disable or hide the UI path rather than patching around it.

## Module Plan

### 1. Dashboard
Current state:
- Overview and today widgets are partly bound.
- Some dashboard sections still depend on placeholder assumptions or old endpoint expectations.

Features to complete:
- real overview cards
- real today strip
- real recent bookings/activity panel
- real payment/outstanding summaries
- real quick insights derived from supported backend data

APIs to use:
- `/api/v1/dashboard/overview`
- `/api/v1/dashboard/today`
- `/api/v1/bookings`
- `/api/v1/finance/outstanding`

Implementation notes:
- Remove legacy dependency on nonexistent dashboard endpoints such as old summary/pipeline/upcoming/action routes.
- Build dashboard sections by composing supported data sources instead of inventing extra endpoints.
- Verify request query params and response card aggregates before wiring each widget.

### 2. Bookings
Current state:
- List/detail are partially bound.
- Some create/edit/detail actions still reflect legacy frontend assumptions.

Features to complete:
- bookings list with filters/search
- booking detail with notes and timeline
- booking create flow
- booking edit/update flow
- booking status update
- booking assignments if exposed in UI
- shoot brief if exposed in UI
- activity feed if supported in current detail screen

APIs to use:
- `/api/v1/bookings`
- `/api/v1/bookings/[id]`
- `/api/v1/bookings/[id]/status`
- `/api/v1/bookings/[id]/activity`
- `/api/v1/bookings/[id]/assignments`
- `/api/v1/bookings/[id]/shoot-brief`

Implementation notes:
- Rebuild new booking flow around the real backend contract instead of the old UI-only form shape.
- Verify required fields like client linkage, title, event metadata, dates, and package references before form submission wiring.
- Remove any legacy call patterns such as `/bookings/[id]/stage` or `/bookings/[id]/notes`.

### 3. Clients
Current state:
- Core list/detail are partly bound.
- Some tabs still expect data the backend does not expose directly.

Features to complete:
- client list
- client detail
- client create
- client update
- booking linkage on client detail
- invoice/payment linkage on client detail
- notes if represented through supported update fields
- communication/timeline only if backed by real data

APIs to use:
- `/api/v1/clients`
- `/api/v1/clients/[id]`
- supporting linked data from bookings/invoices if needed

Implementation notes:
- Verify create/update request payloads against backend schema before wiring forms.
- If dedicated communication history is not supported, remove or disable the communication panel instead of keeping mock history.
- Do not keep local fake notes or timelines.

### 4. Finance
Current state:
- Summary is partly bound.
- Invoices, payments, and finance subpanels still contain mock/stub content.

Features to complete:
- finance summary dashboard
- outstanding list/state
- invoice list
- invoice detail
- invoice create
- invoice update
- invoice delete if supported by current UI
- invoice send
- payment link generation
- record payment
- credit note
- payments list
- payment create/update/delete as exposed in UI

APIs to use:
- `/api/v1/finance/summary`
- `/api/v1/finance/outstanding`
- `/api/v1/finance/mark-overdue`
- `/api/v1/invoices`
- `/api/v1/invoices/[id]`
- `/api/v1/invoices/[id]/send`
- `/api/v1/invoices/[id]/payment-link`
- `/api/v1/invoices/[id]/record-payment`
- `/api/v1/invoices/[id]/credit-note`
- `/api/v1/payments`
- `/api/v1/payments/[id]`

Implementation notes:
- Verify all invoice and payment request bodies carefully because these flows often differ in backend-required fields and numeric formats.
- Validate response mapping for totals, balances, payment states, due dates, and related client/booking references.
- Remove all local invoice and payment rows once bound.

Blocked finance features:
- expenses module remains blocked because backend expense routes are not present.
- old invoice remind flow remains blocked if it depends on `/invoices/[id]/remind`.

### 5. Gallery
Current state:
- Studio gallery list, detail, uploads, and face clusters are still mock-driven.

Features to complete:
- gallery list
- gallery detail
- upload flow
- upload progress/status polling
- publish action
- share action
- face clusters list
- cluster-level actions/detail
- gallery settings only if backend-backed through current routes

APIs to use:
- `/api/v1/galleries`
- `/api/v1/galleries/[id]`
- `/api/v1/galleries/[id]/upload`
- `/api/v1/galleries/[id]/upload-status`
- `/api/v1/galleries/[id]/publish`
- `/api/v1/galleries/[id]/share`
- `/api/v1/galleries/[id]/clusters`
- `/api/v1/galleries/[id]/clusters/[cid]`

Implementation notes:
- Remove singular `gallery` endpoint assumptions everywhere.
- Verify upload request format, file metadata handling, and polling response states before connecting upload UI.
- Verify cluster response shape before binding face-recognition screens.

### 6. Team
Current state:
- Members, schedule, conflicts, payouts, and member detail screens are mostly mock-driven.

Features to complete:
- team member list
- team member detail
- invite member
- role update
- assignments view
- schedule view

APIs to use:
- `/api/v1/team`
- `/api/v1/team/invite`
- `/api/v1/team/[memberId]`
- `/api/v1/team/[memberId]/role`
- `/api/v1/team/[memberId]/assignments`
- `/api/v1/team/schedule`

Implementation notes:
- Verify invite payloads and accepted backend role values before wiring invite/create/edit flows.
- Verify member detail response shape and assignments relation before replacing mock cards.
- Acceptance token flow is out of scope because it is public/token-based.

Blocked team features:
- payouts blocked because no backend payouts route exists.
- conflicts blocked because no backend team conflicts route exists.
- bank details blocked because no backend team bank route exists.

### 7. Analytics
Current state:
- Analytics shell is placeholder-based.
- Existing chart tabs use hardcoded arrays and fake KPI data.

Features to complete:
- analytics shell with real tab routing/rendering
- revenue analytics
- booking analytics
- client analytics
- remove or defer unsupported tabs

APIs to use:
- `/api/v1/analytics/revenue`
- `/api/v1/analytics/bookings`
- `/api/v1/analytics/clients`

Implementation notes:
- Verify chart response structures carefully before building adapters.
- Convert backend aggregates into chart-friendly frontend types inside the API layer only.
- Do not keep gallery/team analytics tabs if backend support does not exist.

### 8. Settings
Current state:
- Settings forms still rely on hardcoded defaults and console-only submit handlers in several sections.

Features to complete:
- studio profile settings
- owner profile settings
- storage settings
- package settings
- package template usage
- notifications settings
- billing settings
- integrations settings
- integrations test action

APIs to use:
- `/api/v1/studio/profile`
- `/api/v1/studio/storage`
- `/api/v1/auth/me`
- `/api/v1/packages`
- `/api/v1/packages/[id]`
- `/api/v1/packages/templates`
- `/api/v1/settings/notifications`
- `/api/v1/settings/billing`
- `/api/v1/settings/integrations`
- `/api/v1/settings/integrations/test`

Implementation notes:
- Verify initial-load response shape for each settings section before replacing form defaults.
- Verify mutation payload shapes field-by-field because settings screens commonly drift from backend contracts.
- Remove local package fixtures and static form defaults once binding is complete.

### 9. Leads
Current state:
- Backend exists, frontend studio module is not yet surfaced as a real module.

Features to add:
- leads list
- lead detail
- lead conversion flow
- lead status progression if included in backend detail/update contract

APIs to use:
- `/api/v1/leads`
- `/api/v1/leads/[id]`
- `/api/v1/leads/[id]/convert`

Implementation notes:
- Add studio route/pages and navigation entry if missing.
- Verify convert request and response shape before chaining into client/booking flows.

### 10. Proposals
Current state:
- Backend exists, frontend studio module is not yet fully present.

Features to add:
- proposal list
- proposal detail
- proposal create
- proposal update if supported in UI
- proposal send
- proposal status tracking in studio UI

APIs to use:
- `/api/v1/proposals`
- `/api/v1/proposals/[id]`
- `/api/v1/proposals/[id]/send`

Implementation notes:
- Keep public proposal view out of scope.
- Verify proposal line items, pricing fields, and related booking/client references before form binding.

### 11. Contracts
Current state:
- Backend exists, frontend studio module is not yet fully present.

Features to add:
- contract list
- contract detail
- contract create
- contract update if supported
- contract send
- reminder action in studio UI

APIs to use:
- `/api/v1/contracts`
- `/api/v1/contracts/[id]`
- `/api/v1/contracts/[id]/send`
- `/api/v1/contracts/[id]/reminder`

Implementation notes:
- Exclude public sign/view token flows.
- Verify request/response structures for signer info, booking/client relation, and document state.

### 12. Addons
Current state:
- Backend exists, frontend management is not yet complete.

Features to add:
- addon list
- addon detail/basic edit
- addon create
- addon update/delete as supported
- booking/package integration after CRUD is stable

APIs to use:
- `/api/v1/addons`
- `/api/v1/addons/[id]`

Implementation notes:
- Verify addon pricing and package relation fields before integrating into booking/package forms.

## Blockers
These features should not be implemented with fake production behavior until backend APIs exist:
- expenses
- payouts
- team conflicts
- team bank details
- dedicated client communication endpoint
- legacy invoice remind action if tied to nonexistent route

Default blocker handling:
- hide action if unused
- disable panel if already present in UI shell
- show explicit backend dependency messaging where removal is too disruptive

## Verification Requirements During Binding
For every endpoint bound, verify:
- exact route path
- exact method
- request body keys
- request field types
- optional vs required fields
- query param names and accepted values
- response envelope keys
- nested object/array shapes
- enum/status values
- date/time formats
- numeric/currency formats
- empty-state responses
- error response handling

Frontend implementation must only proceed after request and response verification is done for that endpoint.

## Test Plan
- frontend build passes after each module wave
- targeted lint passes for touched modules
- all bound screens load without mock data
- list/detail/create/update/action flows are tested for every supported module
- error/loading/empty states are tested for each module
- no legacy dead API calls remain
- no new `any`-based API binding escapes are introduced
- authenticated route smoke pass covers:
  - dashboard
  - bookings
  - clients
  - finance
  - gallery
  - team
  - analytics
  - settings
  - leads
  - proposals
  - contracts
  - addons

## Assumptions
- Scope is studio-facing logged-in frontend only.
- Existing completed typed binding work remains the base pattern for all further work.
- Missing backend support should block frontend production behavior rather than justify temporary patches.
- First execution step after leaving Plan Mode should be saving this plan into `plan.md` and then implementing modules in the order above.
