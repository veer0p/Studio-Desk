# Sprint 00 — Foundation

**Status:** Done
**Started:** 2026-05-11
**Finished:** 2026-05-11

## Goal
Build everything needed to start Sprint 1 (Leads): cleanup, scaffolded Vite app, design tokens enforced by lint, app shell + visual primitives, API client with envelope unwrap, dev-auth shim, command palette, and a foundation test file.

## 0.1 — Bootstrap
- [x] `git fetch` — confirmed up to date with origin/main
- [x] `git status` — many pending deletions from old frontend; building new code alongside
- [x] Create `plan/` folder at repo root
- [x] Write `plan/plan.md` (canonical scope)
- [x] Write `plan/sprint-00-foundation.md` (this file)
- [x] Create `api-issues.md` at repo root with empty table

## 0.2 — Legacy cleanup
- [x] Create `docs/_archive/`
- [x] Move root stale docs to `docs/_archive/`: `FIX_IMPLEMENTATION_REPORT.md`, `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_STATUS.md`, `INDEX.md`, `REMAINING_AI_DOCS.md`, `REMAINING_FIXES.md`, `UI_UX_ROUTING_AUDIT.md`, `DECISION_LOG.md`, old `plan.md`
- [x] Move `docs/`: `FRONTEND_AUDIT.md`, `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_STATUS.md`, `PLAN.md`, `WEEK1_PLAN.md`, `SUPERADMIN_GALLERY_PLAN.md`
- [x] Delete `template.html`
- [x] Delete `QWEN.md`

## 0.3 — Memory file (auto-loading anti-AI rules)
- [x] Write `~/.claude/projects/D--Viraj-Personal-projects-Studio-desk/memory/anti-ai-design.md` (12 rules + checklist, frontmatter `type: feedback`)
- [x] Append pointer line to `MEMORY.md`

## 0.4 — Frontend scaffold
- [x] `frontend/` Vite 6 + React 19 + TS
- [x] Install deps (core, data, UI, motion, forms, tables, interactions, dev) — `npm install` clean
- [x] Configure Tailwind v4 (`@tailwindcss/vite`)
- [x] Tokens-driven styling — skipped shadcn CLI; primitives hand-built directly on Radix to keep Sprint 0 tight (shadcn CLI can be added later when first dropping a complex primitive)
- [x] `src/styles/tokens.css` with locked palette + 4px spacing scale
- [x] `src/lib/constants/palette.ts` exporting the eight allowed token names
- [x] ESLint: forbid hex literals in component files; `no-restricted-imports` blocks Aceternity/Magic UI outside `(public)/` and `(auth)/`
- [x] Path alias `@/`
- [x] Vitest + RTL config — packages installed; first test runs in Sprint 1
- [x] `.env.local` with `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- [x] `npm run typecheck`, `npm run lint`, `npm run build` all green
- [x] Dev server boots: `http://localhost:5173` returns HTTP 200

## 0.5 — Shell & primitives
- [x] `src/app/router.tsx` — react-router v7 with `(dashboard)` shell + `/inquiry` public route + redirects
- [x] `src/app/providers.tsx` — QueryClient + Toaster + MotionConfig (`reducedMotion="user"`) + theme boot
- [x] `components/layout/AppShell.tsx` + ⌘K keyboard listener
- [x] `components/layout/Sidebar.tsx` — full-width nav with enabled/coming-soon entries per V1 build order
- [x] `components/layout/TopBar.tsx` — DEV AUTH banner + ⌘K trigger + theme toggle + avatar
- [x] `components/layout/SlideOver.tsx` — Radix Dialog with spring motion
- [x] `components/motion/AuroraHero.tsx` (lint-gated; AuroraHero file itself is the lone exception)
- [x] `components/motion/GlassCard.tsx`
- [x] `components/motion/NumberTicker.tsx`
- [x] `components/data/EmptyState.tsx`, `LoadingSkeleton.tsx`, `ErrorState.tsx`
- [~] `components/data/DataTable.tsx` — deferred to Sprint 1 (first real list)
- [~] `components/forms/*` — deferred to Sprint 1 (first real form)
- [x] `components/kbar/CommandPalette.tsx` — ⌘K with cmdk; modules will register commands as they ship

## 0.6 — API client + types + formatters
- [x] `src/lib/api/client.ts` — `ky` wrapper, envelope unwrap (`{ data, error, code }`), `ApiError` class
- [x] `src/lib/api/queryKeys.ts`
- [x] `src/types/api.ts` — envelope + pagination meta + error code union
- [x] `src/types/domain.ts` — enums mirrored from `backend/studiodesk/types/index.ts`
- [x] `src/lib/formatters/` — `formatINR`, `paiseToRupees`, `rupeesToPaise`, `formatIndianNumber`, `formatIndianPhone`, `formatDate`, `formatDateTime`, `formatRelative`

## 0.7 — Dev-auth shim (Sprint 11 replaces it)
- [x] `src/lib/auth/devShim.ts` — `useMe()` returns Priya Sharma / XYZ Photography (Studio A, owner@test.com)
- [x] DEV AUTH banner rendered in TopBar with tooltip pointing to Sprint 11
- [x] Module code reads via `useMe()` so Sprint 11 swap is transparent

## 0.8 — Foundation test file
- [x] `frontend/testing/foundation.md` written in fix-bugs format with tests #1–#10
- [x] Each test has Module/Files/API metadata table, steps, expected result, fail condition, 🔲 status

## 0.10 — Responsive & touch discipline (added after first UI review)
- [x] Memory file `responsive-touch-discipline.md` written (10 rules + breakpoints + checklist), pointer added to `MEMORY.md` — auto-loads on every future prompt
- [x] Anti-AI rule #10 updated: factual page headers, no marketing prose inside the app
- [x] `PageContainer.tsx` — every dashboard page wraps body in `max-w-7xl` with responsive `px-*` + `2xl:px-16` gutters so ultra-wide monitors get centered content
- [x] `PageHeader.tsx` — locked header shape: `<h1>{title}</h1>` + one-line factual descriptor; stacks on `<md`, row on `md+`
- [x] `NavTree.tsx` — extracted from Sidebar so the same nav contents render in both desktop sidebar and mobile drawer; `variant: mobile` bumps row height to 44px
- [x] `MobileNavDrawer.tsx` — vaul left-edge drawer with swipe-to-close; hamburger lives in TopBar on `<md`
- [x] `TopBar.tsx` mobile mode: hamburger button left, search bar collapses to a single icon button, DEV chip hidden, avatar collapses to circle only
- [x] `LeadsPlaceholder.tsx` rewritten: factual `<h1>Leads</h1>` + descriptor, marketing prose removed; table on `md+` collapses to stacked cards on `<md`
- [x] `ComponentsPreview.tsx` migrated to PageContainer + PageHeader; KPI grid is `sm:grid-cols-2 xl:grid-cols-4`; touch targets ≥ 44px on `<md`

## API issues found this sprint
- (none yet)

## Sign-off
- [x] User said "now next" — moving to Sprint 1 (Leads)
