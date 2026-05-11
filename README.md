# StudioDesk

All-in-one studio management platform for photographers — bookings, invoicing, galleries, client portals, and team management.

## Architecture

```
Studio-desk/
├── backend/studiodesk/   # Next.js 14 API (port 3001)
├── frontend/             # Vite + React SPA (port 5173)
└── infra/immich/         # Immich photo server (Docker, port 2283)
```

| Service | Stack | Port |
|---------|-------|------|
| Backend API | Next.js 14, Supabase, Zod | `3001` |
| Frontend | Vite, React, TailwindCSS, TanStack Query | `5173` |
| Immich | Docker Compose (server, ML, Postgres, Redis) | `2283` |
| Supabase | Hosted at supabase.co | — |

## Prerequisites

- **Node.js** 20+
- **Docker Desktop** (for Immich)
- **Supabase** project (hosted or self-hosted)

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repo-url> && cd Studio-desk
cd frontend && npm install && cd ..
cd backend/studiodesk && npm install && cd ../..
```

### 2. Set up Supabase

Create a Supabase project at [supabase.com](https://supabase.com), then run the migrations **in order** via the SQL Editor:

| # | File | Purpose |
|---|------|---------|
| 1 | `studiodesk_schema_v2.sql` | Full base schema (tables, types, RLS, functions) |
| 2 | `studiodesk_schema_v2_fixes.sql` | V2 patches (FKs, indexes, RLS fixes) |
| 3 | `20250317120000_studio_invitations_updated_at.sql` | Adds `updated_at` to `studio_invitations` |
| 4 | `000_disable_email_confirmation.sql` | Disables email confirmation in auth config |
| 5 | `001_add_immich_columns_and_fix_data.sql` | Immich columns, enum expansion, dedup |
| 6 | `20260412_add_2fa_secret.sql` | 2FA TOTP secret for platform admins |

Migrations are in `backend/studiodesk/supabase/migrations/`.

**Skip these** (superseded by v2): `20250101000001_initial_schema.sql`, `20250101000002_schema_fixes.sql`, `20250101000003_fix_rls_performance.sql`.

### 3. Create test users

In Supabase Dashboard > Authentication > Users, create:

| Email | Password | Role |
|-------|----------|------|
| `owner@test.com` | `Test@1234` | Studio Owner |
| `photographer@test.com` | `Test@1234` | Photographer |
| `editor@test.com` | `Test@1234` | Editor |
| `outsider@test.com` | `Test@1234` | Second Studio Owner |

Then run `seed.sql` followed by `20250401000000_seed_test_users.sql` in the SQL Editor.

### 4. Set up Immich (photo server)

```bash
cd infra/immich
bash setup.sh --update-backend-env
```

This auto-provisions:
- Immich server + ML + Postgres + Redis via Docker
- Admin account (`admin@studiodesk.local` / `Admin@StudioDesk1`)
- StudioDesk API key (auto-written to backend `.env` files)

Dashboard: [http://localhost:2283](http://localhost:2283)

### 5. Configure environment variables

Copy and fill in the backend env:

```bash
cp backend/studiodesk/.env backend/studiodesk/.env.local
```

Required variables:

```env
# Supabase (from project settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Immich (auto-set by setup.sh)
IMMICH_BASE_URL=http://localhost:2283
IMMICH_API_KEY=<generated key>

# Razorpay (use test keys or placeholders for dev)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_dummy
RAZORPAY_KEY_SECRET=dummy_secret
RAZORPAY_WEBHOOK_SECRET=dummy_webhook

# Communication
WHATSAPP_API_KEY=wa_placeholder
WHATSAPP_API_BASE_URL=https://api.interakt.ai

# Security
ENCRYPTION_KEY=<64-char hex string>
```

### 6. Start development servers

```bash
# Terminal 1 — Backend
cd backend/studiodesk && npx next dev -p 3001

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001/api/v1/ping](http://localhost:3001/api/v1/ping)

The Vite dev server proxies `/api/v1/*` to the backend automatically.

## Gallery Flow (Immich Integration)

1. **Create gallery** from a booking — creates an Immich album
2. **Upload photos** — files go to Immich, tracked in `gallery_photos`
3. **Face detection** — Immich ML clusters faces automatically
4. **Publish** — generates a share link via Immich
5. **Client portal** — clients view photos at `/gallery/<slug>`
6. **Selfie lookup** — clients upload a selfie to find their photos via face matching

## Project Structure

```
backend/studiodesk/
├── app/api/v1/          # Next.js API routes
├── lib/
│   ├── services/        # Business logic (gallery, auth, immich, etc.)
│   ├── repositories/    # Database queries
│   ├── supabase/        # Supabase client setup
│   └── validations/     # Zod schemas
├── supabase/migrations/ # SQL migrations
└── types/               # TypeScript types

frontend/
├── src/
│   ├── features/        # Feature modules (galleries, bookings, etc.)
│   ├── components/      # Shared UI components
│   ├── lib/api/         # API client and endpoints
│   └── lib/validations/ # Shared Zod schemas
└── vite.config.ts       # Dev server + proxy config

infra/immich/
├── docker-compose.yml   # Immich stack
├── .env                 # Docker env vars
└── setup.sh             # One-command auto-setup
```
