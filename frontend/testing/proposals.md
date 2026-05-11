# Sprint 4 — Proposals — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- Backend seeded with proposals in at least 3 different statuses (draft, sent, accepted or rejected)
- At least one proposal must have line items and GST data

---

## Tests

### 1 — Proposals list loads

**Steps:**
1. Navigate to `/proposals`

**Expected:** Table (desktop) / card list (mobile) renders. Header shows "N proposals" count.

**Fail condition:** Spinner never resolves, blank screen, or error state when backend is healthy.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Draft" tab → URL gets `?status=draft&page=0`
2. Click "Sent" tab → URL updates to `?status=sent&page=0`
3. Click "All" tab → `?status` removed from URL

**Expected:** List filters to matching status. Tab with active status is visually distinct (dark fill vs ghost).

**Fail condition:** Tab click doesn't filter, URL doesn't update, or "All" leaves a stale `?status` param.

🔲 Pass / ❌ Fail

---

### 3 — Empty state (no proposals)

**Steps:**
1. Ensure database has zero proposals
2. Navigate to `/proposals`

**Expected:** "No proposals yet" with a "Create first proposal" button. Copy mentions bookings and quotes.

**Fail condition:** Blank screen, generic "No data", or button missing.

🔲 Pass / ❌ Fail

---

### 4 — Empty state (filtered tab)

**Steps:**
1. Click a status tab where no proposals exist (e.g. "Rejected")

**Expected:** "No rejected proposals — try a different filter." No "Create first proposal" button visible.

**Fail condition:** "Create first proposal" visible while filter is active.

🔲 Pass / ❌ Fail

---

### 5 — New proposal dialog opens

**Steps:**
1. Click "New proposal" button OR press `n` key

**Expected:** Dialog animates in. Contains booking ID field, client ID field, GST type select, valid until, line items section, live total, notes.

**Fail condition:** Dialog doesn't open, wrong fields shown, no animation.

🔲 Pass / ❌ Fail

---

### 6 — New proposal: line item add/remove

**Steps:**
1. Open new proposal dialog
2. Click "Add item" — a second line item row appears
3. Click the trash icon on the first row — it disappears

**Expected:** Add appends a new empty row. Remove deletes the row. Cannot remove when only one row remains (trash icon disabled).

**Fail condition:** Add doesn't work, remove crashes, last item can be removed.

🔲 Pass / ❌ Fail

---

### 7 — New proposal: live GST calculation

**Steps:**
1. Open new proposal dialog
2. Set qty=2, unit price=50000, GST=CGST+SGST
3. Observe totals footer

**Expected:** Subtotal = ₹1,00,000 · GST = ₹18,000 · Total = ₹1,18,000 (updates in real time as you type).

**Fail condition:** Numbers don't update on input, wrong calculation, or ₹ formatting missing.

🔲 Pass / ❌ Fail

---

### 8 — Proposal slide-over: Quote tab

**Steps:**
1. Click a proposal row that has line items

**Expected:**
- URL gains `?id=<uuid>`
- Spring animation from right (desktop) / bottom sheet (mobile)
- Quote tab active: line items table (name, qty, unit price, total), GST breakdown rows, grand total
- HSN/SAC code shown in monospace when present

**Fail condition:** No animation, URL doesn't update, amounts shown as raw strings like "50000.00".

🔲 Pass / ❌ Fail

---

### 9 — Proposal slide-over: Info tab

**Steps:**
1. Open a proposal slide-over
2. Click "Info" tab

**Expected:** Client name, booking title, event type/date, status badge, valid until, created date. If sent/viewed/accepted: those dates shown with icons.

**Fail condition:** Info tab missing or empty for a proposal that has all these fields.

🔲 Pass / ❌ Fail

---

### 10 — Send action (draft proposal)

**Steps:**
1. Open a draft proposal slide-over
2. Click "Send" button in header

**Expected:** Toast "Proposal sent — The client will receive an email…". Status badge updates to "Sent". Send button changes to "Resend".

**Fail condition:** Toast doesn't appear, status doesn't update, button disappears after send.

🔲 Pass / ❌ Fail

---

### 11 — Slide-over notes tab ⌘↵

**Steps:**
1. Open any proposal slide-over
2. Click "Notes" tab
3. Type some text then press ⌘↵ (Ctrl+↵ on Windows)

**Expected:** PATCH fires with `{ notes: "..." }`. "Saved ✓" feedback for 2 seconds.  
Esc reverts textarea to original content.

**Fail condition:** Keycombo doesn't save, Esc doesn't revert.

🔲 Pass / ❌ Fail

---

### 12 — `?new=1` URL trigger via ⌘K

**Steps:**
1. Press ⌘K
2. Search "proposal"
3. Select "New proposal"

**Expected:** Navigates to `/proposals?new=1` → dialog opens immediately → `?new=1` removed from URL with replace (no history entry).

**Fail condition:** Dialog doesn't open, `?new=1` stays in URL, back button goes to `?new=1`.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — mobile card list, status tabs scroll horizontally, bottom sheet | 🔲 |
| 390px — same | 🔲 |
| 768px — transitions to desktop table | 🔲 |
| 1024px — lg columns visible (Booking column) | 🔲 |
| 1280px — xl columns visible (Valid until) | 🔲 |
| 1920px — no overflow | 🔲 |

---

## Known limitations (Sprint 4)

- New proposal dialog uses raw UUID text fields for booking ID and client ID. These will become comboboxes in Sprint 6 (Bookings). Tracked in api-issues.md #2.

---

## Sign-off

- [ ] All 12 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors during test run
- [ ] User says: "Sprint 4 looks good, start Sprint 5"
