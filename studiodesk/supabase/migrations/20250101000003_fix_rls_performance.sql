-- ================================================================
-- StudioDesk Migration: Fix RLS Performance
-- Version: 20250101000003
--
-- Background: RLS policies that call auth.uid() directly evaluate it
-- per-row which destroys query performance at scale. The fix is wrapping
-- auth.uid() in a subselect: (SELECT auth.uid()) — this caches the result
-- for the entire query instead of re-evaluating per row.
-- ================================================================

-- ── 1. Update Helper Functions ────────────────────────────────
-- Replace auth.uid() with (SELECT auth.uid())

CREATE OR REPLACE FUNCTION fn_my_studio_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT studio_id FROM studio_members
  WHERE user_id = (SELECT auth.uid()) AND is_active = TRUE LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_is_studio_owner(p_studio_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM studio_members
    WHERE studio_id = p_studio_id
      AND user_id   = (SELECT auth.uid())
      AND role      = 'owner'
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION fn_has_permission(p_resource TEXT, p_action permission_action)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM studio_members sm
    JOIN role_permissions rp ON rp.role = sm.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE sm.user_id   = (SELECT auth.uid())
      AND sm.is_active = TRUE
      AND p.resource   = p_resource
      AND p.action     = p_action
      AND rp.granted   = TRUE
      -- Check no override denies it
      AND NOT EXISTS (
        SELECT 1 FROM member_permission_overrides mpo
        WHERE mpo.member_id     = sm.id
          AND mpo.permission_id = p.id
          AND mpo.granted       = FALSE
      )
  )
  OR EXISTS (
    -- Check for explicit grant override
    SELECT 1 FROM studio_members sm2
    JOIN member_permission_overrides mpo ON mpo.member_id = sm2.id
    JOIN permissions p2 ON p2.id = mpo.permission_id
    WHERE sm2.user_id   = (SELECT auth.uid())
      AND sm2.is_active = TRUE
      AND p2.resource   = p_resource
      AND p2.action     = p_action
      AND mpo.granted   = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION fn_is_platform_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = (SELECT auth.uid()) AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION fn_is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = (SELECT auth.uid())
      AND role = 'super_admin'
      AND is_active = TRUE
  );
$$;


-- ── 2. Drop and Recreate All RLS Policies ─────────────────────
-- Replacing auth.uid() with (SELECT auth.uid())

-- studios
DROP POLICY IF EXISTS studios_select ON studios;
CREATE POLICY studios_select ON studios FOR SELECT USING (id = fn_my_studio_id());

DROP POLICY IF EXISTS studios_update ON studios;
CREATE POLICY studios_update ON studios FOR UPDATE USING (fn_is_studio_owner(id));

-- studio_members
DROP POLICY IF EXISTS members_select ON studio_members;
CREATE POLICY members_select ON studio_members FOR SELECT USING (studio_id = fn_my_studio_id());

DROP POLICY IF EXISTS members_insert ON studio_members;
CREATE POLICY members_insert ON studio_members FOR INSERT WITH CHECK (fn_is_studio_owner(studio_id));

DROP POLICY IF EXISTS members_update ON studio_members;
CREATE POLICY members_update ON studio_members FOR UPDATE USING (fn_is_studio_owner(studio_id));

DROP POLICY IF EXISTS members_delete ON studio_members;
CREATE POLICY members_delete ON studio_members FOR DELETE USING (fn_is_studio_owner(studio_id));

-- referral_codes
DROP POLICY IF EXISTS referral_codes_tenant ON referral_codes;
CREATE POLICY referral_codes_tenant ON referral_codes
  FOR ALL
  USING (owner_studio_id = fn_my_studio_id())
  WITH CHECK (owner_studio_id = fn_my_studio_id());

-- referral_redemptions
DROP POLICY IF EXISTS referral_redemptions_tenant ON referral_redemptions;
CREATE POLICY referral_redemptions_tenant ON referral_redemptions
  FOR ALL
  USING (
    referrer_studio_id = fn_my_studio_id()
    OR referred_studio_id = fn_my_studio_id()
  );

-- shoot_assignments
DROP POLICY IF EXISTS shoot_assignments_access ON shoot_assignments;
CREATE POLICY shoot_assignments_access ON shoot_assignments FOR ALL USING (
  studio_id = fn_my_studio_id()
  AND (
    fn_is_studio_owner(studio_id)
    OR member_id = (
      SELECT id FROM studio_members
      WHERE user_id = (SELECT auth.uid()) AND studio_id = shoot_assignments.studio_id LIMIT 1
    )
  )
);

-- freelancer_payments
DROP POLICY IF EXISTS freelancer_payments_access ON freelancer_payments;
CREATE POLICY freelancer_payments_access ON freelancer_payments FOR ALL USING (
  studio_id = fn_my_studio_id()
  AND (
    fn_is_studio_owner(studio_id)
    OR member_id = (
      SELECT id FROM studio_members
      WHERE user_id = (SELECT auth.uid()) AND studio_id = freelancer_payments.studio_id LIMIT 1
    )
  )
);

-- notifications
DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- sessions
DROP POLICY IF EXISTS sessions_access ON sessions;
CREATE POLICY sessions_access ON sessions FOR ALL USING (user_id = (SELECT auth.uid()));

-- api_keys
DROP POLICY IF EXISTS api_keys_access ON api_keys;
CREATE POLICY api_keys_access ON api_keys FOR ALL USING (
  studio_id = fn_my_studio_id() AND fn_is_studio_owner(fn_my_studio_id())
);

-- platform_subscription_invoices
DROP POLICY IF EXISTS platform_invoices_select ON platform_subscription_invoices;
CREATE POLICY platform_invoices_select ON platform_subscription_invoices FOR SELECT
  USING (studio_id = fn_my_studio_id());

-- data_export_requests
DROP POLICY IF EXISTS export_requests_access ON data_export_requests;
CREATE POLICY export_requests_access ON data_export_requests FOR ALL USING (
  studio_id = fn_my_studio_id() AND fn_is_studio_owner(fn_my_studio_id())
);

-- feature_flags
DROP POLICY IF EXISTS feature_flags_select ON feature_flags;
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT
  USING (override_studio_id = fn_my_studio_id() OR override_studio_id IS NULL);

-- immich_sync_jobs
DROP POLICY IF EXISTS immich_jobs_access ON immich_sync_jobs;
CREATE POLICY immich_jobs_access ON immich_sync_jobs FOR ALL USING (studio_id = fn_my_studio_id());

-- photo_favorites
DROP POLICY IF EXISTS photo_favorites_studio ON photo_favorites;
CREATE POLICY photo_favorites_studio ON photo_favorites FOR SELECT USING (studio_id = fn_my_studio_id());

-- platform_admins
DROP POLICY IF EXISTS platform_admins_self ON platform_admins;
CREATE POLICY platform_admins_self ON platform_admins FOR SELECT USING (user_id = (SELECT auth.uid()));

-- admin_sessions
DROP POLICY IF EXISTS admin_sessions_self ON admin_sessions;
CREATE POLICY admin_sessions_self ON admin_sessions
  FOR ALL USING (
    admin_id = (
      SELECT id FROM platform_admins WHERE user_id = (SELECT auth.uid()) LIMIT 1
    )
  );

-- Bulk loop for generic tenant policies
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'service_packages', 'package_addons', 'studio_settings',
    'inquiry_form_configs', 'clients', 'leads', 'bookings',
    'booking_activity_feed', 'proposals', 'proposal_line_items',
    'contract_templates', 'contract_clause_library',
    'contracts', 'contract_revisions',
    'invoices', 'invoice_line_items', 'payments', 'refunds',
    'payment_disputes', 'expense_tracking',
    'billing_history', 'subscription_events',
    'shoot_briefs', 'member_unavailability',
    'file_upload_jobs', 'galleries', 'gallery_videos',
    'face_clusters', 'gallery_photos', 'gallery_share_logs',
    'automation_settings', 'automation_log', 'notifications',
    'client_portal_sessions', 'client_messages',
    'questionnaire_responses', 'revenue_snapshots',
    'media_files', 'studio_invitations', 'studio_onboarding_events',
    'nps_responses', 'member_permission_overrides'
  ]
  LOOP
    -- Drop previous policy name format from V2 loop
    EXECUTE format('DROP POLICY IF EXISTS %s_tenant ON %s;', t, t);
    
    -- Recreate with fixed fn_my_studio_id() (already updated above)
    EXECUTE format('
      CREATE POLICY %s_tenant ON %s
      USING (studio_id = fn_my_studio_id())
      WITH CHECK (studio_id = fn_my_studio_id());', t, t);
  END LOOP;
END $$;
