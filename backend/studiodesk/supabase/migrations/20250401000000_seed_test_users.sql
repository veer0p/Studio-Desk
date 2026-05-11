-- ================================================================
--  STUDIODESK — Seed Test Users
--  Run AFTER studios exist (main seed or manual creation)
-- ================================================================
-- This migration creates 4 test users in Supabase Auth and
-- inserts corresponding studio_members records.
--
-- IMPORTANT: Supabase Auth users MUST be created via the
-- Dashboard or Admin API — this SQL handles ONLY the
-- studio_members portion.
--
-- Pre-requisites:
--   1. Create these 4 users in Supabase Dashboard → Authentication → Users
--      (or run seed-test-users.ts / main seed.ts):
--        - owner@test.com        / Test@1234
--        - photographer@test.com / Test@1234
--        - editor@test.com       / Test@1234
--        - outsider@test.com     / Test@1234
--   2. Studios A and B must exist
--
-- Idempotency: ON CONFLICT (id) DO UPDATE — safe to re-run
-- ================================================================

-- ── Studio Members (upsert) ───────────────────────────────────────────────
-- INSERT...SELECT skips the row silently if the auth user doesn't exist yet
-- (avoids null value violation when users haven't been created in Auth first)

INSERT INTO public.studio_members (id, studio_id, user_id, role, display_name, phone, whatsapp, specialization, is_active, accepted_at)
SELECT 'c0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', id, 'owner', 'Studio Owner', NULL, NULL, NULL, true, NOW()
FROM auth.users WHERE email = 'owner@test.com'
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role, display_name = EXCLUDED.display_name, is_active = EXCLUDED.is_active, accepted_at = EXCLUDED.accepted_at;

INSERT INTO public.studio_members (id, studio_id, user_id, role, display_name, phone, whatsapp, specialization, is_active, accepted_at)
SELECT 'c0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', id, 'photographer', 'Test Photographer', '9876500001', '9876500001', ARRAY['wedding', 'portrait'], true, NOW()
FROM auth.users WHERE email = 'photographer@test.com'
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role, display_name = EXCLUDED.display_name, phone = EXCLUDED.phone, whatsapp = EXCLUDED.whatsapp, specialization = EXCLUDED.specialization, is_active = EXCLUDED.is_active, accepted_at = EXCLUDED.accepted_at;

INSERT INTO public.studio_members (id, studio_id, user_id, role, display_name, phone, whatsapp, specialization, is_active, accepted_at)
SELECT 'c0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', id, 'editor', 'Test Editor', '9876500002', '9876500002', ARRAY['corporate', 'video'], true, NOW()
FROM auth.users WHERE email = 'editor@test.com'
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role, display_name = EXCLUDED.display_name, phone = EXCLUDED.phone, whatsapp = EXCLUDED.whatsapp, specialization = EXCLUDED.specialization, is_active = EXCLUDED.is_active, accepted_at = EXCLUDED.accepted_at;

INSERT INTO public.studio_members (id, studio_id, user_id, role, display_name, phone, whatsapp, specialization, is_active, accepted_at)
SELECT 'c0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000002', id, 'owner', 'Outside Owner', NULL, NULL, NULL, true, NOW()
FROM auth.users WHERE email = 'outsider@test.com'
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role, display_name = EXCLUDED.display_name, is_active = EXCLUDED.is_active, accepted_at = EXCLUDED.accepted_at;

-- ── Verification ───────────────────────────────────────────────────────────
-- Run this separately to confirm:
-- SELECT
--   u.email,
--   sm.role,
--   sm.display_name,
--   sm.is_active,
--   s.name AS studio_name
-- FROM public.studio_members sm
-- JOIN auth.users u ON u.id = sm.user_id
-- JOIN public.studios s ON s.id = sm.studio_id
-- WHERE sm.id IN (
--   'c0000001-0001-4000-8000-000000000001',
--   'c0000001-0001-4000-8000-000000000002',
--   'c0000001-0001-4000-8000-000000000003',
--   'c0000001-0001-4000-8000-000000000004'
-- )
-- ORDER BY sm.id;
