# Leads module — manual test plan

**Module:** Leads (`/leads`)
**Sprint:** 01
**API:** `GET/POST /api/v1/leads`, `GET/PATCH /api/v1/leads/[id]`, `POST /api/v1/leads/[id]/convert`
**Files:** `src/features/leads/`

> Prerequisites: backend running on :3000, Vite dev server on :5173, proxy `/api/v1` → `:3000`.
> The dev shim auto-logs in as `owner@test.com / Test@1234` on first mount.

---

## Test 01 — List loads with real data

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open `http://localhost:5173/leads`
2. Wait 1–2 seconds for the network call

**Expected**
- Skeleton (3 rows / 3 cards) shows while loading, then disappears
- Desktop (1280px): table with columns Lead · Event · Date · Status · Budget is visible
- Rows contain real Indian names, INR values, status badges
- Page header shows `N leads · page 1 of M`

**Fail condition**
- ErrorState shown (backend not running)
- Placeholder preview rows still visible (Sprint 0 data)
- Any "John Doe" or "Lorem ipsum"

---

## Test 02 — Search (debounced)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Type a partial name in the search box
2. Wait 300 ms (do NOT hit Enter)
3. Observe network tab in DevTools

**Expected**
- Exactly one GET `/api/v1/leads?search=…` fires after 300 ms
- List filters to matching rows
- URL updates to `?q=<term>` (replace history — back button is not cluttered)
- Clearing the field restores full list

**Fail condition**
- Request fires on every keystroke (no debounce)
- URL does not update
- Back button creates 10+ history entries for one search session

---

## Test 03 — Status filter

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open "All statuses" dropdown
2. Select "Contacted"
3. Observe list and URL

**Expected**
- List shows only `contacted` leads
- URL contains `?status=contacted&page=0`
- Selecting "All statuses" (empty) restores full list

**Fail condition**
- URL missing `status` param
- Page doesn't reset to 0 when filter changes

---

## Test 04 — Source filter

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Select a source (e.g. "Instagram")
2. Combine with a status filter

**Expected**
- Both `status` and `source` params appear in URL
- List narrows to combined filter

**Fail condition**
- One filter clears the other

---

## Test 05 — Empty state

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Filter to a combination that returns 0 results
2. Observe the empty state

**Expected**
- EmptyState component shown with message "No leads match your filters — try clearing them."
- "+ Add first lead" button NOT shown (only shown when no filters active)

**Fail condition**
- "No data available." (generic copy)
- "+ Add first lead" button visible on filtered empty state

---

## Test 06 — Pagination

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Have at least 21 leads in the database
2. Observe pagination footer
3. Click "Next"

**Expected**
- Footer shows `1–20 of N` range
- URL updates to `?page=1`
- "Previous" disabled on page 1; "Next" disabled on last page

**Fail condition**
- Pagination footer missing when only 1 page
- Page 0-indexed in URL without mapping to 1-indexed for display

---

## Test 07 — Row click opens slide-over (desktop)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. At ≥ 1280px width, click any lead row in the table
2. Observe right panel

**Expected**
- SlideOver slides in from the right with spring animation (350ms)
- URL adds `?id=<lead-id>`
- Header shows client full name + "Lead · Nd ago"
- Three tabs visible: Overview / Activity / Notes

**Fail condition**
- No animation
- URL not updated
- Double header (SlideOver generic header + custom header)

---

## Test 08 — Bottom sheet (mobile)

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. DevTools → 375×667 viewport
2. Tap any lead card
3. Swipe down to dismiss

**Expected**
- vaul bottom sheet rises from bottom (not right-slide)
- Max height 92dvh, rounded top corners, drag handle visible
- Swipe down closes sheet, URL removes `?id=`
- Touch target of each card ≥ 44px

**Fail condition**
- Right-slide panel used on mobile
- No drag handle
- Horizontal scroll at 375px

---

## Test 09 — Slide-over: Overview tab

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open a lead with phone, WhatsApp, email, event type, date, venue, and budget set
2. Check Overview tab

**Expected**
- `tel:` link on phone number (tappable on mobile)
- `wa.me/91<phone>` link on WhatsApp (opens WhatsApp)
- `mailto:` link on email
- Budget shown as "₹X – ₹Y" in Indian format
- Status badge correct color
- "Move to…" dropdown only shows forward statuses (not ones already passed)

**Fail condition**
- Raw phone number with no link
- "Move to…" dropdown shows statuses that would be backward transitions

---

## Test 10 — Slide-over: Notes tab — inline save

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Open any lead
2. Navigate to Notes tab
3. Type some text
4. Press ⌘↵ (Mac) or Ctrl+↵ (Windows)

**Expected**
- "Save" button appears when text differs from saved value
- After ⌘↵, button shows "Saved ✓" briefly then disappears
- PATCH `/api/v1/leads/:id` fires with `{ notes: "..." }`

**Fail condition**
- ⌘↵ triggers form submit instead of saving notes
- Pressing Esc doesn't revert to last saved value

---

## Test 11 — New Lead dialog

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Click "+ New lead" button (or press `n` key, or ⌘K → "New lead")
2. Fill in: Full name = "Kavya Reddy", Phone = "9000000001"
3. Leave event type and budget blank
4. Click "Add lead"

**Expected**
- Dialog opens with animation
- Zod validation: phone field shows error if invalid Indian mobile format
- On success: toast "Lead added — Kavya Reddy is now in your pipeline."
- Dialog closes, list refreshes with new row
- POST `/api/v1/leads` fired with correct payload

**Fail condition**
- Dialog shows validation error for blank optional fields
- No success toast
- List doesn't refresh after add

---

## Test 12 — ⌘K "New lead" command

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Press ⌘K (or Ctrl+K)
2. Type "new"
3. Select "New lead" from Quick actions

**Expected**
- Palette closes
- New Lead dialog opens on /leads
- URL briefly has `?new=1` then clears (replace history, not push)

**Fail condition**
- Command is still disabled ("Soon" badge)
- URL retains `?new=1` after dialog opens

---

## Test 13 — Error state

| Field  | Value |
|--------|-------|
| Status | 🔲    |

**Steps**
1. Stop the backend (Ctrl+C in backend terminal)
2. Hard-reload `/leads`

**Expected**
- ErrorState shown: "Couldn't load leads. Check your connection…"
- "Try again" button visible
- Clicking retry re-fires the query (backend still down = error again)

**Fail condition**
- White screen / crash
- Error message is generic "Error: Network Error"

---

## Responsive checklist (run at end)

| Viewport     | Status |
|--------------|--------|
| 375×667      | 🔲     |
| 768×1024     | 🔲     |
| 1280×800     | 🔲     |
| 1920×1080    | 🔲     |

- [ ] 375: cards visible, no horizontal scroll, touch targets ≥ 44px, search bar full-width
- [ ] 768: table visible (md:), Event/Date columns hidden (lg:), slide-over (not bottom sheet)
- [ ] 1280: all visible columns, comfortable spacing
- [ ] 1920: content fills available width (no max-w-7xl ghost gutters)
