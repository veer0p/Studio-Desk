-- StudioDesk seed (Modules 1 & 2) — run in Supabase SQL Editor.
-- Before running: Create 4 users in Authentication → Users (same emails; password e.g. Test@1234):
--   owner@test.com, photographer@test.com, editor@test.com, outsider@test.com

-- Create subscription_plans if missing (e.g. VPS never ran full schema migrations)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_price_inr NUMERIC(10,2) NOT NULL,
  annual_price_inr NUMERIC(10,2) NOT NULL,
  max_team_members SMALLINT NOT NULL,
  max_bookings_per_month INTEGER,
  storage_limit_gb NUMERIC(8,2) NOT NULL,
  razorpay_monthly_plan_id TEXT,
  razorpay_annual_plan_id TEXT,
  features JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- subscription_plans (unique on tier)
INSERT INTO public.subscription_plans (id, tier, name, monthly_price_inr, annual_price_inr, max_team_members, max_bookings_per_month, storage_limit_gb, is_active)
VALUES
  ('70000001-0001-4000-8000-000000000001', 'starter', 'Starter', 999, 9999, 1, 50, 20, true),
  ('70000001-0001-4000-8000-000000000002', 'studio', 'Studio', 2999, 29999, 3, NULL, 100, true),
  ('70000001-0001-4000-8000-000000000003', 'agency', 'Agency', 5999, 59999, 10, NULL, 500, true)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name, monthly_price_inr = EXCLUDED.monthly_price_inr,
  annual_price_inr = EXCLUDED.annual_price_inr, max_team_members = EXCLUDED.max_team_members,
  max_bookings_per_month = EXCLUDED.max_bookings_per_month, storage_limit_gb = EXCLUDED.storage_limit_gb, is_active = EXCLUDED.is_active;

-- studios (A and B). bank_account_number: optional, set via app or leave NULL.
INSERT INTO public.studios (id, name, slug, tagline, gstin, pan, phone, email, city, state, state_id, bank_name, bank_ifsc, invoice_prefix, invoice_sequence, default_advance_pct, default_hsn_code, plan_tier, subscription_status, storage_limit_gb, storage_used_gb, onboarding_completed, onboarding_step, onboarding_completed_at, is_active)
VALUES
  ('a0000001-0001-4000-8000-000000000001', 'XYZ Photography', 'xyz-photography', 'Capturing moments', '24AABCU9603R1ZT', 'AABCU9603R', '9876543210', 'studio@xyzphoto.com', 'Surat', 'Gujarat', 7, 'HDFC Bank', 'HDFC0001234', 'XYZ', 1, 30, '9983', 'studio', 'active', 100, 2.5, true, 5, NOW(), true),
  ('a0000001-0001-4000-8000-000000000002', 'ABC Clicks', 'abc-clicks', NULL, NULL, NULL, NULL, NULL, NULL, 'Gujarat', NULL, NULL, NULL, 'ABC', 1, NULL, NULL, 'starter', 'active', 20, 0, false, 0, NULL, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, slug = EXCLUDED.slug, plan_tier = EXCLUDED.plan_tier, storage_limit_gb = EXCLUDED.storage_limit_gb, storage_used_gb = EXCLUDED.storage_used_gb, onboarding_completed = EXCLUDED.onboarding_completed, onboarding_step = EXCLUDED.onboarding_step, onboarding_completed_at = EXCLUDED.onboarding_completed_at, is_active = EXCLUDED.is_active;

-- studio_onboarding_events (Studio A)
INSERT INTO public.studio_onboarding_events (id, studio_id, step_number, step_name, completed_at, time_spent_sec, skipped)
VALUES
  ('60000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 1, 'basic_info', NOW(), 120, false),
  ('60000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 2, 'business_details', NOW(), 90, false),
  ('60000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 3, 'payment_setup', NOW(), 60, false),
  ('60000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000001', 4, 'inquiry_form', NOW(), 45, false),
  ('60000001-0001-4000-8000-000000000005', 'a0000001-0001-4000-8000-000000000001', 5, 'first_package', NOW(), 180, false)
ON CONFLICT (studio_id, step_number) DO UPDATE SET step_name = EXCLUDED.step_name, completed_at = EXCLUDED.completed_at, time_spent_sec = EXCLUDED.time_spent_sec, skipped = EXCLUDED.skipped;

-- studio_members (requires auth users owner@test.com, photographer@test.com, editor@test.com, outsider@test.com)
INSERT INTO public.studio_members (id, studio_id, user_id, role, display_name, is_active, accepted_at)
VALUES
  ('c0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', (SELECT id FROM auth.users WHERE email = 'owner@test.com' LIMIT 1), 'owner', 'Studio Owner', true, NOW()),
  ('c0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', (SELECT id FROM auth.users WHERE email = 'photographer@test.com' LIMIT 1), 'photographer', 'Test Photographer', true, NOW()),
  ('c0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', (SELECT id FROM auth.users WHERE email = 'editor@test.com' LIMIT 1), 'editor', 'Test Editor', true, NOW()),
  ('c0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000002', (SELECT id FROM auth.users WHERE email = 'outsider@test.com' LIMIT 1), 'owner', 'Outside Owner', true, NOW())
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role, display_name = EXCLUDED.display_name, is_active = EXCLUDED.is_active, accepted_at = EXCLUDED.accepted_at;

-- service_packages
INSERT INTO public.service_packages (id, studio_id, name, event_type, base_price, is_gst_applicable, turnaround_days, deliverables, is_active, sort_order)
VALUES
  ('d0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'Wedding Full Day', 'wedding', 85000, true, 30, ARRAY['500+ photos','1 highlights reel','Online gallery','USB drive'], true, 1),
  ('d0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'Corporate Event', 'corporate', 45000, true, 7, NULL, true, 2),
  ('d0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 'Portrait Session', 'portrait', 20000, true, 7, NULL, true, 3),
  ('d0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000001', 'Birthday Party', 'birthday', 25000, true, NULL, NULL, false, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, event_type = EXCLUDED.event_type, base_price = EXCLUDED.base_price, is_active = EXCLUDED.is_active;

-- package_addons
INSERT INTO public.package_addons (id, studio_id, name, price, unit, is_active)
VALUES
  ('e0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'Drone Coverage', 15000, 'flat', true),
  ('e0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'Second Shooter', 12000, 'flat', true),
  ('e0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 'Same Day Edit', 8000, 'flat', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, unit = EXCLUDED.unit, is_active = EXCLUDED.is_active;

-- clients
INSERT INTO public.clients (id, studio_id, full_name, phone, email, city, state, company_name, gstin, tags)
VALUES
  ('f0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'Priya Sharma', '9876543210', 'priya@test.com', 'Surat', 'Gujarat', NULL, NULL, ARRAY['vip','wedding']),
  ('f0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'Raj Kumar', '8765432109', 'raj@test.com', 'Ahmedabad', 'Gujarat', 'Raj Enterprises', '24AABCU9603R1ZT', NULL),
  ('f0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 'Meera Patel', '7654321098', 'meera@test.com', 'Mumbai', 'Maharashtra', NULL, NULL, NULL),
  ('f0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000001', 'Dev Agarwal', '9988776655', NULL, 'Surat', 'Gujarat', NULL, NULL, NULL),
  ('f0000001-0001-4000-8000-000000000005', 'a0000001-0001-4000-8000-000000000001', 'Anita Shah', '9977665544', 'anita@test.com', 'Ahmedabad', 'Gujarat', NULL, NULL, NULL),
  ('f0000001-0001-4000-8000-000000000006', 'a0000001-0001-4000-8000-000000000002', 'Vikram Mehta', '9966554433', 'vikram@test.com', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email, city = EXCLUDED.city, state = EXCLUDED.state;

-- leads (Studio A and one for Studio B)
INSERT INTO public.leads (id, studio_id, client_id, event_type, event_date_approx, budget_min, budget_max, status, source, priority, converted_to_booking, form_data, follow_up_at, last_contacted_at, notes)
VALUES
  ('10000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000003', 'wedding', (CURRENT_DATE + INTERVAL '6 months')::date, 80000, 120000, 'new_lead', 'inquiry_form', 1, false, '{"note":"Inquiry from website"}', NULL, NULL, NULL),
  ('10000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000004', 'corporate', NULL, NULL, NULL, 'contacted', 'walk_in', 2, false, NULL, (CURRENT_DATE + 1)::timestamptz, NOW(), NULL),
  ('10000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000005', 'portrait', NULL, NULL, NULL, 'proposal_sent', 'instagram', 2, false, NULL, NULL, (CURRENT_TIMESTAMP - INTERVAL '1 day'), NULL),
  ('10000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', 'wedding', (CURRENT_DATE + INTERVAL '2 months')::date, NULL, NULL, 'contract_signed', 'referral', 2, true, NULL, NULL, (CURRENT_TIMESTAMP - INTERVAL '5 days'), NULL),
  ('10000001-0001-4000-8000-000000000005', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000004', 'birthday', NULL, NULL, NULL, 'lost', 'facebook', 3, false, NULL, NULL, NULL, 'Second inquiry — opted out'),
  ('10000001-0001-4000-8000-000000000006', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000002', 'corporate', NULL, NULL, NULL, 'new_lead', 'google', 1, false, NULL, (CURRENT_TIMESTAMP - INTERVAL '3 days'), NULL, NULL),
  ('10000001-0001-4000-8000-000000000007', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000002', 'wedding', (CURRENT_DATE + INTERVAL '14 days')::date, NULL, NULL, 'contacted', 'phone', 1, false, NULL, NULL, NOW(), NULL),
  ('10000001-0001-4000-8000-000000000008', 'a0000001-0001-4000-8000-000000000002', 'f0000001-0001-4000-8000-000000000006', 'portrait', NULL, NULL, NULL, 'new_lead', 'walk_in', 2, false, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, source = EXCLUDED.source, converted_to_booking = EXCLUDED.converted_to_booking, follow_up_at = EXCLUDED.follow_up_at, last_contacted_at = EXCLUDED.last_contacted_at, notes = EXCLUDED.notes;

-- booking (converted from lead 4)
INSERT INTO public.bookings (id, studio_id, client_id, lead_id, title, event_type, event_date, total_amount, advance_amount, amount_paid, gst_type, status, package_id)
VALUES
  ('20000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', '10000001-0001-4000-8000-000000000004', 'Priya Sharma — Wedding', 'wedding', (CURRENT_DATE + INTERVAL '2 months')::date, 85000, 25500, 25500, 'cgst_sgst', 'contract_signed', 'd0000001-0001-4000-8000-000000000001')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, amount_paid = EXCLUDED.amount_paid;

-- mark lead 4 as converted
UPDATE public.leads SET converted_to_booking = true, booking_id = '20000001-0001-4000-8000-000000000001' WHERE id = '10000001-0001-4000-8000-000000000004';

-- inquiry_form_configs
INSERT INTO public.inquiry_form_configs (id, studio_id, form_title, form_subtitle, button_text, show_event_type, show_event_date, show_venue, show_guest_count, show_budget, show_message, require_phone, require_email, require_event_date, enable_recaptcha)
VALUES
  ('30000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'Book Your Photography Session', 'Tell us about your event', 'Submit', true, true, true, true, true, true, true, false, false, false)
ON CONFLICT (studio_id) DO UPDATE SET form_title = EXCLUDED.form_title, button_text = EXCLUDED.button_text;

-- studio_invitations (pending + expired)
INSERT INTO public.studio_invitations (id, studio_id, invited_by, email, role, token, expires_at, resent_count)
VALUES
  ('40000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'c0000001-0001-4000-8000-000000000001', 'pending@test.com', 'videographer', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', (CURRENT_TIMESTAMP + INTERVAL '1 day'), 0),
  ('40000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'c0000001-0001-4000-8000-000000000001', 'expired@test.com', 'assistant', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', (CURRENT_TIMESTAMP - INTERVAL '3 days'), 1)
ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, resent_count = EXCLUDED.resent_count;

-- studio_settings
INSERT INTO public.studio_settings (id, studio_id, notify_new_lead_email, notify_new_lead_whatsapp, notify_payment_email, notify_payment_whatsapp, invoice_bank_details_visible, gallery_default_expiry_days, gallery_watermark_default, timezone)
VALUES
  ('50000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', true, false, true, false, true, 30, true, 'Asia/Kolkata'),
  ('50000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000002', true, false, true, false, true, 14, false, 'Asia/Kolkata')
ON CONFLICT (studio_id) DO UPDATE SET timezone = EXCLUDED.timezone;
