# StudioDesk Frontend — Plan (greenfield, sprint-driven, auth-last)

> Canonical source of truth for the frontend rebuild. Sprint files in this folder track sub-task progress.

## Context

StudioDesk is a SaaS for Indian photography studios & agencies: CRM, bookings, GST-compliant invoicing, Razorpay/UPI payments, AI face-recognition galleries, WhatsApp automations. The backend (`backend/studiodesk/`) is a mature Next.js + Supabase API at `/api/v1/*` with ~30 modules already in production.

The previous frontend has been **deleted by the owner**. This is a clean greenfield rebuild.

**Working style:**
- **Sprint-driven** — every stage has its own sprint file in `plan/`, with a checklist of sub-tasks ticked off as they finish.
- **Module-wise** — build one module fully (UI + API binding + polish), write its manual test file (fix-bugs format), get user sign-off, then move to the next.
- **Auth comes last** — V1 modules are built behind a temporary dev shim that fakes a logged-in studio. Real Supabase auth is the FINAL sprint before V1 ships.
- **No phantom bindings** — if a backend route doesn't exist or its shape is broken, append to `api-issues.md` at repo root and disable the UI path.

---

## Anti-AI design discipline

### The 12 rules

1. **One accent color.** Indigo `#6366f1`. Neutrals carry the rest. Semantic colors only for status. Never decoratively.
2. **One typeface family.** Inter (body) + Inter Display (headings). Never mix 3+ fonts.
3. **4px grid, fixed spacing scale.** Allowed gaps: `4, 8, 12, 16, 24, 32, 48, 64` only.
4. **Aurora is scarce.** One aurora gradient per route, hero zone only. Never behind tables, forms, modals, chrome.
5. **No glow on default state.** `shadow-sm`/`shadow-md` for rest. `--shadow-glow` for focus only.
6. **No shimmer/border-beam/marquee inside the app.** Public + auth route trees only. Enforced by lint.
7. **No animated gradient text inside the app.** One per route, hero zone only.
8. **Real content always.** Indian names (Priya, Rahul, Sharma Wedding), real INR amounts, real event types. Never "John Doe", "Lorem ipsum".
9. **Editorial asymmetry.** Big left-aligned numbers, uneven columns (7/12 + 5/12 over 6/6) where it serves the eye.
10. **Microcopy with a voice.** Empty: "No bookings yet — your first wedding shoot is one click away." Errors: "We couldn't reach the server. Hang tight, retrying…"
11. **Motion is quiet.** Default 180–280ms ease-out. No spring on chrome. Exceptions: KPI number tickers (1200ms), slide-over enter (spring 350/32).
12. **One CTA per surface.** Maximum one primary button visible. Secondary = ghost/outline. Tertiary = text link.

### Pre-commit checklist

- [ ] Color outside locked palette? → Remove.
- [ ] Spacing not in {4,8,12,16,24,32,48,64}? → Snap.
- [ ] Second aurora/gradient on a route that already has one? → Remove.
- [ ] Glow/shimmer/beam on resting state? → Reserve for focus/hover only.
- [ ] Any "John Doe" / "Sample text" / placeholder data? → Replace with real Indian context.
- [ ] 2+ primary buttons in viewport? → Demote all but one.
- [ ] Empty state has real-voice copy?
- [ ] Motion >300ms outside the two whitelisted exceptions? → Shorten.
- [ ] Mobile differs from desktop (adapted, not shrunk)?
- [ ] Screenshot next to Vercel/Linear/Stripe — still deliberate, not louder?

### Auto-loading

Sprint 0 writes `~/.claude/projects/D--Viraj-Personal-projects-Studio-desk/memory/anti-ai-design.md` and adds a pointer in `MEMORY.md`. From then on, the 12 rules load on every prompt in this project.

---

## Locked decisions

| Area | Choice |
|---|---|
| Framework | **Vite 6 + React 19 + TypeScript** SPA |
| Location | `frontend/` directory at repo root |
| Visual direction | **Clean premium** (Vercel/Linear/Stripe lineage). Aurora used scarcely. |
| Component foundation | **shadcn/ui + Radix + Tailwind v4**. Aceternity/Magic UI lint-restricted to public + auth routes. |
| Workflow | Sprint files in `plan/`, one module at a time, test file per module |
| Auth | **Last sprint (Sprint 11)** — modules use a dev shim until then |
| Phantom APIs | **Forbidden** — append to `api-issues.md` and disable UI path |

---

## V1 scope

V1 = a studio can run their business end-to-end. Money path: capture inquiry → convert lead → quote → sign → schedule → bill → collect → deliver photos.

### V1 sprints (in build order)

| # | Sprint | Why in V1 | Effort |
|---|---|---|---|
| **0** | **Foundation** | Required before any module | 3–4 days |
| **1** | **Leads** | Top of funnel | 3 days |
| **2** | **Inquiry** | Public capture | 2 days |
| **3** | **Clients** | Spine of bookings/invoices | 3 days |
| **4** | **Proposals** | Send quote | 3 days |
| **5** | **Contracts** | Formalize | 3 days |
| **6** | **Bookings** | Schedule shoot | 5 days |
| **7** | **Invoices** | GST billing | 4 days |
| **8** | **Payments** | Razorpay + record | 3 days |
| **9** | **Gallery** | Deliver photos | 5 days |
| **10** | **Dashboard** | KPI rollup (built last so data is real) | 3 days |
| **11** | **Auth** | Real Supabase, replace dev shim | 3–4 days |

**V1 total:** ≈ 40–44 working days (≈ 9 weeks solo).

### Out of V1 (V1.5 / V2)

Team management, full Settings, Addons, Analytics, Automations UI, Customer Portal, Admin panel, Notifications UI.

---

## Phantom API policy

1. Read `docs/api/<module>.md`, then `backend/studiodesk/app/api/v1/<module>/**/*.ts` to confirm contract.
2. Contract matches and works → bind.
3. Docs disagree with route file → trust route file, log to `api-issues.md`.
4. Route file missing → do NOT mock. Add to `api-issues.md`, disable UI path with tooltip "Coming soon — waiting on backend route X".
5. Route exists but broken → same as missing.

---

## Stack

**Core:** `react@19`, `react-dom@19`, `typescript@5.6`, `vite@6`, `@vitejs/plugin-react-swc`, `react-router-dom@7`
**Data:** `@tanstack/react-query@5`, `@supabase/supabase-js`, `@supabase/ssr`, `ky`
**UI:** `tailwindcss@4`, `@tailwindcss/vite`, `tailwindcss-animate`, `shadcn/ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
**Motion (restricted):** `motion@12` for in-app micro-interactions; Aceternity/Magic UI only under `(public)/` and `(auth)/`.
**Forms:** `react-hook-form@7`, `@hookform/resolvers`, `zod@3`, `react-number-format`, `input-otp`
**Tables/charts:** `@tanstack/react-table@8`, `@tanstack/react-virtual`, `recharts@2`, `@tremor/react`
**Interactions:** `cmdk`, `@dnd-kit/core`, `@dnd-kit/sortable`, `react-day-picker@9`, `embla-carousel-react`, `vaul`, `sonner`
**Dev:** `eslint`, `@typescript-eslint/*`, `prettier`, `prettier-plugin-tailwindcss`, `vitest`, `@testing-library/react`, `msw@2`, `playwright`

---

## Folder layout

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
├── .env.local
├── public/
├── testing/                       # per-module test files (fix-bugs format)
└── src/
    ├── main.tsx
    ├── app/
    │   ├── router.tsx
    │   ├── providers.tsx
    │   └── routes/
    │       ├── (auth)/             # login, signup, forgot-password — Sprint 11
    │       ├── (dashboard)/        # protected studio shell
    │       └── (public)/           # public inquiry form (no auth)
    ├── features/
    │   ├── leads/
    │   ├── inquiry/
    │   ├── clients/
    │   ├── proposals/
    │   ├── contracts/
    │   ├── bookings/
    │   ├── invoices/
    │   ├── payments/
    │   ├── gallery/
    │   └── dashboard/
    ├── components/
    │   ├── ui/                     # shadcn primitives
    │   ├── motion/                 # AuroraHero, GlassCard, NumberTicker
    │   ├── data/                   # DataTable, EmptyState, LoadingSkeleton, ErrorState
    │   ├── forms/                  # MoneyInput, DateInput, PhoneInput, GSTINInput, FormField
    │   ├── layout/                 # AppShell, Sidebar, TopBar, SlideOver
    │   └── kbar/                   # cmdk command palette
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts
    │   │   ├── queryKeys.ts
    │   │   └── endpoints/
    │   ├── auth/                   # devShim.ts (Sprint 0); supabase.ts + AuthProvider.tsx (Sprint 11)
    │   ├── formatters/
    │   ├── validations/            # mirrored Zod schemas
    │   ├── constants/              # routes.ts, enums.ts, palette.ts
    │   └── hooks/
    ├── types/
    └── styles/                     # globals.css, tokens.css
```

---

## Design tokens (locked)

```css
:root {
  --bg: 250 250 252;
  --fg: 15 23 42;
  --muted: 100 116 139;
  --border: 226 232 240;
  --card: 255 255 255;
  --glass: 255 255 255 / 0.72;

  --accent: 99 102 241;
  --accent-fg: 255 255 255;

  --success: 34 197 94;
  --warn: 234 179 8;
  --danger: 239 68 68;

  --aurora-1: 168 85 247;
  --aurora-2: 99 102 241;
  --aurora-3: 56 189 248;

  --radius-card: 12px;
  --radius-input: 8px;
  --radius-pill: 999px;
  --shadow-sm: 0 1px 2px 0 rgb(15 23 42 / 0.04);
  --shadow-md: 0 4px 12px -2px rgb(15 23 42 / 0.06);
  --shadow-glow: 0 0 0 3px rgb(99 102 241 / 0.18);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}

[data-theme='dark'] {
  --bg: 8 8 12;
  --fg: 248 250 252;
  --card: 23 23 28;
  --glass: 23 23 28 / 0.72;
  --border: 39 39 42;
}
```

---

## Motion language

| Surface | Animation | Duration |
|---|---|---|
| Route enter | opacity 0→1 + 4px Y | 220ms ease-out |
| Slide-over open | spring 350/32 | ~250ms |
| Toast appear | slide + fade | 180ms |
| Modal | scale 0.97→1 + opacity | 200ms |
| Hover lift on card | `y: -1px` | 120ms |
| KPI counter | `useMotionValue` ease-out | 1200ms |
| List reorder | Motion `layout` prop | spring |

Wrapped in `<MotionConfig reducedMotion="user">`.

---

## Low-click UX patterns (every module)

1. **Command palette (⌘K)** via cmdk
2. **Slide-over detail** — list stays visible
3. **Optimistic mutations** for status/payment/publish
4. **Undo toasts** for destructive actions (sonner.promise, 5s window)
5. **Inline edit** — Enter saves, Esc cancels
6. **Bulk actions** — multi-select rows; bottom action bar
7. **Smart defaults** — pre-fill last client/package/date
8. **URL-driven state** — filters/search/open ID in URL
9. **Per-list keyboard shortcuts** — `j/k` move, `Enter` open, `e` edit, `?` help

---

## Backend contracts (authoritative)

| File | Role |
|---|---|
| `backend/studiodesk/lib/response.ts` | Envelope shape → `src/types/api.ts` |
| `backend/studiodesk/types/index.ts` | Domain enums → `src/lib/constants/enums.ts` |
| `backend/studiodesk/lib/validations/*.schema.ts` | Zod schemas → `src/lib/validations/` |
| `backend/studiodesk/middleware.ts` | Auth + CORS (allows `credentials: 'include'`) |
| `backend/studiodesk/lib/formatters.ts` | `formatINR`, `paiseToRupees` → port |
| `docs/api/*.md` | Endpoint contracts — read before each module |
| `docs/seed/TEST_USERS.md` | Test users for dev-auth shim |

Confirmed envelope shape (from `lib/response.ts`):
- Success: `{ data: T, error: null }` (201/200/204)
- Error: `{ data: null, error: string, code: string }` (400+)
- Paginated: `{ data: T[], meta: { count, page, pageSize, totalPages }, error: null }`

---

## Verification per sprint

```bash
# Backend
cd backend/studiodesk && npm run dev   # :3000

# Frontend
cd frontend && npm run dev             # :5173

# Per-sprint quality gates
npm run typecheck
npm run lint
npm run test -- src/features/<module>
```

Manual: walk `frontend/testing/<module>.md`, flip 🔲 → ✅ / ❌ per numbered test.

---

## V1 cut acceptance (after Sprint 11)

- All 11 sprints sign-off complete
- All 11 test files green
- Playwright E2E: signup → inquiry → lead → client → proposal → contract → booking → invoice → payment → gallery → dashboard
- Lighthouse: perf ≥ 90 dashboard, a11y = 100
- Bundle: main < 200 KB gzip
- `prefers-reduced-motion` respected
- Mobile (375×667) tested
- `api-issues.md` reviewed: all V1-blocking rows resolved
- Anti-AI pre-commit checklist passes on every module
