# Sprint 7 — Invoices — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- Backend seeded with invoices in at least 3 statuses (draft, sent, partially_paid, paid)
- At least 2 bookings in the database (for the booking combobox)
- Supabase with invoices table populated (use seed script or create manually)

---

## Tests

### 1 — Invoices list loads

**Steps:**
1. Navigate to `/invoices`

**Expected:** Table (desktop) / card list (mobile) renders. Header shows "N invoices". Each row shows: invoice number (monospace, accent color), client name, booking title, type badge (Advance/Balance/Full), status badge, total amount in INR.

**Fail condition:** Spinner never resolves, amounts shown as raw decimals instead of INR.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Overdue" tab → URL `?status=overdue&page=0`
2. Click "Paid" tab → URL `?status=paid&page=0`
3. Click "All" → `?status` removed

**Expected:** List filters. Overdue invoices shown in red status badge.

**Fail condition:** Filter stale, URL wrong.

🔲 Pass / ❌ Fail

---

### 3 — New invoice dialog: opens

**Steps:**
1. Click "New invoice" OR press `n` key
2. Test from ⌘K → "New invoice"

**Expected:** Dialog opens with: Booking combobox, Invoice type (Full/Advance/Balance), GST type (auto-detect/CGST+SGST/IGST/Exempt), Due date, at least 1 line item row, Add item button, Client notes + Internal notes.

**Fail condition:** Dialog doesn't open, missing fields.

🔲 Pass / ❌ Fail

---

### 4 — Booking combobox search

**Steps:**
1. Open new invoice dialog, click Booking combobox
2. Type a partial booking title

**Expected:** Dropdown filters to matching bookings, showing title + client name + total amount. Selecting one populates the field.

**Fail condition:** No results, selection doesn't work.

🔲 Pass / ❌ Fail

---

### 5 — Line items: add / remove / live total

**Steps:**
1. Open new invoice dialog
2. Enter a line item: "Photography coverage", quantity 1, price 40000
3. Click "Add item", enter second item: "Travel", 1, 5000
4. Check the Subtotal display
5. Remove the second item

**Expected:** Subtotal updates live (₹40,000 → ₹45,000 → ₹40,000). Remove button deletes the row. Cannot remove when only 1 item remains.

**Fail condition:** Subtotal doesn't update live, remove button disabled with 2 items.

🔲 Pass / ❌ Fail

---

### 6 — New invoice: valid submit

**Steps:**
1. Select a booking, type "Full", add 1 line item (name + price), submit

**Expected:** Toast "Invoice created — GST calculated from client state. Send it when ready." Dialog closes. Invoice appears in list with status "Draft" and a generated invoice_number like "INV-2026-0001".

**Fail condition:** No toast, dialog stays open, no invoice in list.

🔲 Pass / ❌ Fail

---

### 7 — Invoice slide-over: Invoice tab

**Steps:**
1. Click any invoice row

**Expected:**
- URL gains `?id=<uuid>`, slide-over animates in
- Invoice tab active: line items table (Item / Qty / Rate / Amount), totals block (Subtotal, CGST+SGST or IGST if applicable, Total), payment status (Paid / Due amounts), PDF link if available

**Fail condition:** Raw string amounts not formatted as INR, GST breakdown missing when gst_type is not exempt.

🔲 Pass / ❌ Fail

---

### 8 — Send action

**Steps:**
1. Open a draft invoice slide-over
2. Click "Send"

**Expected:** Toast "Invoice sent — Client will receive an email with the payment link." Status badge updates to "Sent". Button changes to "Resend".

**Fail condition:** No toast, status doesn't update.

🔲 Pass / ❌ Fail

---

### 9 — Record payment

**Steps:**
1. Open a sent invoice
2. Click "Record payment"
3. Enter amount (₹25000), method UPI, UTR number
4. Submit

**Expected:** Dialog closes. Toast "Payment recorded — UPI payment of ₹25,000 recorded." Status updates to "Partially paid" if amount < total, "Paid" if full.

**Fail condition:** No toast, dialog stays open, status doesn't update.

🔲 Pass / ❌ Fail

---

### 10 — Credit note

**Steps:**
1. Open a paid invoice
2. Click "Credit note"
3. Enter amount ₹5000, reason (min 10 chars)
4. Submit

**Expected:** Toast "Credit note created — A credit note invoice has been generated." New credit_note type invoice appears in the list.

**Fail condition:** Button not shown for paid invoices, form validation missing, no toast.

🔲 Pass / ❌ Fail

---

### 11 — Payment link

**Steps:**
1. Open a sent invoice that has no payment_link_url yet
2. Click "Razorpay link"

**Expected:** Toast "Payment link copied — Razorpay payment link copied to clipboard." Link now shows in the Info tab.

**Fail condition:** Button missing, link not copied.

🔲 Pass / ❌ Fail

---

### 12 — Notes tab (client + internal)

**Steps:**
1. Open any invoice, click "Notes" tab
2. Edit client notes + internal notes
3. Click "Save notes"

**Expected:** PATCH fires. "Saved ✓" appears. Both fields persist on reopen.

**Fail condition:** Save fails, fields don't persist.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — mobile cards with INR totals; sheet from bottom | 🔲 |
| 768px — desktop table with invoice numbers | 🔲 |
| 1024px — Due date column visible | 🔲 |
| 1280px — Amount due column visible | 🔲 |
| 1920px — no overflow | 🔲 |

---

## Sign-off

- [ ] All 12 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors
- [ ] User says: "Sprint 7 looks good, start Sprint 8"
