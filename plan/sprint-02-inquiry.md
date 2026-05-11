# Sprint 02 — Inquiry (public form)

**Status:** Done
**Started:** 2026-05-11
**Finished:** —

## Goal
Ship the public inquiry page at `/inquiry?studio=<slug>`: AuroraHero, real form, Zod validation, success + error states, rate-limit handling. Submissions land in the Leads list automatically. Zero auth required — this is the URL studios share with potential clients.

## API contracts confirmed

- [x] `backend/studiodesk/app/api/v1/inquiry/route.ts` confirmed — `POST /api/v1/inquiry?studio=<slug>`
- [x] `backend/studiodesk/lib/validations/lead.schema.ts` — `inquiryFormSchema` confirmed
- [x] `backend/studiodesk/tests/integration/inquiry.test.ts` — rate limit, privacy, field behavior confirmed

### Shape (frozen)

**Request:** `POST /api/v1/inquiry?studio=<slug>`
```ts
{
  full_name: string            // min 2, max 200, required
  phone: string                // Indian mobile [6-9]\d{9}, required
  email?: string               // email, optional
  event_type?: EventType       // optional
  event_date?: string          // 'YYYY-MM-DD', optional (NOTE: event_date not event_date_approx)
  venue?: string               // max 200, optional
  budget_min?: string          // decimal-as-string, optional
  budget_max?: string          // decimal-as-string, optional
  message?: string             // max 1000, optional
  guest_count?: number         // int 1–10000, optional
}
```

**Response:** `201 { data: { lead_id: string, message: string } }`
**400:** Validation error
**404:** Studio slug not found
**429:** Rate limited (5/hour per IP)

### Non-obvious backend behavior
- `?studio=<slug>` query param is **required** — returns 400 if missing
- Rate limit: 5 submissions per IP per hour (returns 429)
- Existing client by phone → reused (no duplicate client created)
- HTML in `message` field is stripped server-side
- Response never exposes `studio_id` — only `lead_id` returned

## 2.1 — Types + API endpoint
- [x] `src/lib/validations/inquiry.schema.ts` — Zod mirror of `inquiryFormSchema`
- [x] `src/lib/api/endpoints/inquiry.ts` — `submitInquiry(studioSlug, data)` using raw fetch (no auth cookie needed)

## 2.2 — InquiryPage
- [x] `src/features/inquiry/InquiryPage.tsx` replaces `InquiryPlaceholder`
- [x] `AuroraHero` wraps the full page (public route — aurora allowed)
- [x] Studio name derived from `?studio=` slug (formatted) or falls back to dev default
- [x] Split layout: hero copy left (`lg:`) / glass form card right; single-column on `<lg`
- [x] Form fields: full_name*, phone*, email, event_type, event_date, venue, budget (min/max pair), message, guest_count
- [x] RHF + Zod — inline errors, real Indian placeholder values
- [x] Success state: replaces form with confirmation card + "back to form" link
- [x] Error handling: 404 → studio not found page, 429 → rate limit message, 500 → generic retry
- [x] Router updated to use `InquiryPage`

## Polish gates
- [x] No marketing prose in the form copy — factual ("We'll reply within 24 hours")
- [x] Touch targets ≥ 44px on mobile
- [x] No horizontal scroll at 375×667
- [x] `prefers-reduced-motion` respected (via AuroraHero + MotionConfig)
- [x] Form stacks on `<lg`, two columns for budget fields on `sm+`

## Test file
- [x] `frontend/testing/inquiry.md` — 8 tests

## Sign-off
- [ ] User says "Sprint 2 looks good, start Sprint 3"
