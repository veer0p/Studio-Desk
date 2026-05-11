# Sprint 11 — Auth — Manual test file

**Status:** 🔲 Not started  
**Tester:** _______________  
**Date:** _______________

> Legend: 🔲 untested · ✅ pass · ❌ fail

---

## Test 1 — Unauthenticated redirect

**Steps:**
1. Open a fresh private/incognito window (no cookies).
2. Navigate directly to `http://localhost:5173/dashboard`.

**Expected:** Redirected to `/login`. URL bar shows `/login`. Login page renders with no sidebar/topbar.

**Fail condition:** Dashboard renders without being authenticated, or redirect loops.

**Result:** 🔲

---

## Test 2 — Login with valid credentials

**Steps:**
1. On the Login page, enter the seed user's email and password.
2. Click "Sign in".

**Expected:** Spinner shows on button. After success, redirected to `/dashboard`. Sidebar, topbar, and dashboard content are all visible. Avatar in TopBar shows the first letter of the user's name.

**Fail condition:** Error toast, stays on `/login`, or page shows blank.

**Result:** 🔲

---

## Test 3 — Login with wrong credentials

**Steps:**
1. On the Login page, enter a valid email but wrong password.
2. Click "Sign in".

**Expected:** Error toast: "Wrong email or password". Form stays on `/login`. No redirect.

**Fail condition:** Redirect happens, or a generic error message is shown.

**Result:** 🔲

---

## Test 4 — Redirect to original destination after login

**Steps:**
1. Open a fresh incognito window.
2. Navigate to `http://localhost:5173/bookings`.
3. Login with valid credentials.

**Expected:** After login, redirected to `/bookings` (not `/dashboard`).

**Fail condition:** Always redirects to `/dashboard` regardless of original destination.

**Result:** 🔲

---

## Test 5 — Session persists across refresh

**Steps:**
1. Login with valid credentials.
2. Navigate to `/leads`.
3. Hard-refresh the page (Ctrl+Shift+R).

**Expected:** Still on `/leads` as the logged-in user. No redirect to `/login`. TopBar avatar still shown.

**Fail condition:** Refresh sends user to `/login`.

**Result:** 🔲

---

## Test 6 — Sign out

**Steps:**
1. Login with valid credentials.
2. Click the avatar in the top-right TopBar.
3. Click "Sign out".

**Expected:** Dropdown shows email + name. After clicking "Sign out", redirected to `/login`. Navigating to `/dashboard` in the same tab redirects back to `/login`.

**Fail condition:** Dropdown doesn't close, sign-out doesn't redirect, or session persists after sign-out.

**Result:** 🔲

---

## Test 7 — Sign up new account

**Steps:**
1. Navigate to `/signup`.
2. Fill in: Full name "Rahul Mehta", email (unique), password "testpass123", Studio name "Mehta Films", Studio URL auto-populates as "mehta-films".
3. Click "Create studio".

**Expected:** Spinner on button. After success, welcome toast "Welcome to StudioDesk, Rahul!". Redirected to `/dashboard`. User is logged in (avatar shows "R").

**Fail condition:** Error, no toast, no redirect, or wrong welcome message.

**Result:** 🔲

---

## Test 8 — Signup with duplicate email

**Steps:**
1. Navigate to `/signup`.
2. Enter an email that already exists in the database.
3. Click "Create studio".

**Expected:** Error toast: "An account with this email already exists". Form stays on `/signup`.

**Fail condition:** Generic error, server crash, or redirect.

**Result:** 🔲

---

## Test 9 — Signup with duplicate studio slug

**Steps:**
1. Navigate to `/signup`.
2. Enter a unique email but manually set the Studio URL to a slug that already exists.
3. Click "Create studio".

**Expected:** Error toast: "That studio URL is already taken — try a different slug".

**Fail condition:** Generic error or no feedback.

**Result:** 🔲

---

## Test 10 — Studio URL auto-slug

**Steps:**
1. Navigate to `/signup`.
2. In the "Studio name" field, type "XYZ Photography & Films".
3. Observe the "Studio URL" field.

**Expected:** Studio URL auto-populates as "xyz-photography-films" (lowercase, hyphens, special chars stripped). No extra hyphens at start/end.

**Fail condition:** URL not auto-populated, contains "&", spaces, or uppercase letters.

**Result:** 🔲

---

## Test 11 — Forgot password flow

**Steps:**
1. Navigate to `/forgot-password`.
2. Enter any email (does not need to exist).
3. Click "Send reset link".

**Expected:** Success state with checkmark and "Check your inbox" message. No error even for non-existent emails (no account leak). "Back to sign in" link visible.

**Fail condition:** Error shown for non-existent email, or form stays in non-success state.

**Result:** 🔲

---

## Test 12 — Auth pages have no sidebar/topbar

**Steps:**
1. Navigate to `/login`, `/signup`, `/forgot-password` in turn.

**Expected:** No sidebar, no topbar, no AppShell chrome. Full-screen centered layout on each page.

**Fail condition:** Sidebar or topbar visible on any auth page.

**Result:** 🔲

---

## Test 13 — 401 session expiry redirect

**Steps:**
1. Login with valid credentials.
2. In browser DevTools → Application → Cookies, delete the session cookie.
3. Navigate to `/leads` or click any link that triggers an API call.

**Expected:** App detects the 401 response and redirects to `/login`. A new login restores normal app access.

**Fail condition:** App silently fails with an error state, or crashes.

**Result:** 🔲

---

## Sign-off

- [ ] All 13 tests ✅ pass
- [ ] No console errors during any test
- [ ] TopBar shows real user name (not "Dev auth" banner)
- [ ] User says "looks good, Sprint 11 done — V1 complete"
