# Sprint 9 — Gallery — Manual Test File

**Tester:** ___________  
**Date:** ___________  
**Backend running at:** `http://localhost:3000`  
**Frontend running at:** `http://localhost:5173`

---

## Prerequisites

- At least one confirmed booking in the system
- Backend Immich integration may or may not be configured (tests should work without it)

---

## Tests

### 1 — Gallery list loads

**Steps:**
1. Navigate to `/gallery`

**Expected:** Grid of gallery cards (3 cols desktop, 2 cols tablet, 1 col mobile). Header shows "N galleries". "New gallery" button visible. Gallery cards show: name, status badge, photo count, client name, event date.

**Fail condition:** Spinner never resolves, layout broken.

🔲 Pass / ❌ Fail

---

### 2 — Status tab filtering

**Steps:**
1. Click "Draft" → URL gains `?status=draft&page=0`
2. Click "Published" → URL changes to `?status=published&page=0`
3. Click "All" → `?status` param removed

**Expected:** List updates for each filter.

**Fail condition:** Filter has no effect, URL wrong.

🔲 Pass / ❌ Fail

---

### 3 — New gallery dialog

**Steps:**
1. Click "New gallery" button
2. Open booking combobox, type part of a booking title
3. Select a booking
4. Optionally type a custom name
5. Click "Create gallery"

**Expected:** Dialog closes, toast "Gallery created", browser navigates to `/gallery/:id` (detail page).

**Fail condition:** Dialog doesn't close, no navigation, error shown.

🔲 Pass / ❌ Fail

---

### 4 — New gallery via ⌘K

**Steps:**
1. Press ⌘K
2. Type "new gallery"
3. Select "New gallery"

**Expected:** Navigates to `/gallery?new=1`, which opens the New Gallery dialog.

**Fail condition:** Not in command palette, dialog doesn't open.

🔲 Pass / ❌ Fail

---

### 5 — Gallery detail page loads

**Steps:**
1. Click any gallery card from the list

**Expected:**
- URL is `/gallery/:id`
- "All galleries" back button at top
- Gallery name + status badge + client/booking info
- Stats row: Photos / Videos / Storage / Views
- Upload section with dropzone
- Details section with slug + created date

**Fail condition:** 404 or error state, back button missing.

🔲 Pass / ❌ Fail

---

### 6 — Photo upload

**Steps:**
1. Open a gallery detail page
2. Drop 2–3 JPEG files onto the dropzone (each < 52 MB)
3. Click "Upload"

**Expected:** "Preparing…" spinner while converting to base64, then "Uploading…", then toast "Upload queued — processing in the background". Progress bar appears showing job status polling (updates every 3 s). When completed: "Upload complete — N photos added" banner (green), then banner dismisses after 4 s. Stats row shows updated photo count.

**Fail condition:** Upload button does nothing, no progress shown.

🔲 Pass / ❌ Fail

---

### 7 — File validation on upload

**Steps:**
1. Try dragging a file > 52 MB
2. Try dragging > 50 files at once

**Expected:** Toast error "N file(s) skipped — max 52 MB each" or "Max 50 files per upload — extra files skipped".

**Fail condition:** Oversized file accepted, no error shown.

🔲 Pass / ❌ Fail

---

### 8 — Publish gallery

**Steps:**
1. On a gallery with at least 1 photo (status = draft)
2. Click "Publish" button
3. Toggle "Allow download" if desired
4. Optionally set expiry date
5. Click "Publish"

**Expected:** Dialog closes, toast "Gallery published — client link is live". Status badge changes to "Published". Share link section appears with copy button.

**Fail condition:** Error toast ("Cannot publish empty gallery" is expected if 0 photos — verify that message), status not updated.

🔲 Pass / ❌ Fail

---

### 9 — Share link copy

**Steps:**
1. Open a published gallery
2. In the "Share link" section, click "Copy"

**Expected:** Button changes to "Copied" (green) for 2 s. URL is copied to clipboard.

**Fail condition:** No visual feedback, clipboard not updated.

🔲 Pass / ❌ Fail

---

### 10 — Face clusters section

**Steps:**
1. Open a gallery that has been processed with Immich integration active (or mock the API to return clusters)

**Expected:** "Face clusters" section appears below Upload. Labeled clusters show name + photo count. Unlabeled clusters show "Unlabeled".

**Fail condition:** Section missing entirely, crashes on null thumbnail.

🔲 Pass / ❌ Fail

---

### 11 — ⌘K → Gallery jump-to

**Steps:**
1. Press ⌘K, type "gallery"
2. Select "Gallery"

**Expected:** Navigates to `/gallery`.

**Fail condition:** Not in command palette.

🔲 Pass / ❌ Fail

---

### 12 — Empty state

**Steps:**
1. Filter to "Archived" (assuming no archived galleries)

**Expected:** Empty state: "No archived galleries — try a different filter."

**Fail condition:** Generic "No data" or crash.

🔲 Pass / ❌ Fail

---

## Responsive checklist

| Breakpoint | Check |
|---|---|
| 375px — 1-col card grid, stats 2×2, upload dropzone full-width | 🔲 |
| 640px — 2-col gallery grid | 🔲 |
| 1024px — 3-col gallery grid | 🔲 |
| 1280px — 4-col gallery grid | 🔲 |

---

## Sign-off

- [ ] All 12 tests passed
- [ ] Responsive checklist complete
- [ ] No console errors
- [ ] User says: "Sprint 9 looks good, start Sprint 10"
