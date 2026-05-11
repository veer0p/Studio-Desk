AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LegalPrime is a full-stack legal/HR management system for law firms. It covers employee management, payroll, leave tracking, biometric attendance sync, contract management, case tracking, expense workflows, and inventory.

## Development Commands

### Frontend (Frontend/)
```bash
npm run dev        # Vite dev server on port 8080
npm run build      # Production build
npm run build:dev  # Dev build
npm run lint       # ESLint
npm run preview    # Preview built app on port 3000
```

### Backend (Backend/)
```bash
npm run dev        # Run with ts-node (development)
npm run build      # Compile TypeScript to ./dist
npm start          # Run compiled dist/server.js
npm run migrate    # Run database migrations
```

## Architecture

### Monorepo Structure
- `Frontend/` — React 18 + Vite SPA (TypeScript, Tailwind, Radix UI)
- `Backend/` — Express API server (TypeScript, Node.js, port 3002)
- `migrations/` — SQL migration files for PostgreSQL
- `docker-compose.yml` — Self-hosted Supabase stack (PostgreSQL, Kong, GoTrue, Studio)

### Environment Switching (Critical)

Credentials are managed by **manually commenting/uncommenting** blocks in:
- `Frontend/src/config/credentials.ts` — exports `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BACKEND_URL`
- `Backend/config/credentials.ts` — exports `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MYSQL_CONFIG`

There are three environments: **Production** (`api.parikhassociates.in`), **Staging/VPS** (`supabase.nsserver.in` / `147.93.152.126`), and **Local** (Docker Compose). Always check which block is active before making API calls.

### Frontend Architecture

**Routing:** React Router v6. Entry: `src/main.tsx` → `src/App.tsx`. Routes are grouped by role:
- `/` — Login/Signup
- `/dashboard` — Employee self-service
- `/hr/*` — HR management (employees, payroll, leaves, attendance)
- `/finance/*` — Expenses, provident fund, security deposits
- `/legal/*` — Cases, contracts, clients, services, tasks
- `/admin/*` — Settings, users, master data

**Key Contexts (src/contexts/):**
- `AuthContext` — Supabase auth session, `user`, `userRole` (role name string)
- `BranchContext` — Selected branch for multi-branch filtering
- `CompanySettingsContext` — Global company settings from DB

**Permissions System (`src/hooks/usePermissions.ts`):**
Two-layer RBAC: role-level permissions from `role_permissions` table + user-level overrides from `user_permissions` table. User permissions override role permissions. Results are cached in-module for 5 minutes. Use `hasPermission(module, 'view'|'add'|'edit'|'delete')` or `canAccess(module)`.

**Supabase Client (`src/integrations/supabase/client.ts`):**
Single initialized client using credentials from `src/config/credentials.ts`. Auto-generated DB types are in `src/integrations/supabase/types.ts` (large file, ~130KB).

**UI Pattern:** Radix UI headless components + Tailwind utility classes. Forms use React Hook Form + Zod. Server state via React Query (TanStack). Toast notifications via Sonner.

### Backend Architecture

**Entry:** `Backend/index.ts` — Express server with REST routes + node-cron scheduled jobs.

**Key Services:**
- `punch-sync.ts` — Syncs biometric punch data from MySQL (`MYSQL_CONFIG`) to Supabase `punch_records` table. Uses `mysql_id` to prevent duplicates.
- `email-service.ts` — Nodemailer SMTP
- `web-push-service.ts` — Browser push notifications
- `event-notification-service.ts`, `expense-notification-service.ts`, `low-stock-notification-service.ts` — Domain-specific notification triggers
- `attendance-csv.ts` / `attendance-processor-csv.ts` — Attendance export

**Two Supabase clients on backend:** anon key (respects RLS) and service-role key (admin, bypasses RLS). Use service-role only for server-side operations.

### Database

PostgreSQL via self-hosted Supabase. Key table groups:
- **Auth:** `auth.users` (Supabase), `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_permissions`
- **HR:** `employees`, `employee_shifts`, `employee_bank_details`, `employee_documents`, `punch_records`, `leaves`
- **Payroll:** `payroll_periods`, `payroll_components`, salary slip tables
- **Legal:** `cases`, `clients`, `services`, `contracts`, `tasks`
- **Finance:** `expenses`, `provident_fund`, `security_deposits`, `inventory`

Migrations are plain SQL files in `Backend/migrations/` and `migrations/`. Run via `npm run migrate` in Backend.

### Deployment

Docker-based. Build scripts: `build-and-save.bat` (Windows) → transfer image → `vps-load-and-start.sh` (Linux VPS). See `VPS-DEPLOYMENT-GUIDE.md` for the full workflow.

## Key Conventions

- **Path alias:** `@/` maps to `Frontend/src/` in all imports
- **TypeScript strictness:** Frontend has `noImplicitAny` and `strictNullChecks` disabled; Backend uses strict mode
- **MySQL sync:** The biometric attendance system is a separate MySQL DB (`dmps` database). Never write attendance data directly to Supabase — it flows through the sync service
- **Branch filtering:** Most HR/legal data is scoped by branch. Always filter queries using the active branch from `BranchContext`
- **PDF generation:** Uses jsPDF + html2canvas. Custom hooks `useSalarySlipPDF`, `useReportsPDF` in `src/hooks/`

---

## ⛔ MANDATORY DEVELOPMENT RULES (Developer SOP)

**These rules are NON-NEGOTIABLE. Treat violations as blocking errors.**

### RULE 1: Permission Checks — Every Page, Every API

```typescript
// ALWAYS do this at the top of every page component
import { usePermissions } from '@/hooks/usePermissions';
const { hasPermission, canAccess } = usePermissions();

if (!canAccess('module_name')) return <Navigate to="/dashboard" replace />;

// Gate every action button
{hasPermission('module_name', 'add') && <AddButton />}
{hasPermission('module_name', 'edit') && <EditButton />}
{hasPermission('module_name', 'delete') && <DeleteButton />}
```

- Never render a page without `canAccess()` check.
- Never show action buttons without `hasPermission()` check.
- Never allow URL bypass of permission checks.
- Backend endpoints must also verify permissions.

### RULE 2: Consistent CRUD Buttons

| Action | Style | Icon (Lucide) | Color |
|--------|-------|---------------|-------|
| Add | Primary filled | `Plus` | Brand primary |
| Edit | Ghost icon | `Pencil` | Default |
| View | Ghost icon | `Eye` | Default |
| Delete | Ghost icon | `Trash2` | Destructive (red) |

- All action buttons must look identical across all pages.
- Delete always requires AlertDialog confirmation.
- Mobile: action buttons collapse into a DropdownMenu.
- All icon buttons have Tooltips.
- Show toast (Sonner) after every CRUD operation.

### RULE 3: Design System Enforcement

- **Components:** Radix UI only. Never create custom dropdowns, modals, etc.
- **Icons:** Lucide React only. Never use FontAwesome, Heroicons, or others.
- **Colors:** Tailwind semantic classes only (`text-primary`, `bg-muted`, `text-destructive`). Never hardcode hex colors.
- **Animations:** Framer Motion only.
- **Forms:** React Hook Form + Zod. Always.
- **Data Fetching:** React Query (TanStack). Always.
- **Toasts:** Sonner. Never `window.alert()`.
- **Dates:** date-fns. Never moment.js.

### RULE 4: Fully Responsive Pages

- Every page must work at: 375px (mobile), 768px (tablet), 1280px+ (desktop).
- No fixed pixel widths that break on smaller screens.
- Tables: horizontal scroll OR card layout on mobile.
- Dialogs: full-screen on mobile.
- Touch targets: minimum 44px × 44px.
- No horizontal overflow anywhere.
- Use `use-mobile.tsx` and `use-tablet.tsx` hooks for responsive logic.

### RULE 5: Consistent Filters

- Date filter with presets: Today, Yesterday, This Week, This Month, Last 30 Days, Custom.
- Use `useDateFormat()` hook for date display.
- Default filter: Current month.
- Dropdowns: Radix Select only. Never native `<select>`.
- Placement: Top of data section, aligned left.
- Filter changes update data immediately (no "Apply" button).
- Active filters visually indicated.
- "Reset Filters" button when any filter is active.

### RULE 6: Search Bar Consistency

- Position: Top-right of every list page, aligned with page title.
- Debounce: 300ms using `useDebouncedValue` hook.
- Prefix icon: `Search` (lucide).
- Clear button: `X` icon, visible when text entered.
- Placeholder: "Search {module name}..."
- Search across all visible columns.
- Full width on mobile.

### RULE 7: Uniform Pagination

- Use `usePagination()` hook from `@/hooks/usePagination.ts` on every list page.
- Page sizes: 10, 25, 50, 100.
- Show: current page, total pages, total items count.
- Previous/Next buttons.
- "Showing X to Y of Z results" text.
- Placement: Bottom-right of table.
- Reset to page 1 when filters change.

### RULE 8: Standard Loading States

| Scenario | Loader |
|----------|--------|
| Page load | Full-page centered spinner |
| Table data | Skeleton rows |
| Button action | Inline spinner, button disabled |
| Form submit | Spinner in submit button, fields disabled |
| Background refresh | Subtle progress indicator |

- Never show a blank page while loading.
- Always show error state with retry button on failure.
- Always show empty state with icon + message when no data.

### RULE 9: Form Validation

- Every form uses React Hook Form + Zod schema.
- Required fields marked with red asterisk (*).
- Email: `.email()` validation.
- Phone: Indian format validation (10-digit or +91).
- Dates: end >= start, no invalid future dates.
- Numbers: `.positive()`, `.min()`, `.max()` as needed.
- Files: type + size validation (max 10MB).
- Passwords: min 8 chars, uppercase + lowercase + number + special.
- Show field-level errors below each field.
- Disable submit button during submission.

### RULE 10: Branch Scoping

```typescript
import { useBranch } from '@/contexts/BranchContext';
const { selectedBranch } = useBranch();

// Always filter by branch
.eq('branch_id', selectedBranch?.id)
```

- Always include `branch_id` filter on branch-scoped data.
- Always set `branch_id` when creating records.
- Show branch selection page if no branch selected.

### RULE 11: Feature Integration (Search & Permissions)

When adding a new page or module, follow these mandatory integration steps:

#### Phase 1: Permission & Access Design
Before writing any code, determine who should see this page.
1.  **Ask the User:** If you are unsure which roles (Admin, HR, Employee) need access, you **MUST** ask the user first.
2.  **Propose Permissions:** Present the proposed permission name (e.g., `inventory_edit`) and target roles to the user for approval.
3.  **SQL Migration:** 
    - **Define the Permission:**
      ```sql
      INSERT INTO public.permissions (name, module, can_view, can_add, can_edit, can_delete, description) 
      VALUES ('Permission Name', 'module_name', true, true, true, true, 'Description')
      ON CONFLICT (name) DO NOTHING;
      ```
    - **Map to Roles:**
      ```sql
      INSERT INTO public.role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM public.roles r, public.permissions p
      WHERE r.name IN ('Admin', 'HR Manager') AND p.module = 'module_name'
      ON CONFLICT (role_id, permission_id) DO NOTHING;
      ```
    - **CRITICAL:** The AI assistant **MUST** propose the list of permissions and target roles to the user before applying SQL. No permissions should be applied without explicit consent.

#### Phase 2: Routing & Navigation
1.  **Lazy Loading:** Register in `Frontend/src/App.tsx` using `lazy()`.
    ```tsx
    const MyComponent = lazy(() => import('./pages/MyComponent'));
    ```
2.  **Protection:** Wrap the component with `<ProtectedRoute resource="permission_name" />`.
    ```tsx
    <Route path="/path" element={<ProtectedRoute resource="module_name"><MyComponent /></ProtectedRoute>} />
    ```
3.  **Sidebar:** Add the navigation item in `MainLayout.tsx`. Use `canAccess('permission_name')` to wrap the menu item.
    ```tsx
    {canAccess('module_name') && <NavItem to="/path" label="Label" icon={Icon} />}
    ```

#### Phase 3: Global Search Integration
1.  **Configuration:** Update `Frontend/src/config/searchGrouping.ts`.
    - Add to `ROUTE_PREFIX_GROUPS` with its UI group.
    - If the group is new, add it to `SEARCH_GROUP_ORDER` (use **UPPERCASE**).
    - Add the group name to `SEARCH_MODULE_MAPPING` under the correct functional tab.
2.  **Database RPC:** Update the `global_search` function in PostgreSQL.
    - **Create Match Block:**
      ```sql
      my_table_matches AS (
        SELECT
          'Group Name'::TEXT AS eg,
          'entity_type'::TEXT AS et,
          t.id AS eid,
          t.title AS ttl,
          t.description AS sub,
          '/path/' || t.id::TEXT AS url,
          'permission_module'::TEXT AS pm,
          0.8::REAL AS fts_rank,
          word_similarity(prs.q, t.title) AS title_sim
        FROM parsed prs
        JOIN filtered_modules fm ON fm.module = 'permission_module'
        JOIN public.my_table t ON prs.q IS NOT NULL
        WHERE t.is_deleted = false
          AND (t.title ILIKE '%' || prs.q || '%' OR t.description ILIKE '%' || prs.q || '%')
        LIMIT 10
      )
      ```
    - Include in the final `merged` CTE via `UNION ALL SELECT * FROM my_table_matches`.
    - **Security:** Ensure row-level scoping (filtering by `auth.uid()` or assigned employee) is applied for private records.

#### Phase 4: Verification (Mandatory)
After implementation, you **MUST** ask the user to verify the following:
1.  **Permission Check:** "I have added the permissions for [Module]. Please log in as [Role] to verify that you can/cannot see the module as expected."
2.  **Global Search:** "I have integrated [Module] into global search. Please test by searching for '[Sample Record Name]' in the top search bar."

---

---

## 🚫 NEVER DO LIST

1. Never use `window.alert()`, `window.confirm()`, or `window.prompt()`.
2. Never hardcode credentials, API keys, or URLs.
3. Never use inline styles — use Tailwind classes.
4. Never install new dependencies without checking existing ones first.
5. Never write to MySQL attendance DB — use punch-sync service.
6. Never bypass the permission system.
7. Never create a page without loading, error, and empty states.
8. Never use `console.log` in production — use `console.error` for errors.
9. Never create a form without Zod validation.
10. Never skip responsive testing.
11. Never use `any` TypeScript type — use `unknown` if needed.
12. Never store server data in `useState` — use React Query.

## ✅ ALWAYS DO LIST

1. Always check permissions with `usePermissions()`.
2. Always use `usePagination()` on list pages.
3. Always use `useDateFormat()` for dates.
4. Always filter by `selectedBranch`.
5. Always show toasts after CRUD operations.
6. Always confirm before deletes.
7. Always use React Query for data fetching.
8. Always test at 375px, 768px, 1280px.
9. Always define TypeScript interfaces for props.
10. Always match existing design patterns from similar pages.