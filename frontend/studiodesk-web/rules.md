# StudioDesk — Frontend Rules
> Attach this file to every frontend prompt (Gemini, Cursor, Windsurf, Claude, any AI agent).
> This is the single source of truth for all UI development decisions.
> Last updated: 2025

---

## 1. Project Identity

**Product:** StudioDesk — India's first full-stack SaaS for event photography and videography studios.
**Users:** Indian studio owners (28–45 yrs), photographers, videographers, editors. Non-technical. Time-poor. Mobile-first.
**Core pain:** They currently manage everything via WhatsApp + Excel + Google Drive. We replace all three.
**Emotional goal:** Open the app and feel in control. Like a clean desk on a Monday morning.
**Performance goal:** Every page must feel instant. No waiting. No jank. No layout shift.

---

## 2. Tech Stack (exact — never deviate)

| Layer | Choice | Banned Alternative |
|---|---|---|
| Framework | Next.js 15 (App Router) | Pages Router |
| Language | TypeScript strict mode | JavaScript, `any` type |
| Styling | Tailwind CSS only | inline styles, CSS modules, styled-components |
| Components | Radix UI primitives | MUI, Chakra, Ant Design |
| Icons | lucide-react only | Font Awesome, Heroicons, react-icons |
| Data fetching | SWR (client) + Server Components (server) | React Query, Redux, Axios |
| Auth | @supabase/ssr | @supabase/auth-helpers-nextjs (deprecated) |
| Fonts | next/font/google | `<link>` tags, @import in CSS |
| Animations | CSS transitions only | framer-motion, GSAP, react-spring |
| Date utils | Native Intl API | moment.js, date-fns |
| Class merging | cn() from @/lib/cn | direct string concatenation |
| Forms | react-hook-form + Zod | Formik, controlled inputs |
| Charts | recharts | Chart.js, D3, Victory |
| Toast | sonner | react-toastify, react-hot-toast |
| Theme | next-themes | manual localStorage |

**Never install:** lodash, moment, axios, redux, zustand, framer-motion, @tanstack/react-query, styled-components, emotion

---

## 3. Performance Rules (non-negotiable)

**Server Components are default. Client Components are the exception.**

```tsx
// ✅ Server Component — no directive needed
export default async function BookingsPage() {
  const bookings = await fetchBookings() // direct fetch, no client JS
  return <BookingList bookings={bookings} />
}

// ✅ Client Component — only when needed
'use client'
export function BookingCard({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false) // needs interactivity
}

// ❌ Never make a page Client Component just for convenience
'use client'
export default function BookingsPage() { ... }
```

**When to use `'use client'`:** useState, useEffect, event handlers (onClick, onChange), browser APIs, SWR hooks, real-time subscriptions. Nothing else.

**Image rules:**
```tsx
// ✅ Always next/image
import Image from 'next/image'
<Image src={url} alt={alt} width={400} height={300} />

// ❌ Never raw img tag
<img src={url} />
```

**Font loading:**
```tsx
// ✅ next/font/google — zero layout shift
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

// ❌ Never link tags or CSS @import
```

**Bundle rules:**
- Dynamic import heavy components (recharts, modals):
  ```tsx
  const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
    ssr: false,
    loading: () => <ChartSkeleton />
  })
  ```
- Never import entire icon libraries — named imports only:
  ```tsx
  // ✅
  import { Calendar, Users, Receipt } from 'lucide-react'
  // ❌
  import * as Icons from 'lucide-react'
  ```

**Render optimization:**
- Skeleton loaders on EVERY data-dependent section
- No blank white flashes — ever
- `suspense` boundaries around async Server Components
- `loading.tsx` files in every route segment

---

## 4. Design System

### 4.1 Color Tokens

```css
/* Light Mode */
--sidebar:           #0D4F4F;  /* Deep warm teal — NEVER changes in dark mode */
--sidebar-fg:        #ffffff;
--sidebar-muted:     rgba(255,255,255,0.5);
--sidebar-active:    rgba(255,255,255,0.15);
--background:        #F9FAFB;
--foreground:        #111827;
--card:              #ffffff;
--card-foreground:   #111827;
--border:            #E5E7EB;
--muted:             #F3F4F6;
--muted-foreground:  #6B7280;
--primary:           #0EA5E9;   /* Sky blue — actions, links, active states */
--primary-hover:     #0284C7;
--success:           #059669;   /* Paid, delivered, signed */
--success-bg:        #ECFDF5;
--warning:           #D97706;   /* Pending, due soon */
--warning-bg:        #FFFBEB;
--danger:            #DC2626;   /* Overdue, error, critical */
--danger-bg:         #FEF2F2;
--whatsapp:          #25D366;   /* WhatsApp buttons — always this green */

/* Dark Mode */
--background:        #0A0F0F;
--foreground:        #F9FAFB;
--card:              #111B1B;
--card-foreground:   #F9FAFB;
--border:            #1F2F2F;
--muted:             #1A2525;
--muted-foreground:  #9CA3AF;
/* Sidebar #0D4F4F — UNCHANGED in dark mode */
```

### 4.2 Status Badge Colors

Apply consistently on EVERY screen. Never invent new colors.

```typescript
export const STATUS_COLORS = {
  // Booking pipeline
  new_lead:         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  contacted:        'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  proposal_sent:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  contract_signed:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  advance_paid:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  shoot_scheduled:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  delivered:        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  closed:           'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  lost:             'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  // Invoice / payment
  draft:            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  sent:             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  partially_paid:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  paid:             'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  overdue:          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  cancelled:        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  // Contract
  signed:           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  // Gallery
  published:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  processing:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
} as const
```

### 4.3 Typography Scale

```
Display (₹ amounts):   text-3xl font-bold tabular-nums
Page title:            text-xl font-semibold tracking-tight
Section title:         text-base font-semibold
Card title:            text-sm font-semibold
Body:                  text-sm font-normal
Supporting:            text-xs text-muted-foreground
Label (uppercase):     text-xs font-medium uppercase tracking-widest text-muted-foreground
Mono (inv numbers):    text-xs font-mono text-muted-foreground
```

### 4.4 Spacing & Layout

```
Cards:              p-5 rounded-2xl border bg-card shadow-sm
Card hover:         hover:shadow-md transition-shadow duration-150
Sections gap:       gap-6
Cards grid gap:     gap-4
Inner card gap:     gap-3
Sidebar width:      w-16 (64px) — fixed, never expands
Header height:      h-14 (56px) — sticky
Content offset:     ml-16 pt-14
Content padding:    p-6 (desktop) p-4 (mobile)
Mobile bottom nav:  h-16 pb-safe
Max page width:     max-w-5xl mx-auto (dashboard, settings)
```

### 4.5 Shadows

```
Card default:   shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
Card hover:     shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.05)]
Modal:          shadow-[0_20px_60px_rgba(0,0,0,0.15)]
Sidebar:        shadow-[1px_0_0_0_rgba(0,0,0,0.08)]
```

### 4.6 Transitions

```
Color transitions:  transition-colors duration-150
Shadow transitions: transition-shadow duration-150
Transform:          transition-transform duration-150
All interactive:    transition-all duration-150

/* Apply to html element for theme switching */
html { transition: background-color 0.2s, color 0.2s; }
```

---

## 5. Component Rules

**File size:** Max 200 lines per file. Split if exceeded.
**One component per file.** No barrel exports from single files.
**Props:** Always typed with TypeScript interface. No prop spreading on DOM elements.
**Default exports** for pages. **Named exports** for components.

```tsx
// ✅ Correct component structure
interface BookingCardProps {
  booking: BookingSummary
  onStatusChange?: (status: string) => void
}

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  return (...)
}

// ❌ Never
export default function ({ ...props }: any) { ... }
```

**cn() for all class merging:**
```tsx
// ✅
import { cn } from '@/lib/cn'
<div className={cn('base-classes', isActive && 'active-class', className)} />

// ❌
<div className={`base-classes ${isActive ? 'active-class' : ''}`} />
```

**Folder structure for components:**
```
components/
  ui/           Primitive: Button, Badge, Card, Input, etc.
  layout/       Sidebar, Header, BottomNav, PageWrapper
  shared/       StatusBadge, EmptyState, Skeleton, AmountDisplay
  bookings/     BookingCard, BookingKanban, BookingSlideOver
  clients/      ClientCard, ClientList
  finance/      InvoiceRow, PaymentRecord
  gallery/      GalleryCard, FaceCluster
  dashboard/    AttentionItem, ShootCard, StatCard
  charts/       RevenueChart, FunnelChart (lazy loaded)
  forms/        All form components
```

---

## 6. Data Fetching Rules

**Server Components — fetch directly:**
```tsx
// ✅ In a Server Component
export default async function BookingsPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
    {
      headers: { Cookie: cookies().toString() },
      next: { revalidate: 0 }, // no cache for private data
    }
  )
  const { data } = await res.json()
  return <BookingList bookings={data} />
}
```

**Client Components — use SWR:**
```tsx
// ✅ In a Client Component that needs real-time updates
'use client'
import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(r => r.data)

export function BookingStatus({ id }: { id: string }) {
  const { data, isLoading } = useSWR(
    `/api/v1/bookings/${id}`,
    fetcher,
    { refreshInterval: 0 }
  )
  if (isLoading) return <Skeleton />
  return <StatusBadge status={data.status} />
}
```

**Error handling — always:**
```tsx
if (error) return <ErrorState message={error.message} />
if (isLoading) return <ComponentSkeleton />
if (!data) return <EmptyState ... />
return <ActualComponent data={data} />
```

**API base URL:**
```typescript
const API = process.env.NEXT_PUBLIC_API_URL // http://localhost:3000/api/v1
```

**Never fetch in useEffect.** Use SWR or Server Components.

---

## 7. Indian Formatting Rules (mandatory everywhere)

```typescript
// ✅ INR full format
formatINR(240000) → '₹2,40,000.00'   // Indian numbering: lakhs, crores

// ✅ INR compact (use in cards, dashboards)
formatINRCompact(240000) → '₹2.4L'
formatINRCompact(50000)  → '₹50K'
formatINRCompact(500)    → '₹500'

// ✅ Dates (ALWAYS DD MMM YYYY, IST timezone)
formatDate('2025-11-15') → '15 Nov 2025'

// ✅ Relative dates (use on cards and lists)
formatDateRelative('2025-03-20') → 'In 5 days'
formatDateRelative('2025-03-10') → '5 days ago'
formatDateRelative('2025-03-15') → 'Today'

// ✅ WhatsApp phone (always +91 prefix internally)
formatPhone('9876543210') → '+919876543210'

// ✅ Event types (Indian wedding events included)
EVENT_TYPES = [
  { value: 'wedding',     label: 'Wedding' },
  { value: 'pre_wedding', label: 'Pre-Wedding' },
  { value: 'engagement',  label: 'Engagement' },
  { value: 'mehendi',     label: 'Mehendi' },
  { value: 'sangeet',     label: 'Sangeet' },
  { value: 'haldi',       label: 'Haldi' },
  { value: 'portrait',    label: 'Portrait' },
  { value: 'birthday',    label: 'Birthday' },
  { value: 'corporate',   label: 'Corporate' },
  { value: 'maternity',   label: 'Maternity' },
  { value: 'newborn',     label: 'Newborn' },
  { value: 'product',     label: 'Product' },
  { value: 'other',       label: 'Other' },
]

// ❌ Never
new Date().toLocaleDateString() // wrong locale
'$' + amount                    // wrong currency
MM/DD/YYYY                      // American format
```

---

## 8. Layout Rules

### Sidebar (64px, always `#0D4F4F`)
```
Structure (top to bottom):
  Logo mark (camera icon, white, 22px)
  ── divider ──
  Nav icons (6 items):
    LayoutDashboard → /dashboard  "Dashboard"
    CalendarDays    → /bookings   "Bookings"
    Users           → /clients    "Clients"
    Receipt         → /finance    "Finance"
    Image           → /gallery    "Gallery"
    Users2          → /team       "Team"
  ── spacer (flex-1) ──
  BarChart2         → /analytics  "Analytics"
  Settings          → /settings   "Settings"
  ── divider ──
  User avatar (32px circle, initials)

Active state:  bg-white/15 rounded-xl text-white
Inactive:      text-white/50 hover:bg-white/10 hover:text-white
Tooltip:       right side, appears on hover, 150ms delay
Mobile:        HIDDEN (replaced by bottom nav)
```

### Header (56px, sticky)
```
Left:   Page title (text-lg font-semibold)
Center: Global search (rounded-full, w-64)
Right:  + New (dropdown) | Bell | Theme toggle | Avatar
```

### Bottom Navigation (mobile only, below md)
```
4 items: Dashboard | Bookings | Finance | Gallery
Active: text-[#0EA5E9]
Height: h-16 + safe-area-inset-bottom
```

### Breakpoints
```
Mobile:   < 768px   Sidebar hidden, bottom nav visible
Tablet:   768px+    Sidebar visible, content ml-16
Desktop:  1024px+   Full layout, kanban, multi-col grids
Large:    1280px+   Wider analytics, 4-col stats
```

---

## 9. UI Conventions (always follow)

### Skeleton Loaders
Every data section shows skeleton before content loads.
Match exact height and layout of real content.
Never show blank white space.

```tsx
// ✅ Pattern
if (isLoading) return <BookingCardSkeleton />
return <BookingCard booking={data} />
```

### Empty States
Never a blank list. Always: icon + title + description + CTA.
```tsx
// ✅
<EmptyState
  icon={Calendar}
  title="No bookings yet"
  description="Create your first booking to get started"
  action={{ label: 'New Booking', onClick: handleCreate }}
/>
```

### Loading States on Buttons
All async actions show spinner while loading.
```tsx
<Button disabled={isPending}>
  {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
  {isPending ? 'Saving...' : 'Save Changes'}
</Button>
```

### Toast Notifications
Use sonner. Always show result of async actions.
```tsx
// ✅
toast.success('Invoice sent successfully')
toast.error('Failed to send invoice. Check email address.')
// Never show raw error messages from API
```

### WhatsApp Button
```tsx
// Always this exact green. Recognizable worldwide.
<button className="bg-[#25D366] text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
  <MessageCircle className="w-3.5 h-3.5" />
  WhatsApp
</button>
```

### Amount Display
```tsx
// Large display (stat cards)
<span className="text-3xl font-bold tabular-nums text-emerald-600">
  ₹2.4L
</span>

// Inline (tables, cards)
<span className="text-sm font-semibold tabular-nums text-danger">
  ₹59,500 overdue
</span>
```

### Relative Dates on Cards
```tsx
// ✅ Shows urgency immediately
<span className="text-xs text-danger font-medium">5 days overdue</span>
<span className="text-xs text-warning font-medium">Due in 3 days</span>
<span className="text-xs text-muted-foreground">15 Nov 2025</span>
```

---

## 10. Page-by-Page Component Map

### /login
AuthCard, EmailInput, PasswordInput, SubmitButton, ForgotPasswordLink

### /signup
AuthCard, StudioNameInput, EmailInput, PasswordInput, SubmitButton

### /onboarding
ProgressDots (5 steps), StepCard, StepNavigation (Skip + Continue)
Steps: BasicInfo | BusinessDetails | PaymentSetup | InquiryForm | FirstPackage

### /dashboard
GreetingHeader, TodayShootsRow (horizontal scroll),
AttentionList (max 5 items), MonthStatsRow (3 cards),
UpcomingWeekTimeline (7-day bar + shoot list)

### /analytics
RevenueChart (lazy), BookingFunnelChart (lazy),
EventTypeDonut (lazy), TeamPerformanceTable, TopPackagesTable
All charts: dynamic import with ChartSkeleton fallback

### /bookings
FilterBar, KanbanBoard (desktop) | FocusView (mobile),
BookingCard (per column), BookingSlideOver (6 tabs)
SlideOver tabs: Overview | Proposal | Contract | Invoice | Gallery | Activity

### /bookings/:id
Full page version of slide-over on mobile.
Same 6 tabs. Breadcrumb navigation.

### /clients
ClientSearch, ClientStatsRow (3 cards), ClientList, ClientCard

### /clients/:id
ClientHeader, ClientBookingHistory, ClientStatsCard

### /finance
FinanceBanner (dark teal, 3 stats), InvoiceTabBar,
InvoiceList, InvoiceRow (with inline actions)

### /gallery
GalleryTopBar, GalleryGrid (3 cols desktop, 1 col mobile),
GalleryCard (cover + status + actions)

### /gallery/:id
GalleryHeader, UploadZone, UploadProgress,
FaceClusterGrid, PublishPanel, ShareCard (QR + link)

### /team
TeamTabBar (Members | Schedule),
MemberList, MemberCard, ScheduleCalendar (week view)

### /settings
SettingsSidebar (left nav), SettingsContent (right)
Sections: StudioProfile | Packages | AddOns |
Team | Automations | Integrations | Notifications | Billing

---

## 11. State Management Rules

```
No Redux. No Zustand. No Context for data.

URL state:     search params for filters, pagination
Server state:  SWR (client) or Server Components (server)
Form state:    react-hook-form + Zod
UI state:      useState (local — modal open, tab active)
Theme:         next-themes only
```

```tsx
// ✅ URL state for filters (shareable, bookmarkable)
'use client'
import { useSearchParams, useRouter } from 'next/navigation'

function StatusFilter() {
  const params = useSearchParams()
  const router = useRouter()
  const status = params.get('status') ?? 'all'

  const setStatus = (value: string) => {
    const next = new URLSearchParams(params)
    next.set('status', value)
    router.push(`?${next.toString()}`)
  }
}
```

---

## 12. Form Rules

```tsx
// ✅ Always react-hook-form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
})

type FormValues = z.infer<typeof schema>

function MyForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { handleSubmit, register, formState: { errors, isSubmitting } } = form
}
```

**Never use controlled inputs with useState for forms.** Always react-hook-form.

---

## 13. Accessibility Rules

```tsx
// ✅ Every icon-only button needs aria-label
<button aria-label="Send WhatsApp message">
  <MessageCircle className="w-4 h-4" />
</button>

// ✅ Every form input needs a label
<label htmlFor="studio-name">Studio Name</label>
<input id="studio-name" ... />

// ✅ Status badges need role
<span role="status" aria-label="Invoice overdue">Overdue</span>

// ✅ Loading states need aria-live
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

Minimum contrast: 4.5:1 for body text, 3:1 for large text.
All interactive elements keyboard-navigable.
Focus rings visible: `focus-visible:ring-2 focus-visible:ring-primary`

---

## 14. Security Rules

```typescript
// ✅ Auth via Supabase SSR cookies — automati