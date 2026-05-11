# Frontend Verification — Foundation (Sprint 0)

&nbsp;

> Walk every test below. Mark Status: 🔲 → ✅ if it passes, ❌ if it fails (and note what went wrong).
> Run both dev servers first: backend at `:3000` (`cd backend/studiodesk && npm run dev`) and frontend at `:5173` (`cd frontend && npm run dev`).

&nbsp;

---

## ✅ Test #1 — Cold load `/` renders shell + lands on `/leads`

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/main.tsx`, `src/app/router.tsx`, `src/components/layout/AppShell.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Open `http://localhost:5173/`
>
> **Step 2:** Observe — the URL should redirect to `/leads` and the shell should render (sidebar on the left, top bar across the top, placeholder content in the main area)
>
> **Step 3:** No console errors (open DevTools → Console)

&nbsp;

### ✔️ Expected result:
- URL is `http://localhost:5173/leads`
- Left sidebar shows "StudioDesk · XYZ Photography" with nav items (Leads enabled, others marked "Soon")
- Top bar shows the DEV AUTH chip, search box ("Search or jump to… ⌘K"), theme toggle, bell icon, and avatar (PS · Priya Sharma)
- Main area renders the "Leads — coming next sprint" empty state
- No red console errors

&nbsp;

### ❌ Fail condition:
- White page → React mount failed; check `main.tsx` and `providers.tsx`
- Stuck on `/` (no redirect) → router config in `router.tsx` is wrong
- Sidebar missing → `AppShell.tsx` layout broken
- Font feels generic (Times/Arial) → Inter font preconnect not loading

&nbsp;

---

&nbsp;

## ✅ Test #2 — DEV AUTH banner is visible

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/layout/TopBar.tsx`, `src/lib/auth/devShim.ts` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** On `/leads`, look at the left side of the top bar
>
> **Step 2:** Hover the "DEV AUTH · Sprint 11 replaces" chip

&nbsp;

### ✔️ Expected result:
- Amber pill with "DEV AUTH · Sprint 11 replaces" text is visible
- Tooltip on hover reads "The frontend is running on a fixed test user. Real Supabase auth ships in Sprint 11."
- Avatar in the top right shows "Priya Sharma" — the dev shim user

&nbsp;

### ❌ Fail condition:
- No banner → `useMe()` is returning `isDevAuth: false` or TopBar isn't reading it
- Banner shows but no avatar name → `devShim.ts` data shape mismatch

&nbsp;

---

&nbsp;

## ✅ Test #3 — `/_components` preview page renders all design primitives

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/app/routes/dashboard/ComponentsPreview.tsx`, all `src/components/motion/*`, `src/components/data/*` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Navigate to `http://localhost:5173/_components` directly
>
> **Step 2:** Observe each section: Aurora hero, KPI cards with number tickers, empty state, error state, loading skeletons, slide-over trigger
>
> **Step 3:** Click "Open slide-over" — verify the right panel slides in from the right with spring motion

&nbsp;

### ✔️ Expected result:
- Aurora gradient backdrop visible behind the hero text (subtle violet/indigo/sky drift)
- 4 KPI cards: revenue (₹4,82,000), outstanding (₹94,500 in amber), today (3), new leads (11 in green)
- Numbers animate from 0 to their final value on load (≈ 1.2s)
- Empty state: indigo icon, "No leads yet — your first wedding shoot is one click away." with an "Add lead" button
- Error state: red icon, "We could not reach the server. Hang tight, retrying…", with a "Try again" button
- Slide-over: opens from the right with spring motion, has "Sharma Wedding" header, X close button on the right, backdrop blurs the page behind

&nbsp;

### ❌ Fail condition:
- Aurora not visible → CSS variables not loaded; check `tokens.css` import in `globals.css`
- Numbers stay at 0 or show NaN → `NumberTicker` motion value misconfigured
- Slide-over jumps in instantly → spring transition stripped (check `prefers-reduced-motion`)
- Aurora animates aggressively → reduce-motion ignored

&nbsp;

---

&nbsp;

## ✅ Test #4 — ⌘K opens the command palette

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/kbar/CommandPalette.tsx`, `src/components/layout/AppShell.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** On any page, press `⌘K` (macOS) or `Ctrl+K` (Windows/Linux)
>
> **Step 2:** Type "components"
>
> **Step 3:** Press `Enter`

&nbsp;

### ✔️ Expected result:
- Palette opens centered, fades in over ~150 ms
- Search input is focused; type-ahead filters the list
- "Components preview" entry matches; pressing Enter navigates to `/_components`
- Pressing `Esc` or clicking the search button in the top bar also opens/closes the palette

&nbsp;

### ❌ Fail condition:
- Nothing happens on ⌘K → keyboard listener in `AppShell` not bound
- Palette opens but search doesn't filter → cmdk config issue
- Enter doesn't navigate → `onSelect` not wired to `navigate()`

&nbsp;

---

&nbsp;

## ✅ Test #5 — Theme toggle persists across reloads

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/layout/TopBar.tsx`, `src/app/providers.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Click the moon/sun icon in the top bar
>
> **Step 2:** Page should switch theme (light ↔ dark)
>
> **Step 3:** Hard reload (`Ctrl+Shift+R`)

&nbsp;

### ✔️ Expected result:
- Background, card, text colors all change in unison (no flicker on individual elements)
- After reload, the page comes back in the same theme — no flash of light-then-dark
- `localStorage.getItem('theme')` returns either `"light"` or `"dark"` (check DevTools → Application → Local Storage)

&nbsp;

### ❌ Fail condition:
- Some elements switch but others don't → hex literal somewhere bypassing tokens (lint should have caught this)
- Reload flashes the wrong theme briefly → `ThemeBoot` runs too late; consider moving to a blocking inline script
- Reload reverts to light → localStorage write failing or read miswired

&nbsp;

---

&nbsp;

## ✅ Test #6 — Mobile viewport (375×667) — sidebar adapts

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/layout/Sidebar.tsx`, `src/components/layout/AppShell.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** DevTools → Toggle device toolbar → iPhone SE (375×667)
>
> **Step 2:** Reload page

&nbsp;

### ✔️ Expected result:
- Sidebar is hidden on mobile (no horizontal scroll on the page)
- Top bar remains usable; DEV AUTH chip, search trigger, theme/bell/avatar all visible (avatar may collapse to icon only — acceptable)
- Main content fits the viewport without overflow

&nbsp;

### ❌ Fail condition:
- Sidebar visible at 375 → `md:flex` class missing or breakpoints wrong
- Horizontal scrollbar → fixed widths somewhere; check the page
- Top bar overflows → too many items at this width; demote secondary actions
- DEV AUTH chip visible at 375 → should be `hidden md:inline-flex`
- Full search bar visible at 375 → should be `hidden md:flex`, icon-only search button visible instead
- Hamburger menu button missing at 375 → `md:hidden` class wrong on TopBar's Menu button

&nbsp;

---

&nbsp;

## ✅ Test #6b — Mobile drawer navigation works

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/layout/MobileNavDrawer.tsx`, `src/components/layout/NavTree.tsx`, `src/components/layout/TopBar.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** DevTools at 375×667 (iPhone SE)
>
> **Step 2:** Tap the hamburger icon in the top-left of the top bar
>
> **Step 3:** The drawer slides in from the left edge
>
> **Step 4:** Tap "Leads" inside the drawer
>
> **Step 5:** Drawer closes; URL is `/leads`

&nbsp;

### ✔️ Expected result:
- Drawer slides from left, takes ~280px width (or 85vw, whichever is smaller)
- Backdrop is dimmed and blurred
- Studio switcher and all three nav sections (Pipeline / Finance / Delivery) visible inside
- Every interactive row is ≥ 44px tall (touch-friendly)
- Tapping a nav item navigates AND closes the drawer
- Swipe-from-edge-to-close works (vaul gesture)
- Tapping the backdrop closes the drawer

&nbsp;

### ❌ Fail condition:
- Drawer doesn't open → hamburger button onClick not wired to `setMobileNavOpen(true)`
- Drawer items are tiny (≤ 36px) → `variant='mobile'` not passed to `NavTree`
- Drawer doesn't close after navigation → `onNavigate` callback missing from NavLink onClick

&nbsp;

---

&nbsp;

## ✅ Test #6c — Mobile leads list shows cards, not table

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/app/routes/dashboard/LeadsPlaceholder.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** At 375×667, navigate to `/leads`
>
> **Step 2:** Observe the three preview rows (Aanya Mehta, Rohan Patel, Sharma family)

&nbsp;

### ✔️ Expected result:
- Each row renders as a stacked card with: avatar circle, name, event + date, status pill, source + value
- No horizontal scroll on the page
- Search/filter pill buttons stack or wrap (no overflow)
- Page header reads `Leads` + factual descriptor — NOT marketing prose

&nbsp;

### ❌ Fail condition:
- Horizontal-scrolling table visible at 375 → mobile card section missing `md:hidden`; table missing `hidden md:block`
- Page header still says "Where every wedding begins…" or similar → marketing prose not removed

&nbsp;

---

&nbsp;

## ✅ Test #6d — Ultra-wide content stays centered with gutters

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/layout/PageContainer.tsx`, `src/app/routes/dashboard/LeadsPlaceholder.tsx` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** DevTools → device toolbar → Responsive → set to 2560×1080 (or 3440×1440 if you have a real ultra-wide)
>
> **Step 2:** Open `/leads`

&nbsp;

### ✔️ Expected result:
- Content (header, table, etc.) caps at ~1280px and stays centered
- Visible side gutters on both edges
- Background body wash (subtle indigo/violet radial) is visible in the gutter space
- Sidebar stays at 256px on the left; the gutter is on the right + balanced via the centering of the inner container

&nbsp;

### ❌ Fail condition:
- Content stretches edge-to-edge → `PageContainer` not used or `max-w-7xl` missing
- Side gutters look unbalanced or text feels far from the sidebar → `mx-auto` missing or padding wrong

&nbsp;

## ✅ Test #7 — `prefers-reduced-motion: reduce` freezes aurora and disables springs

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `src/components/motion/AuroraHero.tsx`, `src/app/providers.tsx`, `src/styles/globals.css` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** DevTools → Rendering panel → "Emulate CSS media feature `prefers-reduced-motion`" → set to "reduce"
>
> **Step 2:** Navigate to `/_components`
>
> **Step 3:** Open the slide-over

&nbsp;

### ✔️ Expected result:
- Aurora gradient is static (no drift / no scale / no rotate)
- KPI number tickers either snap to the final value immediately or animate near-instantly
- Slide-over still functions but does not "spring" — it appears more like a fade/jump

&nbsp;

### ❌ Fail condition:
- Aurora still drifting → `useReducedMotion` not wired in `AuroraHero`
- KPI numbers still animate over a second → `animate()` not respecting reduced motion at the framework level
- Slide-over still bouncy → `MotionConfig reducedMotion="user"` not set

&nbsp;

---

&nbsp;

## ✅ Test #8 — Memory file exists and is indexed in MEMORY.md

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `~/.claude/projects/D--Viraj-Personal-projects-Studio-desk/memory/anti-ai-design.md`, `MEMORY.md` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Open `C:\Users\nativ\.claude\projects\D--Viraj-Personal-projects-Studio-desk\memory\anti-ai-design.md`
>
> **Step 2:** Verify the file has frontmatter (`name`, `description`, `type: feedback`) and the 12 rules + pre-commit checklist
>
> **Step 3:** Open `MEMORY.md` in the same folder

&nbsp;

### ✔️ Expected result:
- `anti-ai-design.md` is present, ≥ 50 lines, frontmatter intact
- `MEMORY.md` contains the line: `- [Anti-AI design discipline](anti-ai-design.md) — 12 rules that prevent AI-built look; check before every UI commit`

&nbsp;

### ❌ Fail condition:
- File missing → Sprint 0.3 not executed
- File exists but frontmatter wrong → memory system won't index it correctly
- `MEMORY.md` missing the pointer → rules won't auto-load on future prompts

&nbsp;

---

&nbsp;

## ✅ Test #9 — Hex literal in a component file fails lint

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `frontend/eslint.config.js`, any file under `src/components/` or `src/features/` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Temporarily add a literal hex color in `src/components/data/EmptyState.tsx` — for example, change one of the className lines to include a `style={{ color: '#ff0000' }}` prop
>
> **Step 2:** Run `npm run lint` from `frontend/`
>
> **Step 3:** Revert the change

&nbsp;

### ✔️ Expected result:
- Lint output includes: `Hex color literals are forbidden. Use a token from src/lib/constants/palette.ts or a Tailwind class backed by tokens.`
- Exit code is non-zero

&nbsp;

### ❌ Fail condition:
- Lint passes despite the literal → `no-restricted-syntax` rule not applied to this glob; check `eslint.config.js`

&nbsp;

---

&nbsp;

## ✅ Test #10 — Aceternity import outside (public)/(auth) fails lint

&nbsp;

| Field | Value |
|-------|-------|
| **Module** | Foundation |
| **Files** | `frontend/eslint.config.js` |
| **API** | — |
| **Status** | 🔲 Not tested |

&nbsp;

### 📋 Steps to test:

> **Step 1:** Temporarily add `import { Something } from 'aceternity-ui-fake';` to the top of `src/app/routes/dashboard/LeadsPlaceholder.tsx`
>
> **Step 2:** Run `npm run lint`
>
> **Step 3:** Revert

&nbsp;

### ✔️ Expected result:
- Lint output includes: `Aceternity / Magic UI flair components are restricted to (public)/ and (auth)/ route trees only.`
- Exit code is non-zero

&nbsp;

### ❌ Fail condition:
- Lint passes → `no-restricted-imports` rule missing this glob or pattern

&nbsp;

---
