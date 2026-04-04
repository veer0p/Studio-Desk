# StudioDesk — Developer Rules

Last updated: [2026-04-04]
Reference files: FRONTEND_RULES.md, ARTISAN_UI.md

These rules are NON-NEGOTIABLE. Every page, every component,
every API call must follow them. No exceptions.

---

## 1. BEFORE YOU BUILD ANY NEW PAGE

Checklist — complete in this order:

  □ Read FRONTEND_RULES.md
  □ Read ARTISAN_UI.md
  □ Read this file (RULES.md)
  □ Identify: is this a server page or client page?
  □ Plan: what data does it need?
  □ Plan: which parts need Suspense boundaries?
  □ Plan: which parts use SWR vs server fetch?
  □ Create the skeleton component FIRST
  □ Create loading.tsx BEFORE page.tsx

---

## 2. FILE STRUCTURE FOR EVERY NEW PAGE

Every new route must have these files:

  app/(dashboard)/[route]/
    page.tsx          ← server component shell
    loading.tsx       ← skeleton shown during server render
    error.tsx         ← error boundary (see section 8)

  components/[route]/
    [Route]Shell.tsx  ← layout wrapper (toolbar, heading)
    [Route]Skeleton.tsx ← full page skeleton

Example for a new "Leads" page:
  app/(dashboard)/leads/
    page.tsx
    loading.tsx
    error.tsx
  components/leads/
    LeadsShell.tsx
    LeadsSkeleton.tsx
    LeadsList.tsx
    NewLeadDialog.tsx

---

## 3. SERVER vs CLIENT COMPONENTS

### Use Server Components (default) for:
  - Page shells (page.tsx)
  - Static layout (headers, sidebars)
  - Initial data fetch (one-time load)
  - SEO-important content

### Use Client Components ("use client") for:
  - Anything with useState, useEffect, useRef
  - Event handlers (onClick, onChange)
  - SWR data fetching
  - Drag and drop
  - Canvas, animations
  - URL state (useSearchParams, useRouter)
  - Charts (recharts requires browser)
  - Forms (react-hook-form)

### Rules:
  - NEVER add "use client" to page.tsx
  - NEVER fetch data with useEffect + fetch()
    Use SWR for all client-side data fetching
  - NEVER put "use client" at layout level
    Push it as far down the tree as possible
  - NEVER import a client component into a server
    component and pass async data — use Suspense instead

---

## 4. DATA FETCHING RULES

### Server-side (in async server components):
  - ALWAYS use Promise.all for multiple fetches
  - NEVER await sequentially
  - ALWAYS handle errors with try/catch
  - ALWAYS type the return value

  // ✅ Correct
  const [bookings, stats] = await Promise.all([
    getBookings(),
    getStats()
  ])

  // ❌ Wrong
  const bookings = await getBookings()
  const stats = await getStats()

### Client-side:
  - ALWAYS use SWR — never raw fetch in useEffect
  - ALWAYS show skeleton while isLoading = true
  - ALWAYS handle error state
  - Use null SWR key to conditionally skip fetch:
    useSWR(isActive ? "/api/endpoint" : null)

### API calls:
  - ALWAYS go through lib/api.ts
  - NEVER call fetch() directly in components
  - NEVER call Supabase directly in components
  - All API functions must be typed (no any)

---

## 5. LOADING STATES — NON-NEGOTIABLE

Every page and every data section MUST have a loading state.
Spinners alone are NOT acceptable.

### Rules:
  - Every route MUST have loading.tsx
  - Every loading.tsx MUST use a skeleton, not a spinner
  - Skeletons MUST match real layout (same grid, same heights)
  - Sections load independently — use Suspense boundaries
  - Never block an entire page on one slow data source
  - SWR components show skeleton when isLoading = true

### Suspense pattern (required for all new pages):

  // page.tsx (server component)
  import { Suspense } from "react"

  export default function NewPage() {
    return (
      <PageShell>
        <Suspense fallback={<SectionSkeleton />}>
          <SectionData />   {/* async server component */}
        </Suspense>
      </PageShell>
    )
  }

---

## 6. ERROR HANDLING

Every route must have error.tsx for graceful failure.

  // app/(dashboard)/[route]/error.tsx
  "use client"

  export default function Error({
    error,
    reset
  }: {
    error: Error
    reset: () => void
  }) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">
          Something went wrong loading this page.
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    )
  }

### API error handling in SWR:
  - 401 → redirect to /login (handled in SWRConfig)
  - 403 → show toast "You don't have permission"
  - 404 → show empty state, not error
  - 500 → show "Something went wrong, try again" toast
  - Network error → show "Check your connection"

### Never:
  - Show raw error messages to users
  - Show stack traces in production
  - Let a page crash with no error boundary
  - Silently swallow errors (always log + surface)

---

## 7. FORMS

Every form must follow this exact stack:
  react-hook-form + Zod + shadcn/ui inputs

### Rules:
  - Schema in lib/validations/[module].ts (not inline)
  - All fields have explicit labels (htmlFor linked)
  - Errors shown inline below each field
  - Error messages use role="alert"
  - Inputs + button disabled during submission
  - Button shows loading spinner during submission
  - Form-level error clears on first keystroke
  - On success: toast notification + close dialog/sheet
  - On error: show specific message, keep form open

### Never:
  - Use uncontrolled inputs without react-hook-form
  - Validate only on submit (validate on blur too)
  - Use any for form values
  - Store form state in URL (use local state for forms)

---

## 8. URL STATE

Use URL params for state that should:
  - Survive page refresh
  - Be shareable via link
  - Affect what data is fetched

Use local state (useState) for:
  - UI state (dialog open/closed)
  - Form values
  - Temporary selection state

### URL state rules:
  - Use nuqs or URLSearchParams — never manual string manipulation
  - Filter state → URL params
  - Active tab → URL param
  - Selected item ID → URL param
  - View toggle (list/grid/kanban) → URL param
  - Search query → URL param (debounced 300ms)

### Never put in URL:
  - Form values
  - Dialog open state
  - Hover state
  - Anything sensitive (IDs are fine, tokens are not)

---

## 9. TYPESCRIPT RULES

  - ZERO any types — ever
  - All functions have explicit return types
  - All API response types defined in types/api.ts
  - All props interfaces defined (not inlined for complex props)
  - Use unknown instead of any when type is truly unknown,
    then narrow with type guards
  - Run npx tsc --noEmit before every commit
    Must show 0 errors

---

## 10. STYLING RULES

  - shadcn/ui components only — no custom UI from scratch
  - Tailwind utility classes only — no inline styles
  - No hardcoded colors — use CSS variables:
      text-primary, bg-muted, border, text-muted-foreground
  - No hardcoded spacing numbers — use Tailwind scale
  - Dark mode: every component must work in both modes
  - Test dark mode before marking any component done

### Forbidden:
  style={{ color: "#333" }}        ← never
  style={{ marginTop: "12px" }}    ← never
  className="text-[#6366f1]"       ← never (use text-primary)
  className="mt-[12px]"            ← never (use mt-3)

---

## 11. ICONS

  - Lucide icons ONLY — no other icon library
  - Size: 16px (text), 20px (UI), 24px (prominent actions)
  - Color: inherit from parent text color
  - Never use emoji as icons in UI
  - Never use image files as icons

---

## 12. INDIA-SPECIFIC RULES

These apply to every page, every number, every date.

### Currency:
  Compact (KPI cards, summaries):
    < ₹1,000        → ₹850
    ₹1,000–₹99,999  → ₹85K
    ₹1L–₹99L        → ₹2.4L
    ₹1Cr+           → ₹1.2Cr

  Full (invoices, tables, forms):
    Indian comma format: ₹2,40,000
    NOT Western format:  ₹240,000  ← wrong

  Never show paise in UI: ₹2,40,000 not ₹2,40,000.00

### Dates:
  Display:  "27 March 2026"       ← always
  Short:    "27 Mar"              ← on chart axes
  Relative: "2h ago" / "Yesterday" / "3 Mar"
  Never:    "03/27/2026"          ← US format, forbidden
  Never:    "2026-03-27"          ← ISO, only in API/DB

### Phone numbers:
  Display:  +91 98765 43210
  WhatsApp: wa.me/919876543210    ← no + no spaces
  tel link: tel:+919876543210

### Placeholder data (in skeletons, examples, docs):
  Names:  Rohan Sharma, Priya Mehta, Amit Patel,
          Kavya Nair, Raj Desai, Sneha Joshi
  Cities: Surat, Ahmedabad, Mumbai, Vadodara, Pune
  Events: "Sharma Wedding", "Patel Engagement",
          "Mehta Birthday"
  Never:  John Smith, Jane Doe, john@example.com,
          New York, London

---

## 13. COMPONENT RULES

### Naming:
  Pages:      PascalCase, suffix Page (BookingsPage)
  Layouts:    PascalCase, suffix Shell (BookingsShell)
  Dialogs:    PascalCase, suffix Dialog (NewBookingDialog)
  Sheets:     PascalCase, suffix Sheet (EditClientSheet)
  Skeletons:  PascalCase, suffix Skeleton (BookingsSkeleton)
  Hooks:      camelCase, prefix use (useBookings)
  Utils:      camelCase (formatINR, formatDate)
  API funcs:  camelCase (getBookings, createBooking)

### File locations:
  app/              → routes only (page, layout, loading, error)
  components/       → all UI components by module
  lib/              → utilities, API functions, helpers
  lib/validations/  → all Zod schemas
  lib/api.ts        → studio API calls
  lib/portal-api.ts → portal API calls
  types/            → all TypeScript interfaces
  hooks/            → all custom hooks

### Props:
  Simple props (≤3): inline interface ok
  Complex props (4+): define named interface above component
  Children: always type as React.ReactNode
  Event handlers: always typed (not any)

---

## 14. PERFORMANCE RULES

### Data fetching:
  - Promise.all for all parallel server fetches
  - SWR for client-side with proper cache keys
  - Never fetch data that isn't shown on current view
  - Analytics: only fetch active tab's data

### Images:
  - Always use next/image (never <img>)
  - Always specify width + height or use fill + sizes
  - Gallery thumbnails: lazy load (default in next/image)
  - Avatar images: eager load (small, always visible)

### Bundle:
  - Dynamic import for heavy components:
    const HeavyChart = dynamic(() => import("./HeavyChart"))
  - recharts: always dynamic import
  - SignatureCanvas: always dynamic import
  - No library > 50KB added without discussion

### Route config:
  Dynamic pages (live data):
    export const dynamic = "force-dynamic"
  Stable pages (settings, packages):
    export const revalidate = 300
  Never cache:
    dashboard, bookings, finance, analytics

---

## 15. SECURITY RULES

  - Never store tokens in localStorage
  - Never store sensitive data in URL params
  - Never expose API keys in client components
  - All env vars with secrets: no NEXT_PUBLIC_ prefix
  - Portal session completely separate from studio session
  - Client can only see their own data (enforced in API)
  - Razorpay signature always verified server-side
  - OTP: expires 10 min, max 3 attempts, 15 min lockout

---

## 16. CHECKLIST FOR EVERY NEW PAGE

Before marking any page as done, verify:

  TypeScript:
  □ npx tsc --noEmit → 0 errors
  □ No any types
  □ All props typed

  Loading:
  □ loading.tsx exists with real skeleton
  □ Skeleton matches real layout
  □ No section shows blank while loading
  □ Suspense boundaries around slow sections

  Error handling:
  □ error.tsx exists
  □ API errors show user-friendly toast
  □ Empty state for all lists and charts

  Data fetching:
  □ Promise.all used for parallel fetches
  □ SWR used for client-side dynamic data
  □ No useEffect + fetch() anywhere

  Forms:
  □ react-hook-form + Zod used
  □ Schema in lib/validations/
  □ All fields have labels
  □ Errors shown inline
  □ Loading state on submit button

  UI:
  □ Works in light mode
  □ Works in dark mode
  □ Mobile layout tested at 390px
  □ No horizontal overflow on mobile
  □ All links use next/link (not <a>)

  India-specific:
  □ INR compact format in KPI cards
  □ INR full Indian format in tables/invoices
  □ Dates in "27 March 2026" format
  □ No US dates, no Western names in placeholders
  □ WhatsApp links in wa.me/91XXXXXXXXXX format

  Code quality:
  □ No inline styles
  □ No hardcoded colors
  □ Lucide icons only
  □ shadcn/ui components only
  □ API calls through lib/api.ts only

---

## 17. GIT RULES

  Branch naming:
    feature/[module]-[description]
    fix/[module]-[description]
    chore/[description]

  Commit messages:
    feat(bookings): add drag-to-stage kanban
    fix(finance): correct CGST calculation for intra-state
    chore(deps): update shadcn components

  Before every commit:
    □ npx tsc --noEmit → 0 errors
    □ npm run build → succeeds
    □ Test changed pages in browser

  Never commit:
    □ .env.local
    □ Console.log statements
    □ TODO comments without ticket reference
    □ Commented-out code blocks