# Sprint 10 — Dashboard — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- At least a few bookings, leads, invoices, and payments in the system so KPIs have real values
- Ideally a booking with today's date as the event date to test "Today's shoots"

---

## Tests

### 1 — Default landing is Dashboard

**Steps:**
1. Navigate to `http://localhost:5173/`

**Expected:** Redirects to `/dashboard`. Not `/leads`.

**Fail condition:** Lands on Leads page.

🔲 Pass / ❌ Fail

---

### 2 — Aurora hero greeting

**Steps:**
1. Open `/dashboard`

**Expected:**
- Full-width Aurora gradient background behind the greeting (subtle, not overpowering)
- Correct time-aware greeting: "Good morning" / "Good afternoon" / "Good evening" based on current IST time
- Studio owner's name displayed
- Today's date in "Monday, 11 May 2026" format
- Shoot count shown if today has shoots ("2 shoots today") or "No shoots today"

**Fail condition:** Gradient is garish/missing, wrong time greeting, date missing.

🔲 Pass / ❌ Fail

---

### 3 — KPI strip loads and animates

**Steps:**
1. Hard refresh `/dashboard`
2. Watch the 4 KPI tiles load

**Expected:**
- 4 tiles: Collected, Pending, Bookings, New leads
- Revenue values use NumberTicker animation (counts up over ~1.2 s)
- Integer values (Bookings, Leads) also animate
- INR values formatted as ₹X,XX,XXX (Indian comma grouping)
- "Est" badge visible if data is from today's snapshot (is_estimated: true)
- Labels: "this month" under Collected, "outstanding" under Pending, "active" under Bookings, "this month" under New leads

**Fail condition:** Values are raw numbers without animation, formatting broken.

🔲 Pass / ❌ Fail

---

### 4 — Attention items

**Steps:**
1. Ensure there's at least one overdue invoice, unsigned contract, or pending proposal

**Expected:**
- "Needs attention" section appears
- Red items: overdue invoices (red border/bg)
- Amber items: unsigned contracts, pending proposals (amber border/bg)
- Blue items: galleries ready to publish, lead follow-ups (accent border/bg)
- Each item has title + subtitle + arrow icon
- Clicking an item navigates to the relevant route

**Fail condition:** Section missing when it should show, wrong colors, clicking doesn't navigate.

🔲 Pass / ❌ Fail

---

### 5 — This week strip

**Steps:**
1. Verify the 7-day week strip appears

**Expected:**
- 7 day chips in a row (Mon–Sun or whatever 7 days from today)
- Today is highlighted with accent color ring
- Days with shoots show a count badge (indigo filled pill)
- Days with no shoots show no badge
- Clicking a day with shoots navigates to `/bookings`

**Fail condition:** Less than 7 days shown, today not highlighted, badges missing.

🔲 Pass / ❌ Fail

---

### 6 — Today's shoots section

**Steps:**
1. Have a booking with today's event date

**Expected:**
- Shoot card shows: booking title, event type, client name
- Phone number shown as formatted +91 XXXXX XXXXX with tap-to-call link
- Time range shown (if shoot_start_time / shoot_end_time available)
- Call time shown separately if set
- Venue name + address shown; venue_map_link opens in new tab
- Assigned team members listed

**Fail condition:** Card missing, phone not formatted, map link missing.

🔲 Pass / ❌ Fail

---

### 7 — No shoots today empty state

**Steps:**
1. Navigate to dashboard on a day with no bookings

**Expected:** "No shoots today — take a breath, review leads, or catch up on invoices." message shown.

**Fail condition:** Empty white space, no message.

🔲 Pass / ❌ Fail

---

### 8 — ⌘K → Dashboard navigation

**Steps:**
1. Press ⌘K
2. Type "dashboard"
3. Select "Dashboard"

**Expected:** Navigates to `/dashboard`.

**Fail condition:** Not in command palette.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — 2×2 KPI grid, hero greeting full-width | 🔲 |
| 768px — 4×1 KPI strip | 🔲 |
| 1024px — week strip 7 cols, shoot cards 2-col details | 🔲 |
| 1920px — content max-width capped, not stretched | 🔲 |

---

## Design discipline check

- [ ] Aurora gradient appears ONLY in the hero zone (not behind KPI cards or tables)
- [ ] KPI cards use `GlassCard` component — no raw gradients on cards
- [ ] Spacing uses the 4px scale (4/8/12/16/24/32/48/64 only)
- [ ] No "shimmer" or animated borders on cards
- [ ] Greeting text is static — no animated gradient text

---

## Sign-off

- [ ] All 8 tests passed
- [ ] Responsive checklist complete
- [ ] Design discipline check passed
- [ ] No console errors
- [ ] User says: "Sprint 10 looks good, start Sprint 11"
