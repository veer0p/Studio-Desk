# Inquiry module — manual test plan

**Module:** Inquiry (`/inquiry`)
**Sprint:** 02
**API:** `POST /api/v1/inquiry?studio=<slug>`
**Files:** `src/features/inquiry/InquiryPage.tsx`

> Prerequisites: backend running on :3000. No auth required — this is a public page.
> Dev URL: `http://localhost:5173/inquiry` (defaults to `?studio=xyz-photography`)

---

## Test 01 — Page loads with aurora hero

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open `http://localhost:5173/inquiry`

**Expected**
- Aurora gradient animates slowly in the background
- Studio name "Xyz Photography" shown with camera icon
- Headline "Tell us about your shoot." visible
- Form card visible on the right (desktop) or below (mobile)
- No sidebar, no topbar — full-screen public page

**Fail condition**
- AppShell sidebar visible
- Aurora missing or static (unless prefers-reduced-motion is on)
- Placeholder text "The full form ships in Sprint 2"

---

## Test 02 — Validation (required fields)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Click "Send enquiry" without filling any fields

**Expected**
- Inline error below "Your name": "Name must be at least 2 characters"
- Inline error below "Mobile number": "Enter a valid 10-digit Indian mobile number"
- No API call fired (form blocked by Zod)

**Fail condition**
- Form submits to API with empty fields
- Error shown as an alert/toast instead of inline

---

## Test 03 — Phone format validation

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Enter name "Priya Sharma"
2. Enter phone "5876543210" (starts with 5, invalid Indian mobile)
3. Click "Send enquiry"

**Expected**
- Phone error: "Enter a valid 10-digit Indian mobile number"
- Submission blocked

**Fail condition**
- Invalid phone accepted and sent to API

---

## Test 04 — Successful submission

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Fill in: name = "Kavya Nair", phone = "9000000099"
2. Select event type = "Wedding"
3. Click "Send enquiry"

**Expected**
- Button shows "Sending…" during request
- Form is replaced by success card: "We've got it!" + studio name + reply-time message
- POST `/api/v1/inquiry?studio=xyz-photography` fired with correct payload
- New lead appears in `/leads` list with source = "inquiry_form"

**Fail condition**
- Form remains visible after success
- No lead created in backend
- Button stays disabled after success (instead of showing success state)

---

## Test 05 — Rate limit (429)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Submit 5 valid forms in a row (each with a unique phone number)
2. Submit a 6th

**Expected**
- 6th submission shows inline error: "You've submitted 5 times from this device in the past hour. Please try again later."
- Error shown below the message field, above the submit button
- No success state shown

**Fail condition**
- App crashes on 429
- Error shown as browser alert

---

## Test 06 — No studio slug → not-found page

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open `http://localhost:5173/inquiry` in a **production-like** context (or manually force `studioSlug = null`)
2. Or test by removing the dev default (temporarily set `DEV` to false logic)

**Expected**
- "Studio not found" page rendered with aurora background
- No form visible

**Fail condition**
- Crash / white screen
- Form shown with broken studio slug

---

## Test 07 — Responsive: mobile (375×667)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. DevTools → 375×667
2. Navigate to `/inquiry`

**Expected**
- Single column layout: hero text stacked above form
- Form card fills full width
- All inputs ≥ 44px tall (min-h-12 = 48px) ✓
- No horizontal scroll
- Budget fields side by side (grid-cols-2) still readable at 375px
- Aurora visible behind content

**Fail condition**
- Horizontal scroll
- Inputs too small to tap
- Budget fields overflow

---

## Test 08 — prefers-reduced-motion

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. DevTools → Rendering → Emulate prefers-reduced-motion: reduce
2. Open `/inquiry`

**Expected**
- Aurora gradient is static (no slow drift animation)
- Form card entrance animation frozen or instant
- All other functionality unchanged

**Fail condition**
- Animation still plays despite reduced-motion setting

---

## Responsive checklist

| Viewport     | Status |
|--------------|--------|
| 375×667      | 🔲     |
| 768×1024     | 🔲     |
| 1280×800     | 🔲     |
| 1920×1080    | 🔲     |

- [ ] 375: single column, no scroll, touch targets ≥ 44px
- [ ] 768: single column (lg: flex-row not yet triggered), form fills width
- [ ] 1280: split layout — hero copy left, form right
- [ ] 1920: content centered with max-w-5xl, aurora fills full screen
