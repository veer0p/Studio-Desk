# StudioDesk - Qwen Code Project Rules

## Core Philosophy

**UX is everything.** Users should never feel lag, delay, or inconvenience. Every interaction must feel instant and fluid.

---

## Next.js Best Practices

### Server vs Client Components

**Default to Server Components.** Only use `"use client"` when absolutely necessary:

- ✅ **Server**: Data fetching, layout, metadata, pure display components, large dependencies
- ✅ **Client**: Interactivity (`onClick`, `useState`), hooks (`useSWR`, `useRouter`), browser APIs, animations

**Critical Rule:** Never put `"use client"` on a component unless it uses at least one client-side feature.

### Performance Rules

1. **No unnecessary loading states** - Only show skeletons when data is actually loading. Switching between items (like bookings) should NOT reload the entire list.
2. **Keep list views stable** - When opening a detail panel, the main list must remain visible and interactive. Only the detail panel should show loading.
3. **Use SWR for client-side data** - Configure appropriate `dedupingInterval` and `refreshInterval` to prevent unnecessary refetches.
4. **Avoid Suspense boundaries that re-trigger on URL param changes** - If a page parameter change (like `?id=...`) causes a Suspense fallback, the list will flash. Fix by using client components or restructuring.
5. **Optimistic updates** - For actions like status changes, update UI immediately, then sync with server.

### Component Architecture

```
Server Component (page.tsx)
  └── Client Component (BookingsClient.tsx) ← Handles URL params, preserves state
        ├── Server Components (pure UI, no hooks)
        └── Client Components (interactivity, state, data fetching)
```

**Key Pattern:** When URL params change (like opening a slideover), the main content area should NOT re-render. Use a client component wrapper to preserve state.

---

## UX Standards

### Zero-Lag Interactions

- **Clicking a list item** → Detail panel opens instantly, list stays visible
- **Switching between items** → No full-page reload, only the panel updates
- **Filtering/searching** → Debounce inputs, show results without full reload
- **Navigation** → Use `router.push()` with `{ scroll: false }` to prevent jarring jumps

### Loading States

- **Initial page load** → Show skeleton via `loading.tsx`
- **Subsequent interactions** → Only affected areas show loading, never the entire page
- **Background refetches** → Show stale data + subtle indicator, never block UI
- **Form submissions** → Disable button, show spinner on button only

### Feedback & Communication

- Every user action gets immediate visual feedback (button press, loading indicator, success/error toast)
- Never leave users wondering "did it work?"
- Use toast notifications for async operations
- Show optimistic updates where possible (e.g., instant status badge change)

### Mobile-First Responsiveness

- All features must work seamlessly on mobile
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Hide desktop-only features on mobile (e.g., slideover → full-page detail)
- Touch-friendly tap targets (minimum 44x44px)

---

## Code Quality Rules

### File Naming

- Components: PascalCase (`BookingCard.tsx`)
- Utils: camelCase (`formatAmount.ts`)
- Pages: lowercase (`page.tsx`, `loading.tsx`)
- API routes: lowercase, RESTful (`/api/v1/bookings`)

### Imports

- Group imports: React → Third-party → Local
- Use absolute paths (`@/components/...`) not relative (`../../`)
- Keep imports sorted alphabetically within groups

### TypeScript

- Always type component props explicitly
- Use `interface` for public APIs, `type` for unions/intersections
- Never use `any` - use `unknown` or proper types
- Leverage discriminated unions for status/stage types

### Error Handling

- Always handle loading, error, and empty states
- Show user-friendly error messages, not raw exceptions
- Provide retry buttons for failed operations
- Log errors to console in dev, graceful degradation in prod

---

## Development Workflow

### Before Committing

1. Run `npm run build` to ensure no TypeScript/compilation errors
2. Test the affected feature manually (no lag, no flash, smooth UX)
3. Check mobile responsiveness if UI changed

### When Adding New Features

1. Start with server-side data fetching if possible
2. Only add client interactivity where needed
3. Test the "click flow" - does it feel instant?
4. Verify no unnecessary re-renders (React DevTools Profiler)

### Common Pitfalls to Avoid

❌ **Bad:** Wrapping list in Suspense when only detail panel changes  
✅ **Fix:** Move URL-driven components to client side to preserve state

❌ **Bad:** `useEffect` fetch on every render  
✅ **Fix:** Use `useSWR` with proper caching

❌ **Bad:** Full page reload on item click  
✅ **Fix:** Client component with router navigation

❌ **Bad:** Blocking UI during background fetch  
✅ **Fix:** Show stale data + loading indicator on affected element only

---

## Remember

**"If the user notices a delay, we've already failed."**

Every decision should prioritize:
1. **Speed** - Fast TTFB, instant interactions
2. **Smoothness** - No layout shifts, no flashes, no jank
3. **Clarity** - Clear feedback, obvious state, intuitive flow
4. **Reliability** - Graceful errors, retry mechanisms, offline support

---

*Last updated: 2026-04-11*
