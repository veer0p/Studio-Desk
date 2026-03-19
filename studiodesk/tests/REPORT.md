## StudioDesk API Test Report

**Date:** 2026-03-19  
**Database:** Supabase VPS (https://db.veer-vps.duckdns.org/)  
**Modules tested:** 1, 2  

### Summary

Integration tests live under `tests/integration/`. **You run DB steps and tests manually** (see `tests/RUNBOOK.md`).

| Suite | File | Tests (expected) | Passed | Failed |
|--------|------|-------------------|--------|--------|
| Studio Profile | `studio-profile.test.ts` | 22 | 22 | 0 |
| Onboarding | `studio-onboarding.test.ts` | 19 | 19 | 0 |
| Team | `team.test.ts` | 35 | 31 | 4 |
| Packages / Add-ons | `packages.test.ts` | 37 | 37 | 0 |
| Inquiry | `inquiry.test.ts` | 12 | 12 | 0 |
| Leads | `leads.test.ts` | 49 | 49 | 0 |
| Clients | `clients.test.ts` | 32 | 32 | 0 |
| RLS isolation | `rls-isolation.test.ts` | 10 | 10 | 0 |
| **Total** | | **216** | **212** | **4** |

**After you run tests:** fill in the **Passed** and **Failed** columns from the Vitest summary, and add a “Failed tests” section below if any failed.

---

### How to run and fill results

1. **Apply migration** — Run `supabase/migrations/20250317120000_studio_invitations_updated_at.sql` in your Supabase SQL Editor (or `npx supabase db push` if you use CLI).
2. **Seed** — `npm run db:seed`
3. **(Optional)** Verify counts in SQL Editor (see RUNBOOK.md).
4. **Run tests** — `npm run test:integration:verbose` (or tee to `test-output.txt`).
5. **Update this report** — Put the real Passed/Failed numbers in the table above; if there are failures, list them in “Failed tests” below.

---

### Failed tests (fill after a run)

*If any test failed, add one row per test:*

| Test name | Expected | Actual | Root cause | Fix applied |
|-----------|----------|--------|------------|-------------|
| 409 email already active member | 409 | 422 | Plan-limit check may run before "already member" check; or Studio A plan limit read as 1 | Pending |
| 201 valid invite → creates studio_invitations record | 201 | 422 | Same: 422 = plan limit reached (member count or plan max_team_members wrong for Studio A) | Pending |
| 201 resend existing pending invite → resent: true | 201 | 422 | Same 422 (plan limit) | Pending |
| expired invite → creates new token, resets expiry | token/expiry updated | token unchanged | Resend likely returns 422 so invite never updated; token in DB stays same | Pending |

---

### Edge cases covered by the suite

Auth (401/403), validation (400), conflicts (409), quotas (422), RLS 404s, pagination/search, GST math, masked bank fields, `Cache-Control`, invite resend/expiry, lead status transitions, convert-to-booking, inquiry rate limit with `X-Forwarded-For`.

### RLS isolation

`rls-isolation.test.ts` asserts Studio B (`outsider@test.com`) cannot read or mutate Studio A data.

### Known limitations

1. **`security_events_log.metadata`** — Stderr shows `Could not find the 'metadata' column of 'security_events_log' in the schema cache`; add a `metadata` column (e.g. `jsonb`) if you want security event logging.
2. **`studio_invitations.updated_at`** — Migration adds the column and trigger; apply it once on your VPS.
3. **Reachable Supabase** — Tests use `NEXT_PUBLIC_SUPABASE_URL`; the VPS must be reachable from the machine running tests.
4. **`subscription_plans.max_team_members`** — Seed and global-setup use starter 1, studio 3, agency 10.
5. **`studio_onboarding_events`** — Seed upserts with `onConflict: 'studio_id,step_number'`.
6. **Lead convert** — Booking insert omits DB-generated columns (`balance_amount`, `amount_pending`, `gst_total`, etc.).

### Fixes applied in code

- Migration: `studio_invitations.updated_at` + `fn_set_updated_at` trigger.
- Plan limits: seed and global-setup (1, 3, 10).
- Onboarding: upsert with `studio_id,step_number`.
- Lead convert: only non-generated columns in booking insert.
- Invite accept: auth user created with `password: generateSecureToken(16)`.

---

*When all 216 tests pass, fill Passed = 216, Failed = 0 and add: **All 216 tests passing. Ready for Module 3.***
