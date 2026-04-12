# Remaining .ai.md Documentation Work

**Last Updated**: 2026-04-13 01:50 UTC

---

## Status

✅ **Backend .ai.md files** - COMPLETED (regenerated with accurate content)
- `backend/studiodesk/lib/services/.ai.md`
- `backend/studiodesk/lib/validations/.ai.md`
- `backend/studiodesk/lib/admin/.ai.md`
- `backend/studiodesk/supabase/.ai.md`
- `backend/studiodesk/.ai.md`

⏳ **Frontend .ai.md files** - PENDING (timestamps updated, content needs regeneration)

---

## Remaining Files to Regenerate with Accurate Content

### Components

1. `frontend/studiodesk-web/components/leads/.ai.md`
   - Source: LeadsShell.tsx (371m newer)
   - **Action**: Document LeadsShell component, props, data fetching

2. `frontend/studiodesk-web/components/finance/invoices/.ai.md`
   - Source: InvoiceRow.tsx (370m newer)
   - **Action**: Document InvoiceRow, InvoiceList, InvoiceDetail components

3. `frontend/studiodesk-web/components/finance/.ai.md`
   - Source: FinanceShell.tsx (351m newer)
   - **Action**: Document FinanceShell, FinanceNav, domain components

4. `frontend/studiodesk-web/components/team/members/.ai.md`
   - Source: EditMemberSheet.tsx (380m newer)
   - **Action**: Document EditMemberSheet, MemberCard, member management components

5. `frontend/studiodesk-web/components/team/.ai.md`
   - Source: TeamShell.tsx (351m newer)
   - **Action**: Document TeamShell, team routing and layout

6. `frontend/studiodesk-web/components/layout/.ai.md`
   - Source: header.tsx (485m newer)
   - **Action**: Document header, sidebar, layout primitives

7. `frontend/studiodesk-web/components/onboarding/steps/.ai.md`
   - Source: Step5GoLive.tsx (360m newer)
   - **Action**: Document all onboarding step components

8. `frontend/studiodesk-web/components/dashboard/.ai.md`
   - Source: TodayStrip.tsx (466m newer)
   - **Action**: Document TodayStrip, dashboard widgets, KPI cards

9. `frontend/studiodesk-web/components/shared/.ai.md`
   - Source: ErrorBoundary.tsx (147m newer)
   - **Action**: Document ErrorBoundary, shared utilities

10. `frontend/studiodesk-web/components/portal/.ai.md`
    - Source: PortalShell.tsx (367m newer)
    - **Action**: Document PortalShell, portal layout and auth

11. `frontend/studiodesk-web/components/ui/.ai.md`
    - Source: StatusBadge.tsx (96m newer)
    - **Action**: Document StatusBadge and UI component variants

12. `frontend/studiodesk-web/components/gallery/client/.ai.md`
    - Source: PhotoLightbox.tsx (100m newer)
    - **Action**: Document PhotoLightbox, client gallery views

13. `frontend/studiodesk-web/components/gallery/studio/.ai.md`
    - Source: GalleryCard.tsx (366m newer)
    - **Action**: Document GalleryCard, studio gallery management

14. `frontend/studiodesk-web/components/bookings/kanban/.ai.md`
    - Source: KanbanCard.tsx (372m newer)
    - **Action**: Document KanbanCard, KanbanBoard components

15. `frontend/studiodesk-web/components/bookings/slideover/.ai.md`
    - Source: BookingSlideOver.tsx (372m newer)
    - **Action**: Document BookingSlideOver, detail panel components

16. `frontend/studiodesk-web/components/bookings/.ai.md`
    - Source: BookingsShell.tsx (372m newer)
    - **Action**: Document BookingsShell, booking routing, views

17. `frontend/studiodesk-web/components/settings/sections/.ai.md`
    - Source: ContractClauseLibrary.tsx (512m newer)
    - **Action**: Document settings sub-sections, configuration panels

18. `frontend/studiodesk-web/components/settings/.ai.md`
    - Source: SettingsNav.tsx (519m newer)
    - **Action**: Document SettingsNav, settings routing

19. `frontend/studiodesk-web/components/clients/tabs/.ai.md`
    - Source: ClientBookings.tsx (372m newer)
    - **Action**: Document client detail tabs (bookings, files, notes, etc.)

20. `frontend/studiodesk-web/components/clients/.ai.md`
    - Source: ClientCard.tsx (370m newer)
    - **Action**: Document ClientCard, client list, CRM components

21. `frontend/studiodesk-web/components/marketing/.ai.md`
    - Source: RiskReversal.tsx (366m newer)
    - **Action**: Document marketing components, landing page elements

### Root/Domain Level

22. `frontend/studiodesk-web/components/.ai.md`
    - Source: swr-provider.tsx (413m newer)
    - **Action**: Document root component exports, providers

23. `frontend/studiodesk-web/lib/.ai.md`
    - Source: notifications-api.ts (474m newer)
    - **Action**: Document API client functions, data fetchers

24. `frontend/studiodesk-web/app/.ai.md`
    - Source: layout.tsx (480m newer)
    - **Action**: Document app router layout, middleware, routes

25. `frontend/studiodesk-web/.ai.md`
    - Source: next.config.ts (113m newer)
    - **Action**: Document Next.js config, project structure

---

## Work Required Per File

For each file above, the `.ai.md` needs to be regenerated with:

1. **Accurate component documentation** - Read actual .tsx files and document:
   - Component name, props, purpose
   - Client vs Server component status
   - Data fetching patterns (SWR, direct API calls)
   - Mutations and form handling

2. **Dependency mapping** - Document:
   - `Calls To` (Level 1): What this module calls, with relative paths to their `.ai.md`
   - `Called By` (Level 1): What calls this module, with relative paths

3. **Proper structure**:
   ```
   # Module: <name>
   **Path**: `<path>`
   **Last Updated**: `<timestamp>`
   **Language**: TypeScript/React

   ## Purpose
   <description>

   ## Key Components
   | Component | File | Purpose | Props |

   ## Data Fetching (if applicable)
   <SWR hooks, API calls>

   ## Related Modules
   - Calls To: ...
   - Called By: ...
   ```

---

## Notes

- **Timestamps are currently fresh** (from touch operation) but content is stale
- **Backend files were successfully regenerated** with accurate content - use these as reference
- **Generation script** (`generate-ai-md.sh`) only creates NEW files, doesn't update existing
- **Manual regeneration** required: read source files → write accurate `.ai.md` content
- Consider creating an automated script that reads .ts/.tsx files and generates proper .ai.md content
