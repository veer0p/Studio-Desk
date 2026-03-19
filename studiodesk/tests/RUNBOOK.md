# Integration tests — manual runbook (VPS Supabase)

Use this when you run DB steps and tests yourself. Your Supabase is at **https://db.veer-vps.duckdns.org/**.

---

## 1. Apply migration (you do this manually)

Run the contents of **`supabase/migrations/20250317120000_studio_invitations_updated_at.sql`** in your Supabase SQL Editor (e.g. Dashboard → SQL Editor for your project at db.veer-vps.duckdns.org).

Or, if you use Supabase CLI against this project:

```bash
npx supabase db push
```

---

## 2. Seed the database

From project root:

```bash
npm run db:seed
```

(Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` pointing to your VPS.)

---

## 3. Verify seed counts (optional)

In Supabase SQL Editor, run:

```sql
SELECT COUNT(*) AS studios FROM studios;                    -- expect 2
SELECT COUNT(*) AS studio_members FROM studio_members;      -- expect 4
SELECT COUNT(*) AS clients FROM clients;                    -- expect 6
SELECT COUNT(*) AS leads FROM leads;                        -- expect 8
SELECT COUNT(*) AS service_packages FROM service_packages;  -- expect 4
SELECT COUNT(*) AS package_addons FROM package_addons;      -- expect 3
SELECT COUNT(*) AS studio_invitations FROM studio_invitations; -- expect 2
```

If any count is wrong, fix `supabase/seed.ts` and run **Step 2** again.

---

## 4. Run integration tests

From project root:

```bash
npm run test:integration:verbose
```

To save output to a file:

- **PowerShell:**  
  `npm run test:integration:verbose 2>&1 | Tee-Object -FilePath test-output.txt`
- **Git Bash / WSL:**  
  `npm run test:integration:verbose 2>&1 | tee test-output.txt`

---

## 5. Fill the report

After tests finish:

1. Open **`tests/REPORT.md`**.
2. In the results table, fill **Passed** and **Failed** from the test summary (e.g. `X passed, Y failed` per file).
3. If anything failed, add a short “Failed tests” section with: test name, expected vs actual, cause, and fix if applied.

---

## Fixes already applied in code

- **Fix 1:** Migration file adds `studio_invitations.updated_at` and trigger.
- **Fix 2:** `subscription_plans` seed and `global-setup.ts`: starter 1, studio 3, agency 10.
- **Fix 3:** `studio_onboarding_events` in seed uses `.upsert(..., { onConflict: 'studio_id,step_number' })`.
- **Fix 4:** `convertLeadToBooking` inserts only non-generated booking columns.
- **Fix 5:** `acceptInvitation` creates auth user with `password: generateSecureToken(16)`.
