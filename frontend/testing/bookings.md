# Sprint 6 — Bookings — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- Backend seeded with bookings in at least 3–4 statuses (new_lead, booked, partially_paid, delivered)
- At least 2 clients in the database (for the client combobox)
- Booking amounts in INR (total_amount, amount_paid, amount_pending set correctly)

---

## Tests

### 1 — Bookings list loads

**Steps:**
1. Navigate to `/bookings`

**Expected:** Table (desktop) / card list (mobile) renders. Header shows "N bookings" count. Each row shows booking title, client name, event type, status badge, total amount in INR.

**Fail condition:** Spinner never resolves, error state when backend healthy, no INR formatting.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Booked" tab → URL `?status=booked&page=0`
2. Click "Paid" tab → URL `?status=paid&page=0`
3. Click "All" → `?status` removed

**Expected:** List filters correctly. Active tab has dark pill styling.

**Fail condition:** Filter doesn't update list, URL wrong, "All" leaves stale param.

🔲 Pass / ❌ Fail

---

### 3 — New booking dialog opens

**Steps:**
1. Click "New booking" OR press `n` key
2. Also test from ⌘K → "New booking"

**Expected:** Dialog opens with: Title field, Client combobox, Event type select, Event date + end date (datetime-local), Total amount + Advance amount, collapsed Venue section, Notes textarea.

**Fail condition:** Dialog doesn't open, missing fields, venue section missing.

🔲 Pass / ❌ Fail

---

### 4 — Client combobox search

**Steps:**
1. Open new booking dialog
2. Click the Client combobox
3. Type a partial name (e.g. "Priya")

**Expected:** Dropdown filters to matching clients. Selecting one closes the dropdown and populates the field with "Name · phone".

**Fail condition:** All clients shown regardless of search, selection doesn't populate field.

🔲 Pass / ❌ Fail

---

### 5 — New booking: valid submit

**Steps:**
1. Fill: title "Sharma Wedding 2026", pick a client, event type "Wedding", total ₹75000, advance ₹25000
2. Submit

**Expected:** Toast "Booking created — Booking added to your pipeline. GST calculated automatically from client state." Dialog closes. Booking appears in list with status "New lead".

**Fail condition:** No toast, dialog stays open, booking not in list.

🔲 Pass / ❌ Fail

---

### 6 — New booking: venue section

**Steps:**
1. Open new booking dialog
2. Click "Venue details" disclosure button

**Expected:** Venue section expands showing: Venue name, Address, City + State (side by side), Pincode. Button chevron rotates.

**Fail condition:** Section doesn't expand, chevron doesn't rotate, fields missing.

🔲 Pass / ❌ Fail

---

### 7 — Booking slide-over: Overview tab

**Steps:**
1. Click any booking row

**Expected:**
- URL gains `?id=<uuid>`, slide-over animates in from right (desktop) or sheet rises from bottom (mobile)
- "Overview" tab active by default
- Financial summary card: 3-column grid (Total / Paid / Pending) with INR values + progress bar showing % collected
- Client details with phone + email
- Event type, event date (formatted "12 Dec 2026")
- Venue block if venue_name set
- GST breakdown if gst_type is not 'none'

**Fail condition:** Raw numbers not formatted as INR, progress bar missing, slide-over doesn't animate.

🔲 Pass / ❌ Fail

---

### 8 — Status change grid

**Steps:**
1. Open any booking slide-over
2. Scroll to "Change status" section in Overview tab
3. Click a different status

**Expected:** Toast "Status updated to '…'". The status badge in the slide-over header updates. The previously active status button has accent styling.

**Fail condition:** No toast, header badge doesn't update, clicking active status causes error.

🔲 Pass / ❌ Fail

---

### 9 — Activity tab

**Steps:**
1. Open any booking slide-over, click "Activity" tab

**Expected:** Timeline of events (booking_created, status_changed, etc.) with icons, event label, metadata preview, and formatted timestamp.

**Fail condition:** Empty on a booking that has activity, missing icons.

🔲 Pass / ❌ Fail

---

### 10 — Notes tab ⌘↵

**Steps:**
1. Open any booking slide-over, click "Notes" tab
2. Type text, press ⌘↵

**Expected:** PATCH `/bookings/[id]` fires with `{ notes: "..." }`. "Saved ✓" appears for 2s. Esc reverts to original text.

**Fail condition:** Save doesn't fire, Esc doesn't revert.

🔲 Pass / ❌ Fail

---

### 11 — Shoot brief tab

**Steps:**
1. Open any booking slide-over, click "Shoot brief" tab
2. Enter shot list text, special requests, location notes
3. Click "Save brief"

**Expected:** POST `/bookings/[id]/shoot-brief` fires. "Saved ✓" appears. Re-opening the slide-over shows the saved brief.

**Fail condition:** Save doesn't fire, data lost on reopen.

🔲 Pass / ❌ Fail

---

### 12 — Empty state copy

**Steps:**
1. Filter to a status that has no bookings

**Expected:** Empty state shows real copy about bookings (not "No data available").

**Fail condition:** Generic placeholder copy.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — mobile cards with INR amounts, status badge; sheet slide-over from bottom | 🔲 |
| 768px — desktop table | 🔲 |
| 1024px — Date column visible | 🔲 |
| 1280px — Pending column visible | 🔲 |
| 1920px — no overflow | 🔲 |

---

## Sign-off

- [ ] All 12 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors
- [ ] User says: "Sprint 6 looks good, start Sprint 7"
