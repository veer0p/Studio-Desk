# Test Users Seed — Documentation

## Overview

This document covers the production-grade seed mechanism for creating 4 test users in the StudioDesk application.

## Test Users Summary

| Email | Password | Role | Studio | Auth UUID |
|-------|----------|------|--------|-----------|
| owner@test.com | Test@1234 | owner | XYZ Photography (Studio A) | `b0000001-0001-4000-8000-000000000001` |
| photographer@test.com | Test@1234 | photographer | XYZ Photography (Studio A) | `b0000001-0001-4000-8000-000000000002` |
| editor@test.com | Test@1234 | editor | XYZ Photography (Studio A) | `b0000001-0001-4000-8000-000000000003` |
| outsider@test.com | Test@1234 | owner | ABC Clicks (Studio B) | `b0000001-0001-4000-8000-000000000004` |

## Schema Analysis

### 1. Supabase Auth (`auth.users`)

- **Managed by**: Supabase GoTrue auth service
- **Password hashing**: bcrypt (handled internally by Supabase — never stored in plaintext by application code)
- **Key fields**: `id` (UUID), `email` (unique), `encrypted_password`, `email_confirmed_at`, `created_at`
- **No direct INSERT**: Users are created via Admin API (`supabase.auth.admin.createUser()`)

### 2. Studio Members (`public.studio_members`)

```sql
Column           | Type                        | Constraints
-----------------+-----------------------------+----------------------------------
id               | UUID                        | PRIMARY KEY
studio_id        | UUID                        | FK → studios(id) ON DELETE CASCADE
user_id          | UUID                        | FK → auth.users(id) ON DELETE CASCADE
role             | user_role (ENUM)            | NOT NULL — values: owner, photographer, videographer, editor, assistant
display_name     | TEXT                        | NOT NULL
phone            | TEXT                        | nullable
whatsapp         | TEXT                        | nullable
specialization   | TEXT[]                      | nullable array
is_active        | BOOLEAN                     | NOT NULL DEFAULT true
accepted_at      | TIMESTAMPTZ                 | nullable
created_at       | TIMESTAMPTZ                 | NOT NULL DEFAULT NOW()
```

**Unique constraint**: `UNIQUE(studio_id, user_id)`

### 3. Role System

- Roles are PostgreSQL ENUM type `user_role` with values: `'owner', 'photographer', 'videographer', 'editor', 'assistant'`
- Stored directly in `studio_members.role` column (denormalized — no separate role table)
- Fine-grained permissions handled by `permissions`, `role_permissions`, and `member_permission_overrides` tables (v2 schema)

## Idempotency Strategy

### TypeScript Seed (`seed-test-users.ts`)

1. **Auth users**: `ensureAuthUser()` calls `listUsers()` first → only creates if email not found
2. **Studio members**: Uses `upsert()` with `onConflict: 'id'` → updates existing records, no duplicates
3. **Safe to run multiple times** — produces identical state each run

### SQL Migration (`20250401000000_seed_test_users.sql`)

1. Uses `INSERT ... ON CONFLICT (id) DO UPDATE SET ...` — standard PostgreSQL upsert
2. Subqueries resolve `auth.users.id` by email at execution time
3. Safe to re-run — existing records are updated, not duplicated

## Password Handling

- **Method**: Supabase GoTrue handles bcrypt hashing internally
- **Application code NEVER sees/stores hashed passwords** — plaintext is passed to Admin API, which hashes before storage
- **Algorithm**: bcrypt (managed by GoTrue, not configurable)
- **All test users password**: `Test@1234`

## How to Run

### Option A: TypeScript Seed (Recommended — handles both Auth + Members)

```bash
cd backend/studiodesk

# Ensure studios exist first (run main seed if needed)
npm run db:seed

# Seed only the test users
npm run db:seed:users
```

### Option B: SQL Migration (Requires manual Auth user creation)

```bash
cd backend/studiodesk

# 1. Create auth users in Supabase Dashboard:
#    Authentication → Users → Add User
#    (or use the TypeScript seed above which does this automatically)

# 2. Run the SQL migration
npx supabase db push
# OR in Supabase Dashboard → SQL Editor, paste contents of:
# supabase/migrations/20250401000000_seed_test_users.sql
```

### Option C: Full Reset (Dev/Staging)

```bash
# Wipes and re-seeds everything
npm run db:reset:seed
```

## Verification Steps

### 1. Verify Auth Users

```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email IN (
  'owner@test.com',
  'photographer@test.com',
  'editor@test.com',
  'outsider@test.com'
)
ORDER BY email;
```

### 2. Verify Studio Members

```sql
SELECT
  u.email,
  sm.role,
  sm.display_name,
  sm.is_active,
  sm.accepted_at,
  s.name AS studio_name,
  sm.specialization
FROM public.studio_members sm
JOIN auth.users u ON u.id = sm.user_id
JOIN public.studios s ON s.id = sm.studio_id
WHERE sm.id IN (
  'c0000001-0001-4000-8000-000000000001',
  'c0000001-0001-4000-8000-000000000002',
  'c0000001-0001-4000-8000-000000000003',
  'c0000001-0001-4000-8000-000000000004'
)
ORDER BY sm.id;
```

### 3. Verify Password (Login Test)

Test login via Supabase API:

```bash
curl -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{"email": "owner@test.com", "password": "Test@1234"}'
```

Should return a valid JWT session.

### 4. TypeScript Seed Verification

The TypeScript seed automatically prints a verification table after execution:

```
Test users successfully seeded:
────────────────────────────────────────────────────────────────────
Email                        | Role           | Studio               | Active
────────────────────────────────────────────────────────────────────
owner@test.com               | owner          | XYZ Photography      | true
photographer@test.com        | photographer   | XYZ Photography      | true
editor@test.com              | editor         | XYZ Photography      | true
outsider@test.com            | owner          | ABC Clicks           | true
────────────────────────────────────────────────────────────────────
```

## Rollback Strategy

### Rollback TypeScript Seed

```sql
-- Delete studio_members records
DELETE FROM public.studio_members
WHERE id IN (
  'c0000001-0001-4000-8000-000000000001',
  'c0000001-0001-4000-8000-000000000002',
  'c0000001-0001-4000-8000-000000000003',
  'c0000001-0001-4000-8000-000000000004'
);

-- Delete auth users (requires service role key)
-- Via Supabase Dashboard: Authentication → Users → Delete each user
-- Or via Admin API:
-- supabase.auth.admin.deleteUser('b0000001-0001-4000-8000-000000000001')
-- ... repeat for each user
```

### Rollback SQL Migration

```sql
-- Reverse of 20250401000000_seed_test_users.sql
DELETE FROM public.studio_members
WHERE id IN (
  'c0000001-0001-4000-8000-000000000001',
  'c0000001-0001-4000-8000-000000000002',
  'c0000001-0001-4000-8000-000000000003',
  'c0000001-0001-4000-8000-000000000004'
);
```

**Note**: Auth users must be deleted separately via Dashboard or Admin API — they cannot be deleted by SQL (Supabase restricts direct `auth.users` modification).

### Create Down Migration (Optional)

If you want a formal down migration:

```sql
-- supabase/migrations/20250401000001_down_seed_test_users.sql
DELETE FROM public.studio_members
WHERE id IN (
  'c0000001-0001-4000-8000-000000000001',
  'c0000001-0001-4000-8000-000000000002',
  'c0000001-0001-4000-8000-000000000003',
  'c0000001-0001-4000-8000-000000000004'
);
```

## Environment Compatibility

### Local Development

```bash
# Default: uses http://127.0.0.1:54321 and default service role key
npm run db:seed:users
```

### Staging/Production

```bash
# Set environment variables:
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Then run:
npm run db:seed:users
```

### `.env.local` Variables

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## File Locations

```
backend/studiodesk/
├── supabase/
│   ├── migrations/
│   │   └── 20250401000000_seed_test_users.sql   ← SQL migration (members only)
│   ├── seed.ts                                   ← Main seed (includes these users)
│   ├── seed-ids.ts                               ← Deterministic UUIDs
│   └── seed-test-users.ts                        ← TypeScript seed (Auth + Members)
├── package.json                                  ← Added "db:seed:users" script
└── docs/
    └── TEST_USERS_SEED.md                        ← This file
```

## Relationship to Main Seed (`seed.ts`)

The existing `seed.ts` already creates these 4 users as part of the full database seed. The dedicated `seed-test-users.ts` file provides:

1. **Independent execution** — can run without re-seeding all other data
2. **Focused scope** — only users, easier to debug/rollback
3. **Safe idempotency** — will not conflict if main seed already ran
4. **Faster execution** — no need to re-insert studios, packages, clients, etc.

**Use cases**:
- Quick setup after `supabase db reset` without full seed
- CI/CD pipelines that need only test users
- Developer environments where main seed data is not needed
- Testing auth/user workflows in isolation
