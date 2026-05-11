# Sprint 3 — Clients — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- Backend seeded with at least 2–3 clients (or create via "New client" form below)
- Backend seeded with at least 1 booking linked to a client (for Bookings tab test)

---

## Tests

### 1 — Clients list loads

**Steps:**
1. Navigate to `/clients`

**Expected:** Table (desktop) or card list (mobile) renders with client rows. Header shows "N clients" count.

**Fail condition:** Spinner never resolves, or error state shown when backend is healthy.

🔲 Pass / ❌ Fail

---

### 2 — Search filters the list

**Steps:**
1. Type part of a client's name into the search box
2. Wait ~300 ms (debounce)

**Expected:** URL gains `?q=<term>&page=0`, list filters to matching clients only.  
Clearing the input removes `?q` from URL and restores the full list.

**Fail condition:** List doesn't filter, or URL doesn't update.

🔲 Pass / ❌ Fail

---

### 3 — Empty state (no search)

**Steps:**
1. Ensure the database has zero clients
2. Navigate to `/clients`

**Expected:** "No clients yet" empty state with "Add first client" button. Copy must mention leads converting or adding directly — no "No data available" or placeholder text.

**Fail condition:** Blank white screen, raw "No data" text, or no CTA button.

🔲 Pass / ❌ Fail

---

### 4 — Empty state (search returns nothing)

**Steps:**
1. Search for a string that matches no client (e.g. "ZZZNOTEXIST")

**Expected:** Empty state shows "No clients match your search" copy with no "Add first client" button (since search is active).

**Fail condition:** "Add first client" button visible while search is active.

🔲 Pass / ❌ Fail

---

### 5 — New client dialog (valid submit)

**Steps:**
1. Click "New client" button (or press `n` key)
2. Fill in: Full name "Rahul Verma", Phone "9988776655", Email "rahul@example.com", City "Pune"
3. Submit

**Expected:** Toast "Client added — Rahul Verma is now in your client list." Dialog closes. New client appears in the list (cache invalidated).

**Fail condition:** Dialog stays open, no toast, or client not added.

🔲 Pass / ❌ Fail

---

### 6 — New client 409 phone conflict

**Steps:**
1. Open "New client"
2. Enter the phone number of an already-existing client
3. Submit

**Expected:** Inline error "This phone number belongs to an existing client." appears under the Phone field. Dialog stays open.

**Fail condition:** Generic error toast shown, no field-level error, or crash.

🔲 Pass / ❌ Fail

---

### 7 — New client Zod validation

**Steps:**
1. Open "New client"
2. Try submitting with: Full name blank, Phone "12345" (invalid), GSTIN "INVALID"
3. Observe errors

**Expected:** Inline errors: "Name must be at least 2 characters", "Enter a valid 10-digit Indian mobile number", GSTIN error message. No network request fired.

**Fail condition:** Form submits despite invalid data.

🔲 Pass / ❌ Fail

---

### 8 — Client slide-over: Overview tab

**Steps:**
1. Click any client row (desktop) or card (mobile)

**Expected:**
- URL gains `?id=<uuid>`
- Slide-over animates in from right (desktop) / bottom sheet rises (mobile)
- Overview tab active: contact links (tel:, wa.me:, mailto:), stats card (Bookings/Revenue/Paid), address, company, GSTIN (monospace), tags

**Fail condition:** No animation, URL doesn't update, missing fields, layout broken.

🔲 Pass / ❌ Fail

---

### 9 — Client slide-over: Bookings tab

**Steps:**
1. Open a client who has at least one linked booking
2. Click "Bookings" tab

**Expected:** Each booking shows title, event type, event date (formatted), status pill, and INR amounts for total/paid/pending. Pending amount only shown if > 0.

**Fail condition:** Empty bookings tab for a client with bookings, or amounts shown as raw decimal strings.

🔲 Pass / ❌ Fail

---

### 10 — Client slide-over: Notes tab save

**Steps:**
1. Open any client slide-over
2. Click "Notes" tab
3. Type some text
4. Press ⌘↵ (or Ctrl+↵)

**Expected:** PATCH request fires with `{ notes: "..." }`. "Save" button shows "Saved ✓" for 2 seconds.  
Press Esc with unsaved changes → textarea reverts to original content.

**Fail condition:** Keycombo doesn't save, Esc doesn't revert, no visual feedback.

🔲 Pass / ❌ Fail

---

### 11 — Slide-over close / URL cleanup

**Steps:**
1. Open a client (URL has `?id=...`)
2. Press browser Back button OR click the X button

**Expected:** Slide-over closes, `?id` removed from URL. Pressing Back shows Leads (or previous route), not a blank URL state.

**Fail condition:** URL retains `?id` after close, or browser Back navigates away from app.

🔲 Pass / ❌ Fail

---

### 12 — `?new=1` URL trigger (⌘K path)

**Steps:**
1. Press ⌘K (or Ctrl+K)
2. Select "New client"

**Expected:** Navigates to `/clients?new=1`, which causes the New Client dialog to open immediately. `?new=1` is removed from URL (replace, no history entry).

**Fail condition:** Dialog doesn't open, `?new=1` remains in URL, or back button goes to `?new=1` state.

🔲 Pass / ❌ Fail

---

## Responsive checklist

Check each breakpoint before sign-off:

| Breakpoint | Check |
|---|---|
| 375px (iPhone SE) — mobile card list, bottom sheet | 🔲 |
| 390px (iPhone 15) — same | 🔲 |
| 768px (iPad portrait) — transitions to desktop table | 🔲 |
| 1024px (iPad landscape / laptop) — lg columns visible (Email, Added) | 🔲 |
| 1280px (desktop) — xl columns visible (City, Tags) | 🔲 |
| 1920px (FHD) — no overflow, comfortable density | 🔲 |

---

## Sign-off

- [ ] All 12 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors during test run
- [ ] User says: "Sprint 3 looks good, start Sprint 4"
