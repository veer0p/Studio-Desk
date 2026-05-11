# Sprint 8 — Payments — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- At least one invoice with a recorded payment (use Invoice → "Record payment")
- Ideally payments in multiple statuses (captured, failed, refunded) and methods (UPI, Cash, NEFT)
- At least one Razorpay payment if testing the Razorpay section

---

## Tests

### 1 — Payments list loads

**Steps:**
1. Navigate to `/payments`

**Expected:** Table (desktop) / card list (mobile) renders. Header shows "N payments". Each row shows: booking title + invoice number, method badge (coloured), status badge, amount in INR, date, reference/UTR.

**Fail condition:** Spinner never resolves, raw decimal amounts shown.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Captured" → URL `?status=captured&page=0`
2. Click "Failed" → URL `?status=failed&page=0`
3. Click "All" → `?status` removed

**Expected:** List filters correctly.

**Fail condition:** Filter doesn't update, URL wrong.

🔲 Pass / ❌ Fail

---

### 3 — Payment slide-over: captured payment

**Steps:**
1. Click any captured payment row

**Expected:**
- URL gains `?id=<uuid>`, slide-over animates in
- Header: large INR amount, status badge, method badge
- Details: booking title, invoice number (monospace accent), amount, method badge, date, bank name, reference/UTR
- Timeline: Initiated + Captured timestamps

**Fail condition:** Missing fields for a payment that has them, no animation.

🔲 Pass / ❌ Fail

---

### 4 — Failed payment

**Steps:**
1. Open a payment with status "failed"

**Expected:** Red banner at top with failure reason. Timeline shows "Failed" timestamp. No Captured row in timeline.

**Fail condition:** No failure banner, failure_reason not shown.

🔲 Pass / ❌ Fail

---

### 5 — Razorpay payment details

**Steps:**
1. Open a payment created via Razorpay (has razorpay_payment_id)

**Expected:** "Razorpay" pill in header. Razorpay section shows Payment ID + Order ID in monospace.

**Fail condition:** Section missing, IDs not shown.

🔲 Pass / ❌ Fail

---

### 6 — Method badges

**Steps:**
1. On the list, verify you can see different method badges (UPI, Cash, NEFT, etc.)

**Expected:** Each method has a distinct background color. UPI = violet, Cash = green, NEFT = blue, Cheque = amber.

**Fail condition:** All badges same color, wrong labels.

🔲 Pass / ❌ Fail

---

### 7 — Empty state

**Steps:**
1. Filter to a status that has no payments

**Expected:** Empty state with message: "No [status] payments — try a different filter." or "Payments appear here once you record them against an invoice."

**Fail condition:** Generic "No data" copy, missing guidance to Invoice module.

🔲 Pass / ❌ Fail

---

### 8 — ⌘K navigation

**Steps:**
1. Press ⌘K, type "payments"
2. Select "Payments" from Jump to section

**Expected:** Navigates to `/payments`.

**Fail condition:** Not in command palette.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — mobile cards with method + status stacked; sheet from bottom | 🔲 |
| 768px — desktop table | 🔲 |
| 1024px — Date column visible | 🔲 |
| 1280px — Reference column visible | 🔲 |
| 1920px — no overflow | 🔲 |

---

## Sign-off

- [ ] All 8 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors
- [ ] User says: "Sprint 8 looks good, start Sprint 9"
