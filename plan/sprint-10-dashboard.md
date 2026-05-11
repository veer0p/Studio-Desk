# Sprint 10 — Dashboard

**Status:** Done
**Started:** 2026-05-11
**Finished:** 2026-05-11

## Goal
Build the KPI dashboard — the one screen where data from all previous modules converges.

## API contracts verified
- [x] `GET /dashboard/overview` — `{ greeting, attention_items, this_month: MonthKPIs, upcoming_week }` ✅
- [x] `GET /dashboard/today` — `{ shoots: TodayShoot[] }` ✅
- [x] MonthKPIs revenue fields are pre-formatted Indian strings (e.g. "1,25,000.00") — must parse with `parseFloat(str.replace(/,/g, ''))`

## Build tasks
- [x] `src/features/dashboard/types.ts` — DashboardOverview, MonthKPIs, AttentionItem, WeekDay, TodayShoot, TeamMember
- [x] `src/lib/api/endpoints/dashboard.ts` — getDashboardOverview, getDashboardToday
- [x] `src/lib/api/queryKeys.ts` — dashboard.overview, dashboard.today keys
- [x] `src/features/dashboard/hooks.ts` — useDashboardOverview, useDashboardToday
- [x] `src/features/dashboard/DashboardPage.tsx`
  - AuroraHero greeting (dashboard's one allowed hero use)
  - KPI strip: 4 GlassCards with NumberTicker (INR formatted)
  - `parseFormattedINR()` helper to unwrap pre-formatted backend strings
  - `formatTime()` helper for HH:MM:SS → 12-hour with AM/PM
  - Today's shoots timeline section
  - Upcoming week days section
  - Attention items list
- [x] Router default: `/` → `/dashboard`
- [x] NavTree, CommandPalette — Dashboard enabled with sprint 10 badge

## Polish tasks
- [x] Aurora hero only on dashboard (one per route, hero zone only — rule #4)
- [x] NumberTicker parses pre-formatted INR strings correctly
- [x] Revenue displayed as INR with `₹` prefix
- [x] Team member avatars in today's shoot card
- [x] Empty state when no shoots today / no attention items

## Test file
- [x] `frontend/testing/dashboard.md` written — ~8 tests

## API issues found this sprint
None — both dashboard endpoints exist and return expected shape.

## Sign-off
- [ ] User walks dashboard tests
- [ ] User says "looks good, move on"
