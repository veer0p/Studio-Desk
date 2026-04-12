# StudioDesk — Consolidated Documentation

**Last Updated**: 2026-04-12

All project knowledge files consolidated from 7 scattered locations into this single `docs/` folder.

## Structure

```
docs/
├── README.md                      ← You are here
├── PROJECT_README.md              ← Project overview, tech stack, getting started
├── BACKEND_RULES.md               ← 24-section backend API development rules
├── QWEN.md                        ← Frontend dev rules (UX-first, Next.js best practices)
├── PLAN.md                        ← Frontend API binding plan (module-by-module)
├── IMPLEMENTATION_PLAN.md         ← 7-stage implementation plan
├── IMPLEMENTATION_STATUS.md       ← Current status of all 7 stages
├── DECISION_LOG.md                ← Decision tracking log
├── FRONTEND_AUDIT.md              ← Frontend completeness audit (33 items)
├── AGENTS.md                      ← Frontend agent rules
├── CLAUDE.md                      ← Claude-specific rules
├── api/                           ← 18 API documentation files
│   ├── README.md                  ← API index
│   ├── auth.md
│   ├── bookings.md
│   ├── clients.md
│   ├── gallery.md
│   ├── invoices.md
│   ├── leads.md
│   ├── team.md
│   ├── assignments.md
│   ├── automations.md
│   ├── contracts.md
│   ├── dashboard.md
│   ├── packages.md
│   ├── payments.md
│   ├── proposals.md
│   ├── settings.md
│   ├── studio.md
│   └── webhooks.md
└── seed/
    └── TEST_USERS.md              ← Test user credentials and seed instructions
```

## What Was Consolidated From

| Source Location | Files Moved |
|---|---|
| Project root: `plan.md`, `IMPLEMENTATION_*.md`, `DECISION_LOG.md`, `QWEN.md` | 5 files |
| `backend/Backend_rules.md` | 1 file |
| `backend/studiodesk/README.md` | 1 file (→ `PROJECT_README.md`) |
| `backend/studiodesk/docs/api/*.md` | 18 files |
| `backend/studiodesk/docs/TEST_USERS_SEED.md` | 1 file (→ `seed/TEST_USERS.md`) |
| `frontend/studiodesk-web/AGENTS.md`, `CLAUDE.md` | 2 files |
| `project_ai_logs/2026-04-09_frontend-completeness-audit.md` | 1 file |

## Related: `.ai.md` Knowledge Files

This `docs/` folder contains **human-written documentation** (plans, rules, API specs, audit reports).

The **`.ai.md`** files scattered throughout the codebase serve a different purpose — they are **AI-agent-readable knowledge files** for the Documentation Engine. Each code folder has its own `.ai.md` that describes:
- Exported functions, types, and schemas
- Call relationships (Calls To / Called By)
- Data schemas and API contracts

There are **66 `.ai.md` files** across the codebase covering all major code folders.

## Quick Links

| Need | File |
|---|---|
| Understand the architecture | `../INDEX.md` (root) |
| Get started locally | `PROJECT_README.md` |
| Backend development rules | `BACKEND_RULES.md` |
| Frontend development rules | `../QWEN.md` (root) |
| API endpoint reference | `api/README.md` |
| Implementation progress | `IMPLEMENTATION_STATUS.md` |
| What's next | `PLAN.md` |
| Test user credentials | `seed/TEST_USERS.md` |
