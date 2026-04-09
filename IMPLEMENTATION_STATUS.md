# StudioDesk — Implementation Status Report

## 1. FULLY IMPLEMENTED (Backend routes + Frontend pages exist)

| Module | Backend Routes | Frontend Pages |
|--------|---------------|----------------|
| **Auth** | login, logout, signup, forgot-password, update-password, me | /login, /signup, /forgot-password, reset-password |
| **Studio Onboarding** | onboarding, onboarding/[step] | /onboarding |
| **Addons** | list/create, [id] detail/update/delete | /addons |
| **Packages** | list/create, [id] detail/update/delete, templates | /settings/packages |
| **Ping** | GET /ping | — |
| **Inquiry** | POST /inquiry | — (no form UI) |
| **Contract Templates** | list/create, [id] detail/update | — (no dedicated UI) |

## 2. PARTIALLY IMPLEMENTED (Both exist, binding incomplete per plan.md)

| Module | Backend | Frontend | Gap |
|--------|---------|----------|-----|
| **Dashboard** | overview, today | /dashboard, root | ✅ FULLY BOUND — GreetingSection, QuickStats, TodayStrip, PendingActions, BookingPipeline, UpcomingEvents, RecentActivity all wired to real APIs |
| **Bookings** | list/create, [id], [id]/status, [id]/activity, [id]/assignments, [id]/shoot-brief | /bookings, /bookings/[id] | Create/edit flows need rebuild around real backend contract |
| **Clients** | list/create, [id] | /clients, /clients/[id] | Booking/invoice linkage ok; communication/timeline panels have mock data |
| **Finance (Invoices)** | list/create, [id], [id]/send, [id]/payment-link, [id]/record-payment, [id]/credit-note, view/[token] | /finance | Mock/stub content in invoices subpanel |
| **Finance (Payments)** | list, [id] | /finance | Mock/stub content in payments subpanel |
| **Finance** | summary, outstanding, mark-overdue | /finance | Summary partly bound |
| **Gallery** | list/create, [id], [id]/upload, [id]/upload-status, [id]/publish, [id]/share, [id]/clusters, [id]/clusters/[cid] | /gallery, /gallery/[id] | ✅ Studio-side FULLY BOUND — create, upload, face tagging, delivery settings all wired to real APIs. Client-facing gallery PIN verification bound to API. |
| **Public Gallery** | [slug], [slug]/lookup | /gallery/p/[slug] | Functional |
| **Team** | list, invite, [memberId], [memberId]/role, [memberId]/assignments, schedule, accept/[token] | /team, /team/[id] | Mock-driven; payouts/conflicts/bank blocked |
| **Analytics** | revenue, bookings, performance | /analytics | Placeholder with hardcoded arrays; needs real chart adapters |
| **Settings** | studio/profile, studio/storage, notifications, billing, integrations, integrations/test | /settings, /settings/studio, /settings/owner, /settings/finance, /settings/notifications, /settings/integrations, /settings/billing, /settings/danger | Hardcoded defaults; all sections need real API binding |
| **Leads** | list/create, [id], [id]/convert | /leads | Exists; needs studio module surfacing per plan.md |
| **Proposals** | list/create, [id], [id]/send, [id]/accept, view/[token] | /proposals | Exists; needs full studio module |
| **Contracts** | list/create, [id], [id]/send, [id]/remind, sign/[token], view/[token] | /contracts | Exists; needs full studio module |
| **Automations** | settings, stats, log, templates, test, trigger | — | Backend complete; no frontend UI |
| **Customer Portal** | [token] dashboard, invoices, gallery, contracts, pay, send-link | /portal/[studioSlug]/... (7 pages) | Partially implemented; needs real API binding |

## 3. MISSING / NOT IMPLEMENTED

| Feature | Status |
|---------|--------|
| **Super Admin Dashboard UI** | Zero routes, zero UI |
| **SaaS Subscription Billing** | No subscription management routes, no Stripe/Razorpay subscription integration, no upgrade/downgrade UI |
| **Expense Tracking** | Schema exists, blocked |
| **Referral System** | Tables exist, nothing else |
| **Feature Flags Management** | Table exists, no routes/UI |
| **API Key Management for Studios** | Table exists, no routes/UI |
| **Data Export / GDPR** | Table exists, no implementation |
| **WhatsApp Templates Management** | Table exists, no routes/UI |
| **Client Messaging/Communication** | Table exists, no real-time UI |
| **Photo Comments & Favorites** | Tables exist, no implementation |
| **Gallery Videos** | Table exists, photos only |
| **Contract Clause Library** | Table exists, no implementation |
| **Member Unavailability Tracking** | Table exists, no implementation |
| **Freelancer Payments** | Table exists, no implementation |
| **NPS (Net Promoter Score)** | Table exists, no implementation |
| **Inquiry Form Builder** | Table exists, no dynamic form UI |
| **PWA (Progressive Web App)** | Mentioned in docs, no service worker/manifest |
| **Customer Mobile App** | Web portal exists, no native app |

## 4. DB-ONLY FEATURES (schema exists, no routes or UI)

**Platform Admin** (present but not analyzed — sensitive):
- `platform_admins`, `admin_sessions`, `admin_audit_logs`, `studio_impersonation_log`, `platform_settings`, `support_notes`, `v_platform_studio_health`

**Subscription & Billing** (present but not analyzed — sensitive):
- `subscription_plans`, `subscription_events`, `platform_subscription_invoices`, `billing_history`, `promo_codes`, `referral_codes`, `referral_redemptions`

**Logging & Audit** (skipped per sensitive content rules):
- `error_logs`, `security_events_log`, `webhook_logs`, `payment_gateway_logs`, `email_delivery_logs`, `whatsapp_delivery_logs`, `data_change_logs`, `background_job_logs`, `audit_logs`

**Extended Features** (schema only):
- `feature_flags`, `api_keys`, `sessions`, `failed_login_attempts`, `data_export_requests`, `immich_sync_jobs`, `revenue_snapshots`, `nps_responses`, `inquiry_form_configs`
- `gallery_videos`, `detected_faces`, `person_clusters`, `guest_selfie_lookups`, `photo_comments`, `photo_favorites`, `photos_with_display_date`, `cluster_jobs`, `file_upload_jobs`
- `client_messages`, `questionnaire_responses`
- `member_unavailability`, `shoot_assignments`, `shoot_briefs` (API route exists, no dedicated UI)
- `contract_revisions`, `contract_clause_library`
- `refunds`, `payment_disputes`, `razorpay_webhook_events`
- `expense_tracking`, `freelancer_payments`
- `albums`, `media_files`, `job_images`
- `notifications`, `whatsapp_templates`, `email_templates`
- `indian_states`, `gst_rates`, `hsn_sac_codes`

**Database Views** (no direct UI):
- `v_bookings_overview`, `v_outstanding_invoices`, `v_pending_automations`, `v_todays_shoots`, `v_unresolved_errors`, `v_studio_storage`

## 5. BLOCKED FEATURES (per plan.md)

| Feature | Blocking Reason |
|---------|----------------|
| Expenses module | No backend expense routes |
| Team payouts | No backend payouts route |
| Team conflicts | No backend team conflicts route |
| Team bank details | No backend team bank route |
| Client communication history | No dedicated endpoint |
| Legacy invoice remind | Depends on nonexistent `/invoices/[id]/remind` |

## 6. HIGH-LEVEL FRONTEND–BACKEND GAPS

| Gap | Summary |
|-----|---------|
| **Super Admin** | ~10 tables exist, zero API routes, zero UI |
| **SaaS Subscription** | ~6 tables exist, no subscription management, no payment integration for studio billing |
| **Frontend mock data** | 8 modules (Dashboard, Bookings, Clients, Finance, Gallery, Team, Analytics, Settings) still use mock/hardcoded data — these are the plan.md binding targets |
| **Automations** | 6 backend routes complete, no frontend UI |
| **Customer Portal** | 7 frontend pages + 6 backend routes exist but need real API binding verification |
| **Leads / Proposals / Contracts / Addons** | Backend complete, frontend pages exist but need full binding verification |

**Totals:** 94 backend route files · 42 frontend page files · 83+ database tables · ~16 modules with both backend+frontend · ~15 modules needing API binding · ~40 DB-only tables · ~17 features not implemented · 6 explicitly blocked
