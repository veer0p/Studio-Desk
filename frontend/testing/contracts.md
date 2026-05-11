# Sprint 5 — Contracts — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- Backend seeded with contracts in at least 2–3 statuses (draft, sent, signed)
- Studio must have at least one contract template (auto-seeded on first GET /contracts/templates call)

---

## Tests

### 1 — Contracts list loads

**Steps:**
1. Navigate to `/contracts`

**Expected:** Table (desktop) / card list (mobile) renders. Header shows "N contracts" count.

**Fail condition:** Spinner never resolves, error state when backend healthy.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Awaiting" tab → URL `?status=sent&page=0`
2. Click "Signed" tab → URL `?status=signed&page=0`
3. Click "All" → `?status` removed

**Expected:** List filters correctly. Active tab has dark pill styling.

**Fail condition:** Filter doesn't update list, URL wrong, "All" leaves stale param.

🔲 Pass / ❌ Fail

---

### 3 — New contract dialog opens

**Steps:**
1. Click "New contract" OR press `n` key

**Expected:** Dialog opens with booking UUID field, optional template UUID field, notes textarea, and amber info banner about Sprint 6 picker.

**Fail condition:** Dialog doesn't open, wrong fields, no amber banner.

🔲 Pass / ❌ Fail

---

### 4 — New contract: valid submit

**Steps:**
1. Open dialog, enter a valid booking UUID
2. Submit

**Expected:** Toast "Contract created — Draft contract generated…". Dialog closes. Contract appears in list.

**Fail condition:** No toast, dialog stays open, or contract not in list.

🔲 Pass / ❌ Fail

---

### 5 — New contract: no template 422

**Steps:**
1. Use a booking UUID for a studio that has no contract templates

**Expected:** Toast "No template found — Create a contract template in Settings before generating contracts."

**Fail condition:** Generic error toast or crash.

🔲 Pass / ❌ Fail

---

### 6 — Contract slide-over: Contract tab

**Steps:**
1. Click any contract row

**Expected:**
- URL gains `?id=<uuid>`, slide-over animates in
- "Contract" tab active by default
- Rendered HTML preview of the contract content (headings, paragraphs)
- Signed contracts show green "Signed on…" banner at bottom with optional PDF link

**Fail condition:** Raw HTML shown as text, no animation, URL doesn't update.

🔲 Pass / ❌ Fail

---

### 7 — Contract slide-over: Info tab

**Steps:**
1. Open any slide-over, click "Info" tab

**Expected:** Client name, booking title, event type/date, client email, status badge, timeline (created, sent, viewed, reminded, signed dates with icons).

**Fail condition:** Missing fields for a contract that has them.

🔲 Pass / ❌ Fail

---

### 8 — Send action (draft contract)

**Steps:**
1. Open a draft contract slide-over
2. Click "Send"

**Expected:** Toast "Contract sent — client will receive email…". Status badge updates to "Awaiting signature". Button changes to "Resend".

**Fail condition:** No toast, status doesn't update, button disappears.

🔲 Pass / ❌ Fail

---

### 9 — Remind action (sent contract, cooled down)

**Steps:**
1. Open a sent contract where `reminder_sent_at` is null or > 24h ago
2. Click "Remind"

**Expected:** Toast "Reminder sent — A follow-up email was sent to the client." The "Remind" button briefly shows "Sending…"

**Fail condition:** No toast, button crashes, wrong timing condition.

🔲 Pass / ❌ Fail

---

### 10 — Remind cooldown (< 24h)

**Steps:**
1. Open a sent contract where a reminder was sent less than 24h ago

**Expected:** "Remind" button is NOT shown; instead a grey "Remind in Xh" label appears in the header.

**Fail condition:** "Remind" button still shown, or no indicator.

🔲 Pass / ❌ Fail

---

### 11 — Notes tab ⌘↵

**Steps:**
1. Open any contract slide-over, click "Notes" tab
2. Type text, press ⌘↵

**Expected:** PATCH `/contracts/[id]` fires with `{ notes: "..." }`. "Saved ✓" for 2s. Esc reverts.

**Fail condition:** Save doesn't fire, Esc doesn't revert.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — mobile cards, status tabs scroll, bottom sheet | 🔲 |
| 768px — desktop table | 🔲 |
| 1024px — Booking column visible | 🔲 |
| 1280px — Sent + Signed date columns visible | 🔲 |
| 1920px — no overflow | 🔲 |

---

## Sign-off

- [ ] All 11 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors
- [ ] User says: "Sprint 5 looks good, start Sprint 6"
