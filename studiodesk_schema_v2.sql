-- ================================================================
--  STUDIODESK — Production Database Schema
--  PostgreSQL 15+ / Supabase Compatible
--  Version: 2.0.0
--
--  Changelog v2.0:
--  + RBAC: permissions, role_permissions, member_permission_overrides
--  + Platform Admin: platform_admins, admin_sessions, admin_audit_logs,
--    studio_impersonation_log, platform_settings, support_notes
--  + Payments: razorpay_webhook_events, refunds, payment_disputes,
--    subscription_events, promo_codes, platform_subscription_invoices
--  + Reference: indian_states, gst_rates, hsn_sac_codes
--  + Module gaps: studio_invitations, inquiry_form_configs,
--    contract_revisions, contract_clause_library, expense_tracking,
--    shoot_briefs, freelancer_payments, gallery_videos, file_upload_jobs,
--    gallery_share_logs, whatsapp_templates, email_templates,
--    client_messages, booking_activity_feed, feature_flags, api_keys
--  + Security: sessions, failed_login_attempts, data_export_requests,
--    immich_sync_jobs
--  + GTM: referral_codes, studio_onboarding_events, nps_responses
--  + Logs: error_logs, webhook_logs, payment_gateway_logs,
--    data_change_logs, security_events_log, background_job_logs,
--    email_delivery_logs, whatsapp_delivery_logs
-- ================================================================


-- ================================================================
--  1. EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";


-- ================================================================
--  2. ENUMS
-- ================================================================

-- ── User & Access ────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'owner',
  'photographer',
  'videographer',
  'editor',
  'assistant'
);

CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'support_agent',
  'billing_admin',
  'readonly_analyst'
);

CREATE TYPE permission_action AS ENUM (
  'view', 'create', 'update', 'delete', 'export', 'share', 'manage'
);

-- ── Business Pipeline ────────────────────────────────────────
CREATE TYPE lead_status AS ENUM (
  'new_lead', 'contacted', 'proposal_sent', 'contract_signed',
  'advance_paid', 'shoot_scheduled', 'delivered', 'closed', 'lost'
);

CREATE TYPE lead_source AS ENUM (
  'inquiry_form', 'referral', 'instagram', 'facebook',
  'google', 'walk_in', 'phone', 'other'
);

CREATE TYPE event_type AS ENUM (
  'wedding', 'pre_wedding', 'engagement', 'portrait', 'birthday',
  'corporate', 'product', 'maternity', 'newborn', 'other'
);

CREATE TYPE proposal_status AS ENUM (
  'draft', 'sent', 'accepted', 'rejected', 'expired'
);

CREATE TYPE contract_status AS ENUM (
  'draft', 'sent', 'signed', 'cancelled'
);

-- ── Financial ────────────────────────────────────────────────
CREATE TYPE invoice_type AS ENUM (
  'advance', 'balance', 'full', 'credit_note'
);

CREATE TYPE invoice_status AS ENUM (
  'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'upi', 'card', 'net_banking', 'wallet',
  'cash', 'neft', 'rtgs', 'cheque', 'other'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'processing', 'captured', 'failed', 'refunded'
);

CREATE TYPE gst_type AS ENUM (
  'cgst_sgst', 'igst', 'exempt'
);

CREATE TYPE refund_status AS ENUM (
  'initiated', 'processing', 'processed', 'failed', 'cancelled'
);

CREATE TYPE dispute_status AS ENUM (
  'open', 'under_review', 'won', 'lost', 'closed'
);

-- ── Gallery & Media ──────────────────────────────────────────
CREATE TYPE gallery_status AS ENUM (
  'processing', 'ready', 'published', 'expired', 'archived'
);

CREATE TYPE upload_job_status AS ENUM (
  'queued', 'uploading', 'processing', 'completed', 'failed', 'cancelled'
);

-- ── Automation & Notifications ───────────────────────────────
CREATE TYPE automation_type AS ENUM (
  'lead_acknowledgment', 'contract_reminder',
  'advance_payment_reminder', 'shoot_reminder_client',
  'shoot_assignment_team', 'gallery_ready',
  'balance_payment_reminder', 'review_request', 'custom'
);

CREATE TYPE automation_channel AS ENUM (
  'email', 'whatsapp', 'sms', 'in_app'
);

CREATE TYPE automation_status AS ENUM (
  'pending', 'sent', 'failed', 'skipped', 'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error'
);

CREATE TYPE whatsapp_template_status AS ENUM (
  'pending_approval', 'approved', 'rejected', 'disabled'
);

-- ── Platform & Subscription ──────────────────────────────────
CREATE TYPE plan_tier AS ENUM (
  'starter', 'studio', 'agency'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'cancelled', 'expired'
);

CREATE TYPE billing_cycle AS ENUM (
  'monthly', 'annual'
);

CREATE TYPE subscription_event_type AS ENUM (
  'trial_started', 'trial_ended', 'plan_activated',
  'plan_upgraded', 'plan_downgraded', 'payment_succeeded',
  'payment_failed', 'subscription_cancelled', 'subscription_renewed',
  'promo_applied', 'refund_issued'
);

-- ── Logging & Security ───────────────────────────────────────
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'login', 'logout',
  'payment', 'export', 'share'
);

CREATE TYPE security_event_type AS ENUM (
  'login_success', 'login_failed', 'login_blocked',
  'password_reset_requested', 'password_reset_completed',
  'mfa_enabled', 'mfa_disabled', 'suspicious_ip',
  'rate_limit_hit', 'unauthorized_access_attempt',
  'admin_impersonation_start', 'admin_impersonation_end',
  'api_key_created', 'api_key_revoked',
  'data_export_requested', 'data_export_downloaded',
  'session_revoked', 'account_locked', 'account_unlocked'
);

CREATE TYPE job_type AS ENUM (
  'send_automation', 'generate_invoice_pdf', 'generate_contract_pdf',
  'generate_proposal_pdf', 'sync_immich_upload', 'sync_immich_faces',
  'cleanup_expired_galleries', 'daily_revenue_snapshot',
  'cleanup_rate_limits', 'send_webhook', 'process_payment_webhook',
  'storage_quota_check', 'subscription_renewal_check'
);

CREATE TYPE job_status AS ENUM (
  'queued', 'running', 'completed', 'failed', 'timeout', 'cancelled'
);

CREATE TYPE error_severity AS ENUM (
  'debug', 'info', 'warning', 'error', 'critical'
);

CREATE TYPE webhook_direction AS ENUM (
  'inbound', 'outbound'
);

CREATE TYPE webhook_provider AS ENUM (
  'razorpay', 'interakt', 'aisensy', 'immich', 'supabase'
);

CREATE TYPE data_export_status AS ENUM (
  'requested', 'processing', 'ready', 'downloaded', 'expired', 'failed'
);

CREATE TYPE activity_event_type AS ENUM (
  'lead_created', 'lead_updated', 'lead_converted',
  'proposal_sent', 'proposal_accepted', 'proposal_rejected',
  'contract_sent', 'contract_signed', 'contract_reminded',
  'advance_invoice_sent', 'advance_payment_received',
  'balance_invoice_sent', 'balance_payment_received',
  'team_assigned', 'shoot_confirmed',
  'photos_uploaded', 'gallery_published', 'gallery_downloaded',
  'automation_sent', 'note_added', 'status_changed'
);


-- ================================================================
--  3. REFERENCE TABLES (seed data)
-- ================================================================

CREATE TABLE indian_states (
  id            SMALLSERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  code          VARCHAR(2)  NOT NULL UNIQUE,  -- GST state code e.g. '24'
  abbreviation  VARCHAR(4)  NOT NULL,         -- 'GJ', 'MH'
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO indian_states (name, code, abbreviation) VALUES
  ('Andhra Pradesh','37','AP'),('Arunachal Pradesh','12','AR'),
  ('Assam','18','AS'),('Bihar','10','BR'),('Chhattisgarh','22','CG'),
  ('Goa','30','GA'),('Gujarat','24','GJ'),('Haryana','06','HR'),
  ('Himachal Pradesh','02','HP'),('Jharkhand','20','JH'),
  ('Karnataka','29','KA'),('Kerala','32','KL'),
  ('Madhya Pradesh','23','MP'),('Maharashtra','27','MH'),
  ('Manipur','14','MN'),('Meghalaya','17','ML'),('Mizoram','15','MZ'),
  ('Nagaland','13','NL'),('Odisha','21','OD'),('Punjab','03','PB'),
  ('Rajasthan','08','RJ'),('Sikkim','11','SK'),('Tamil Nadu','33','TN'),
  ('Telangana','36','TG'),('Tripura','16','TR'),
  ('Uttar Pradesh','09','UP'),('Uttarakhand','05','UK'),
  ('West Bengal','19','WB'),('Andaman & Nicobar','35','AN'),
  ('Chandigarh','04','CH'),('Dadra & Nagar Haveli & Daman & Diu','26','DD'),
  ('Delhi','07','DL'),('Jammu & Kashmir','01','JK'),
  ('Ladakh','38','LA'),('Lakshadweep','31','LD'),('Puducherry','34','PY');

CREATE TABLE hsn_sac_codes (
  id            SMALLSERIAL PRIMARY KEY,
  code          VARCHAR(8)  NOT NULL UNIQUE,
  description   TEXT NOT NULL,
  service_type  TEXT NOT NULL,
  cgst_rate     NUMERIC(5,2) NOT NULL DEFAULT 9.00,
  sgst_rate     NUMERIC(5,2) NOT NULL DEFAULT 9.00,
  igst_rate     NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from DATE NOT NULL DEFAULT '2017-07-01',
  effective_to   DATE
);

INSERT INTO hsn_sac_codes (code, description, service_type) VALUES
  ('998389','Photography and related services','photography'),
  ('998392','Videography and related services','videography'),
  ('998391','Photo and video editing services','editing'),
  ('998313','Software as a service (SaaS)','saas'),
  ('999799','Other miscellaneous services','other');

CREATE TABLE gst_rates (
  id            SMALLSERIAL PRIMARY KEY,
  hsn_sac_code  VARCHAR(8) NOT NULL REFERENCES hsn_sac_codes(code),
  cgst_rate     NUMERIC(5,2) NOT NULL,
  sgst_rate     NUMERIC(5,2) NOT NULL,
  igst_rate     NUMERIC(5,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to   DATE,
  notification_ref TEXT,
  UNIQUE (hsn_sac_code, effective_from)
);

INSERT INTO gst_rates (hsn_sac_code, cgst_rate, sgst_rate, igst_rate, effective_from) VALUES
  ('998389', 9.00, 9.00, 18.00, '2017-07-01'),
  ('998392', 9.00, 9.00, 18.00, '2017-07-01'),
  ('998391', 9.00, 9.00, 18.00, '2017-07-01'),
  ('998313', 9.00, 9.00, 18.00, '2017-07-01'),
  ('999799', 9.00, 9.00, 18.00, '2017-07-01');

CREATE TABLE subscription_plans (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier                     plan_tier NOT NULL UNIQUE,
  name                     TEXT NOT NULL,
  monthly_price_inr        NUMERIC(10,2) NOT NULL,
  annual_price_inr         NUMERIC(10,2) NOT NULL,
  max_team_members         SMALLINT NOT NULL,
  max_bookings_per_month   INTEGER,
  storage_limit_gb         NUMERIC(8,2) NOT NULL,
  razorpay_monthly_plan_id TEXT,
  razorpay_annual_plan_id  TEXT,
  features                 JSONB DEFAULT '{}'::JSONB,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO subscription_plans
  (tier, name, monthly_price_inr, annual_price_inr,
   max_team_members, max_bookings_per_month, storage_limit_gb)
VALUES
  ('starter', 'Starter',  799.00,  7990.00,  1, 10,    50.00),
  ('studio',  'Studio',  1699.00, 16990.00,  3, NULL,  200.00),
  ('agency',  'Agency',  3499.00, 34990.00, 10, NULL, 1024.00);

CREATE TABLE platform_settings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key                       TEXT NOT NULL UNIQUE,
  value                     TEXT,
  value_json                JSONB,
  description               TEXT,
  is_public                 BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by                UUID,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (key, value, description, is_public) VALUES
  ('maintenance_mode',       'false',        'Set true to show maintenance page', false),
  ('default_trial_days',     '14',           'Trial period for new studios',      false),
  ('platform_gstin',         '',             'StudioDesk GSTIN for SaaS invoices',false),
  ('platform_sac_code',      '998313',       'SAC code for SaaS subscription',    false),
  ('support_email',          'support@studiodesk.in', 'Support email',            true),
  ('max_upload_size_mb',     '50',           'Max single file upload size',       false),
  ('immich_base_url',        '',             'Immich VPS base URL',               false),
  ('immich_api_key',         '',             'Immich admin API key (encrypted)',  false);


-- ================================================================
--  4. PLATFORM ADMIN
-- ================================================================

CREATE TABLE platform_admins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  role              admin_role NOT NULL DEFAULT 'support_agent',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_2fa_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at     TIMESTAMPTZ,
  last_login_ip     INET,
  login_count       INTEGER NOT NULL DEFAULT 0,
  notes             TEXT,
  created_by        UUID REFERENCES platform_admins(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id          UUID NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  session_token     TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(48), 'hex'),
  ip_address        INET NOT NULL,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours'),
  revoked_at        TIMESTAMPTZ,
  revoke_reason     TEXT
);

CREATE TABLE studio_impersonation_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id          UUID NOT NULL REFERENCES platform_admins(id),
  studio_id         UUID NOT NULL,
  reason            TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  ip_address        INET,
  actions_taken     TEXT[]
);

CREATE TABLE support_notes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL,
  admin_id          UUID NOT NULL REFERENCES platform_admins(id),
  note              TEXT NOT NULL,
  is_flagged        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_audit_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id          UUID REFERENCES platform_admins(id) ON DELETE SET NULL,
  action            TEXT NOT NULL,
  entity_type       TEXT,
  entity_id         UUID,
  old_value         JSONB,
  new_value         JSONB,
  ip_address        INET,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  5. RBAC — Permissions
-- ================================================================

CREATE TABLE permissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource          TEXT NOT NULL,        -- 'bookings', 'invoices', 'gallery'...
  action            permission_action NOT NULL,
  description       TEXT,
  UNIQUE (resource, action)
);

INSERT INTO permissions (resource, action, description) VALUES
  -- Bookings
  ('bookings','view',   'View booking details'),
  ('bookings','create', 'Create new bookings'),
  ('bookings','update', 'Edit booking details'),
  ('bookings','delete', 'Delete bookings'),
  -- Leads
  ('leads','view',   'View leads'),
  ('leads','create', 'Create new leads'),
  ('leads','update', 'Update lead status'),
  ('leads','delete', 'Delete leads'),
  -- Proposals
  ('proposals','view',   'View proposals'),
  ('proposals','create', 'Create proposals'),
  ('proposals','update', 'Edit proposals'),
  -- Contracts
  ('contracts','view',   'View contracts'),
  ('contracts','create', 'Create contracts'),
  ('contracts','update', 'Edit contracts'),
  -- Invoices
  ('invoices','view',   'View invoices'),
  ('invoices','create', 'Create invoices'),
  ('invoices','update', 'Edit invoices'),
  ('invoices','export', 'Export invoice data'),
  -- Payments
  ('payments','view',   'View payment records'),
  ('payments','create', 'Record manual payments'),
  -- Clients
  ('clients','view',   'View client details'),
  ('clients','create', 'Add new clients'),
  ('clients','update', 'Edit client details'),
  ('clients','delete', 'Delete clients'),
  -- Gallery
  ('gallery','view',    'View galleries'),
  ('gallery','create',  'Upload photos and create galleries'),
  ('gallery','update',  'Edit gallery settings'),
  ('gallery','delete',  'Delete galleries'),
  ('gallery','share',   'Share gallery with clients'),
  -- Team
  ('team','view',    'View team members'),
  ('team','manage',  'Invite and manage team members'),
  -- Settings
  ('settings','view',   'View studio settings'),
  ('settings','update', 'Change studio settings'),
  -- Reports
  ('reports','view',   'View analytics and reports'),
  ('reports','export', 'Export report data');

CREATE TABLE role_permissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role          user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (role, permission_id)
);

-- Seed role-permission matrix
DO $$
DECLARE
  p RECORD;
BEGIN
  -- OWNER: all permissions
  FOR p IN SELECT id FROM permissions LOOP
    INSERT INTO role_permissions (role, permission_id, granted)
    VALUES ('owner', p.id, TRUE)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- PHOTOGRAPHER: bookings view, gallery create/view, clients view, own assignments
  FOR p IN SELECT id FROM permissions
    WHERE (resource = 'bookings'  AND action = 'view')
       OR (resource = 'gallery'   AND action IN ('view','create'))
       OR (resource = 'clients'   AND action = 'view')
  LOOP
    INSERT INTO role_permissions (role, permission_id, granted)
    VALUES ('photographer', p.id, TRUE)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- VIDEOGRAPHER: same as photographer
  FOR p IN SELECT id FROM permissions
    WHERE (resource = 'bookings'  AND action = 'view')
       OR (resource = 'gallery'   AND action IN ('view','create'))
       OR (resource = 'clients'   AND action = 'view')
  LOOP
    INSERT INTO role_permissions (role, permission_id, granted)
    VALUES ('videographer', p.id, TRUE)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- EDITOR: gallery view/update, no financial access
  FOR p IN SELECT id FROM permissions
    WHERE (resource = 'gallery' AND action IN ('view','update'))
       OR (resource = 'bookings' AND action = 'view')
  LOOP
    INSERT INTO role_permissions (role, permission_id, granted)
    VALUES ('editor', p.id, TRUE)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- ASSISTANT: bookings view only
  FOR p IN SELECT id FROM permissions
    WHERE resource = 'bookings' AND action = 'view'
  LOOP
    INSERT INTO role_permissions (role, permission_id, granted)
    VALUES ('assistant', p.id, TRUE)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

CREATE TABLE member_permission_overrides (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL,
  member_id     UUID NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN NOT NULL,
  reason        TEXT,
  granted_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, permission_id)
);


-- ================================================================
--  6. CORE STUDIO TABLES (Module 1)
-- ================================================================

CREATE TABLE studios (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  tagline                 TEXT,
  logo_url                TEXT,
  brand_color             CHAR(7) DEFAULT '#1A3C5E',

  -- Business
  gstin                   VARCHAR(15),
  pan                     VARCHAR(10),
  business_address        TEXT,
  city                    TEXT,
  state                   TEXT NOT NULL DEFAULT 'Gujarat',
  state_id                SMALLINT REFERENCES indian_states(id),
  pincode                 VARCHAR(6),
  phone                   VARCHAR(15),
  email                   TEXT,
  website                 TEXT,

  -- Bank / payment
  bank_name               TEXT,
  bank_account_number     TEXT,
  bank_ifsc               VARCHAR(11),
  razorpay_account_id     TEXT,

  -- WhatsApp
  whatsapp_api_provider   TEXT,
  whatsapp_api_key        TEXT,
  whatsapp_phone          VARCHAR(15),

  -- Invoice settings
  invoice_prefix          TEXT NOT NULL DEFAULT 'INV',
  invoice_sequence        INTEGER NOT NULL DEFAULT 0,
  financial_year_start    DATE,
  default_advance_pct     NUMERIC(5,2) DEFAULT 30.00,
  default_hsn_code        VARCHAR(8) DEFAULT '998389',

  -- Subscription
  plan_tier               plan_tier NOT NULL DEFAULT 'starter',
  subscription_status     subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at           TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_id         TEXT,
  billing_cycle           billing_cycle DEFAULT 'monthly',
  current_period_start    DATE,
  current_period_end      DATE,
  promo_code_id           UUID,

  -- Storage
  storage_limit_gb        NUMERIC(8,2) NOT NULL DEFAULT 50.00,
  storage_used_gb         NUMERIC(8,2) NOT NULL DEFAULT 0.00,

  -- Onboarding
  onboarding_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step         SMALLINT NOT NULL DEFAULT 1,
  onboarding_completed_at TIMESTAMPTZ,

  -- Referral
  referred_by_studio_id   UUID REFERENCES studios(id) ON DELETE SET NULL,
  referral_code           TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),

  -- State
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at              TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT studios_brand_color_hex CHECK (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT studios_storage_non_negative CHECK (storage_used_gb >= 0),
  CONSTRAINT studios_advance_pct_valid CHECK (default_advance_pct BETWEEN 0 AND 100)
);

CREATE TABLE studio_members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              user_role NOT NULL DEFAULT 'photographer',
  display_name      TEXT,
  phone             VARCHAR(15),
  whatsapp          VARCHAR(15),
  specialization    TEXT[],
  profile_photo_url TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at    TIMESTAMPTZ,
  invited_by        UUID REFERENCES auth.users(id),
  invited_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, user_id)
);

CREATE TABLE studio_invitations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  invited_by        UUID NOT NULL REFERENCES studio_members(id),
  email             TEXT NOT NULL,
  role              user_role NOT NULL DEFAULT 'photographer',
  token             TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  accepted_at       TIMESTAMPTZ,
  resent_count      SMALLINT NOT NULL DEFAULT 0,
  last_resent_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, email)
);

CREATE TABLE service_packages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  event_type        event_type NOT NULL,
  description       TEXT,
  base_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  hsn_sac_code      VARCHAR(8) DEFAULT '998389',
  is_gst_applicable BOOLEAN NOT NULL DEFAULT TRUE,
  deliverables      TEXT[],
  turnaround_days   SMALLINT DEFAULT 30,
  line_items        JSONB DEFAULT '[]'::JSONB,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        SMALLINT DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE package_addons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit              TEXT DEFAULT 'flat',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE studio_settings (
  id                               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id                        UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE UNIQUE,
  notify_new_lead_email            BOOLEAN NOT NULL DEFAULT TRUE,
  notify_new_lead_whatsapp         BOOLEAN NOT NULL DEFAULT TRUE,
  notify_payment_email             BOOLEAN NOT NULL DEFAULT TRUE,
  notify_payment_whatsapp          BOOLEAN NOT NULL DEFAULT TRUE,
  invoice_footer_text              TEXT,
  invoice_terms                    TEXT DEFAULT 'Payment is due as per agreed schedule.',
  invoice_bank_details_visible     BOOLEAN NOT NULL DEFAULT TRUE,
  gallery_default_expiry_days      SMALLINT DEFAULT 90,
  gallery_watermark_default        BOOLEAN NOT NULL DEFAULT FALSE,
  email_from_name                  TEXT,
  email_reply_to                   TEXT,
  timezone                         TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at                       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feature_flags (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_name         TEXT NOT NULL,
  description       TEXT,
  is_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  enabled_for_tiers plan_tier[] DEFAULT ARRAY['agency']::plan_tier[],
  override_studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flag_name, override_studio_id)
);

INSERT INTO feature_flags (flag_name, description, is_enabled, enabled_for_tiers) VALUES
  ('video_delivery',      'Video upload and delivery', FALSE, ARRAY['agency']::plan_tier[]),
  ('custom_domain',       'Custom gallery domain',     FALSE, ARRAY['agency']::plan_tier[]),
  ('api_access',          'API key access',            FALSE, ARRAY['agency']::plan_tier[]),
  ('multi_brand',         'Multiple studio brands',    FALSE, ARRAY['agency']::plan_tier[]),
  ('expense_tracking',    'Expense tracking per booking', FALSE, ARRAY['studio','agency']::plan_tier[]),
  ('advanced_analytics',  'Advanced analytics dashboard', FALSE, ARRAY['studio','agency']::plan_tier[]);


-- ================================================================
--  7. LEAD CAPTURE & CRM (Module 2)
-- ================================================================

CREATE TABLE inquiry_form_configs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id           UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE UNIQUE,
  form_title          TEXT NOT NULL DEFAULT 'Book Your Photography Session',
  form_subtitle       TEXT,
  background_color    CHAR(7) DEFAULT '#FFFFFF',
  button_text         TEXT NOT NULL DEFAULT 'Send Inquiry',
  button_color        CHAR(7) DEFAULT '#1A3C5E',
  success_message     TEXT DEFAULT 'Thank you! We will get back to you within 24 hours.',

  -- Field toggles
  show_event_type     BOOLEAN NOT NULL DEFAULT TRUE,
  show_event_date     BOOLEAN NOT NULL DEFAULT TRUE,
  show_venue          BOOLEAN NOT NULL DEFAULT TRUE,
  show_guest_count    BOOLEAN NOT NULL DEFAULT FALSE,
  show_budget         BOOLEAN NOT NULL DEFAULT TRUE,
  show_message        BOOLEAN NOT NULL DEFAULT TRUE,

  -- Required field overrides
  require_email       BOOLEAN NOT NULL DEFAULT TRUE,
  require_phone       BOOLEAN NOT NULL DEFAULT TRUE,
  require_event_date  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Spam protection
  enable_recaptcha    BOOLEAN NOT NULL DEFAULT FALSE,
  recaptcha_site_key  TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(15),
  whatsapp        VARCHAR(15),
  address         TEXT,
  city            TEXT,
  state           TEXT,
  state_id        SMALLINT REFERENCES indian_states(id),
  pincode         VARCHAR(6),
  company_name    TEXT,
  gstin           VARCHAR(15),
  notes           TEXT,
  tags            TEXT[],
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  client_id             UUID REFERENCES clients(id) ON DELETE SET NULL,
  event_type            event_type,
  event_date_approx     DATE,
  venue                 TEXT,
  guest_count_approx    INTEGER,
  budget_min            NUMERIC(12,2),
  budget_max            NUMERIC(12,2),
  status                lead_status NOT NULL DEFAULT 'new_lead',
  source                lead_source NOT NULL DEFAULT 'inquiry_form',
  priority              SMALLINT DEFAULT 2,
  assigned_to           UUID REFERENCES studio_members(id) ON DELETE SET NULL,
  follow_up_at          TIMESTAMPTZ,
  last_contacted_at     TIMESTAMPTZ,
  form_data             JSONB DEFAULT '{}'::JSONB,
  converted_to_booking  BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id            UUID,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  8. CENTRAL BOOKING ENTITY
-- ================================================================

CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  lead_id               UUID REFERENCES leads(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  event_type            event_type NOT NULL,
  event_date            DATE NOT NULL,
  event_end_date        DATE,
  event_time            TIME,
  venue_name            TEXT,
  venue_address         TEXT,
  venue_city            TEXT,
  venue_state           TEXT,
  venue_state_id        SMALLINT REFERENCES indian_states(id),
  package_id            UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  package_snapshot      JSONB,
  total_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_amount        NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - advance_amount) STORED,
  amount_paid           NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_pending        NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  gst_type              gst_type NOT NULL DEFAULT 'cgst_sgst',
  subtotal              NUMERIC(12,2) NOT NULL DEFAULT 0,
  cgst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  sgst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  igst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_total             NUMERIC(12,2) GENERATED ALWAYS AS (cgst_amount + sgst_amount + igst_amount) STORED,
  status                lead_status NOT NULL DEFAULT 'contract_signed',
  notes                 TEXT,
  internal_notes        TEXT,
  expected_delivery_date DATE,
  delivered_at          TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_advance_lte_total CHECK (advance_amount <= total_amount)
);

ALTER TABLE leads ADD CONSTRAINT leads_booking_id_fk
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

CREATE TABLE booking_activity_feed (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type    activity_event_type NOT NULL,
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name    TEXT,
  actor_type    TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'system' | 'client'
  metadata      JSONB DEFAULT '{}'::JSONB,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  9. PROPOSALS (Module 3)
-- ================================================================

CREATE TABLE proposals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version         SMALLINT NOT NULL DEFAULT 1,
  status          proposal_status NOT NULL DEFAULT 'draft',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_type        gst_type NOT NULL DEFAULT 'cgst_sgst',
  cgst_rate       NUMERIC(5,2) DEFAULT 9.00,
  sgst_rate       NUMERIC(5,2) DEFAULT 9.00,
  igst_rate       NUMERIC(5,2) DEFAULT 18.00,
  cgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  sgst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  igst_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  valid_until     DATE,
  notes           TEXT,
  sent_at         TIMESTAMPTZ,
  viewed_at       TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  access_token    TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  pdf_url         TEXT,
  pdf_generated_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proposal_line_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id   UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sort_order    SMALLINT DEFAULT 0,
  item_type     TEXT NOT NULL DEFAULT 'service',
  name          TEXT NOT NULL,
  description   TEXT,
  hsn_sac_code  VARCHAR(8) DEFAULT '998389',
  quantity      NUMERIC(8,2) NOT NULL DEFAULT 1,
  unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price   NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  addon_id      UUID REFERENCES package_addons(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  10. CONTRACTS (Module 4)
-- ================================================================

CREATE TABLE contract_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  event_type    event_type,
  content_html  TEXT NOT NULL,
  version       SMALLINT NOT NULL DEFAULT 1,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX contract_templates_one_default_per_studio
  ON contract_templates (studio_id)
  WHERE is_default = TRUE;

CREATE TABLE contract_clause_library (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  clause_name   TEXT NOT NULL,
  clause_content TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contracts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id           UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  status                contract_status NOT NULL DEFAULT 'draft',
  content_html          TEXT NOT NULL,
  signed_at             TIMESTAMPTZ,
  signature_data        TEXT,
  signed_ip             INET,
  signed_user_agent     TEXT,
  studio_signed_at      TIMESTAMPTZ,
  studio_signature_data TEXT,
  sent_at               TIMESTAMPTZ,
  viewed_at             TIMESTAMPTZ,
  reminder_sent_at      TIMESTAMPTZ,
  access_token          TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  signed_pdf_url        TEXT,
  pdf_generated_at      TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contract_revisions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id       UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  requested_by      TEXT NOT NULL DEFAULT 'client',
  revision_note     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID REFERENCES auth.users(id),
  resolution_note   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  11. INVOICING & PAYMENTS (Module 5)
-- ================================================================

CREATE TABLE invoices (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id                 UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id                UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id                 UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number            TEXT NOT NULL,
  invoice_type              invoice_type NOT NULL DEFAULT 'advance',
  status                    invoice_status NOT NULL DEFAULT 'draft',
  subtotal                  NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_type                  gst_type NOT NULL DEFAULT 'cgst_sgst',
  cgst_rate                 NUMERIC(5,2) DEFAULT 9.00,
  sgst_rate                 NUMERIC(5,2) DEFAULT 9.00,
  igst_rate                 NUMERIC(5,2) DEFAULT 18.00,
  cgst_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
  sgst_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
  igst_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid               NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_due                NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  hsn_sac_code              VARCHAR(8) DEFAULT '998389',
  place_of_supply           TEXT,
  place_of_supply_state_id  SMALLINT REFERENCES indian_states(id),
  credit_note_for           UUID REFERENCES invoices(id) ON DELETE SET NULL,
  due_date                  DATE,
  paid_at                   TIMESTAMPTZ,
  razorpay_order_id         TEXT UNIQUE,
  razorpay_payment_link_id  TEXT UNIQUE,
  payment_link_url          TEXT,
  payment_link_expires_at   TIMESTAMPTZ,
  sent_at                   TIMESTAMPTZ,
  viewed_at                 TIMESTAMPTZ,
  access_token              TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  pdf_url                   TEXT,
  pdf_generated_at          TIMESTAMPTZ,
  notes                     TEXT,
  internal_notes            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, invoice_number),
  CONSTRAINT invoices_total_non_negative CHECK (total_amount >= 0)
);

CREATE TABLE invoice_line_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sort_order    SMALLINT DEFAULT 0,
  name          TEXT NOT NULL,
  description   TEXT,
  hsn_sac_code  VARCHAR(8) DEFAULT '998389',
  quantity      NUMERIC(8,2) NOT NULL DEFAULT 1,
  unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price   NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  invoice_id            UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount                NUMERIC(12,2) NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'INR',
  method                payment_method NOT NULL,
  status                payment_status NOT NULL DEFAULT 'pending',
  razorpay_payment_id   TEXT UNIQUE,
  razorpay_order_id     TEXT,
  razorpay_signature    TEXT,
  reference_number      TEXT,
  payment_date          DATE,
  bank_name             TEXT,
  notes                 TEXT,
  captured_at           TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,
  failure_reason        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

CREATE TABLE refunds (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  payment_id            UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount                NUMERIC(12,2) NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'INR',
  status                refund_status NOT NULL DEFAULT 'initiated',
  reason                TEXT NOT NULL,
  razorpay_refund_id    TEXT UNIQUE,
  initiated_by          UUID REFERENCES auth.users(id),
  initiated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at          TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,
  failure_reason        TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT refunds_amount_positive CHECK (amount > 0)
);

CREATE TABLE payment_disputes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  payment_id            UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  razorpay_dispute_id   TEXT UNIQUE NOT NULL,
  amount                NUMERIC(12,2) NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'INR',
  reason                TEXT,
  status                dispute_status NOT NULL DEFAULT 'open',
  evidence_due_date     DATE,
  evidence_submitted_at TIMESTAMPTZ,
  evidence_data         JSONB,
  resolved_at           TIMESTAMPTZ,
  resolution            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expense_tracking (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,  -- 'assistant_fee','travel','equipment','food','other'
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  is_reimbursable BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url     TEXT,
  incurred_by     UUID REFERENCES studio_members(id) ON DELETE SET NULL,
  incurred_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expense_amount_positive CHECK (amount > 0)
);

-- Platform SaaS subscription invoices (StudioDesk bills studios)
CREATE TABLE platform_subscription_invoices (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  invoice_number        TEXT NOT NULL UNIQUE,
  billing_history_id    UUID,
  plan_tier             plan_tier NOT NULL,
  billing_cycle         billing_cycle NOT NULL,
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  subtotal              NUMERIC(10,2) NOT NULL,
  cgst_amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
  sgst_amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
  igst_amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount          NUMERIC(10,2) NOT NULL,
  hsn_sac_code          VARCHAR(8) DEFAULT '998313',  -- SaaS SAC code
  platform_gstin        TEXT,
  studio_gstin          TEXT,
  status                invoice_status NOT NULL DEFAULT 'sent',
  paid_at               TIMESTAMPTZ,
  razorpay_payment_id   TEXT,
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing_history (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id                 UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  plan_tier                 plan_tier NOT NULL,
  billing_cycle             billing_cycle NOT NULL,
  amount_inr                NUMERIC(10,2) NOT NULL,
  currency                  CHAR(3) NOT NULL DEFAULT 'INR',
  razorpay_payment_id       TEXT,
  razorpay_subscription_id  TEXT,
  period_start              DATE NOT NULL,
  period_end                DATE NOT NULL,
  status                    payment_status NOT NULL DEFAULT 'pending',
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  event_type      subscription_event_type NOT NULL,
  from_tier       plan_tier,
  to_tier         plan_tier,
  amount_inr      NUMERIC(10,2),
  razorpay_ref    TEXT,
  promo_code_id   UUID,
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE promo_codes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  description       TEXT,
  discount_type     TEXT NOT NULL DEFAULT 'percent',  -- 'percent' | 'flat'
  discount_value    NUMERIC(10,2) NOT NULL,
  max_uses          INTEGER,
  used_count        INTEGER NOT NULL DEFAULT 0,
  applicable_tiers  plan_tier[] DEFAULT ARRAY['starter','studio','agency']::plan_tier[],
  valid_from        DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until       DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID REFERENCES platform_admins(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT promo_discount_valid CHECK (discount_value > 0),
  CONSTRAINT promo_uses_valid CHECK (max_uses IS NULL OR max_uses > 0)
);


-- ================================================================
--  12. TEAM & SCHEDULING (Module 6)
-- ================================================================

CREATE TABLE shoot_assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES studio_members(id) ON DELETE CASCADE,
  role              user_role NOT NULL,
  call_time         TIMESTAMPTZ NOT NULL,
  call_location     TEXT,
  notes             TEXT,
  is_confirmed      BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at      TIMESTAMPTZ,
  notified_at       TIMESTAMPTZ,
  reminder_sent_at  TIMESTAMPTZ,
  day_rate          NUMERIC(12,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, member_id)
);

CREATE TABLE shoot_briefs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  event_flow            TEXT,
  key_shots             TEXT[],
  people_to_capture     JSONB DEFAULT '[]'::JSONB,
  venue_access_notes    TEXT,
  parking_info          TEXT,
  contact_on_day        TEXT,
  contact_phone         VARCHAR(15),
  special_instructions  TEXT,
  equipment_needed      TEXT[],
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE freelancer_payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  assignment_id     UUID NOT NULL REFERENCES shoot_assignments(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES studio_members(id) ON DELETE CASCADE,
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount            NUMERIC(12,2) NOT NULL,
  payment_method    payment_method NOT NULL DEFAULT 'neft',
  status            payment_status NOT NULL DEFAULT 'pending',
  reference_number  TEXT,
  paid_at           DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT freelancer_payment_positive CHECK (amount > 0)
);

CREATE TABLE member_unavailability (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES studio_members(id) ON DELETE CASCADE,
  unavailable_date  DATE NOT NULL,
  reason            TEXT,
  all_day           BOOLEAN NOT NULL DEFAULT TRUE,
  start_time        TIME,
  end_time          TIME,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  13. AI PHOTO DELIVERY (Module 7)
-- ================================================================

CREATE TABLE file_upload_jobs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  gallery_id        UUID,   -- FK added after galleries table
  status            upload_job_status NOT NULL DEFAULT 'queued',
  total_files       INTEGER NOT NULL DEFAULT 0,
  processed_files   INTEGER NOT NULL DEFAULT 0,
  failed_files      INTEGER NOT NULL DEFAULT 0,
  total_size_mb     NUMERIC(12,2) NOT NULL DEFAULT 0,
  processed_size_mb NUMERIC(12,2) NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  error_log         JSONB DEFAULT '[]'::JSONB,
  retry_count       SMALLINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE galleries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  immich_album_id       TEXT UNIQUE,
  immich_library_id     TEXT,
  status                gallery_status NOT NULL DEFAULT 'processing',
  total_photos          INTEGER NOT NULL DEFAULT 0,
  total_videos          INTEGER NOT NULL DEFAULT 0,
  total_size_mb         NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_published          BOOLEAN NOT NULL DEFAULT FALSE,
  published_at          TIMESTAMPTZ,
  is_download_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  download_enabled_at   TIMESTAMPTZ,
  password              TEXT,
  expires_at            TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  watermark_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  watermark_opacity     NUMERIC(3,2) DEFAULT 0.30,
  watermark_position    TEXT DEFAULT 'bottom_right',
  slug                  TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  access_token          TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  view_count            INTEGER NOT NULL DEFAULT 0,
  download_count        INTEGER NOT NULL DEFAULT 0,
  unique_visitors       INTEGER NOT NULL DEFAULT 0,
  last_viewed_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT galleries_expiry_valid CHECK (expires_at > created_at)
);

ALTER TABLE file_upload_jobs ADD CONSTRAINT file_upload_jobs_gallery_fk
  FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE;

CREATE TABLE gallery_videos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id        UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  immich_asset_id   TEXT,
  filename          TEXT NOT NULL,
  file_size_mb      NUMERIC(10,4),
  duration_seconds  INTEGER,
  resolution        TEXT,
  codec             TEXT,
  thumbnail_url     TEXT,
  stream_url        TEXT,
  download_url      TEXT,
  taken_at          TIMESTAMPTZ,
  is_highlight_reel BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE face_clusters (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id              UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  studio_id               UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  immich_person_id        TEXT,
  immich_face_id          TEXT,
  label                   TEXT,
  is_labeled              BOOLEAN NOT NULL DEFAULT FALSE,
  photo_count             INTEGER NOT NULL DEFAULT 0,
  representative_photo_url TEXT,
  qr_code_url             TEXT,
  qr_access_token         TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  qr_generated_at         TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT face_clusters_photo_count_non_negative CHECK (photo_count >= 0)
);

CREATE TABLE gallery_photos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id        UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  immich_asset_id   TEXT NOT NULL,
  filename          TEXT,
  file_size_mb      NUMERIC(8,4),
  width             INTEGER,
  height            INTEGER,
  taken_at          TIMESTAMPTZ,
  face_cluster_ids  UUID[],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_share_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id    UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,   -- 'view' | 'download' | 'share' | 'favorite'
  photo_id      UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  cluster_token TEXT,
  ip_address    INET,
  user_agent    TEXT,
  country_code  CHAR(2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guest_selfie_lookups (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id          UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  face_cluster_id     UUID REFERENCES face_clusters(id) ON DELETE SET NULL,
  selfie_url          TEXT,
  matched_photo_count INTEGER DEFAULT 0,
  ip_address          INET,
  looked_up_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE photo_favorites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id    UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id      UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  guest_token   TEXT,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gallery_id, photo_id, guest_token)
);


-- ================================================================
--  14. AUTOMATIONS (Module 8)
-- ================================================================

CREATE TABLE whatsapp_templates (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID REFERENCES studios(id) ON DELETE CASCADE,
  automation_type       automation_type NOT NULL,
  template_name         TEXT NOT NULL,
  provider              TEXT NOT NULL DEFAULT 'interakt',
  provider_template_id  TEXT,
  language              TEXT NOT NULL DEFAULT 'en',
  category              TEXT NOT NULL DEFAULT 'utility',
  body_text             TEXT NOT NULL,
  variables             TEXT[],
  status                whatsapp_template_status NOT NULL DEFAULT 'pending_approval',
  approved_at           TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, automation_type, language)
);

CREATE TABLE email_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID REFERENCES studios(id) ON DELETE CASCADE,
  automation_type   automation_type NOT NULL,
  name              TEXT NOT NULL,
  subject           TEXT NOT NULL,
  html_body         TEXT NOT NULL,
  text_body         TEXT,
  variables_used    TEXT[],
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automation_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  automation_type       automation_type NOT NULL,
  is_enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  trigger_delay_hours   INTEGER DEFAULT 0,
  trigger_offset_days   INTEGER DEFAULT 0,
  send_email            BOOLEAN NOT NULL DEFAULT TRUE,
  send_whatsapp         BOOLEAN NOT NULL DEFAULT TRUE,
  send_sms              BOOLEAN NOT NULL DEFAULT FALSE,
  custom_subject        TEXT,
  custom_message        TEXT,
  email_template_id     UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  whatsapp_template_id  UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, automation_type)
);

CREATE TABLE automation_log (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id            UUID REFERENCES bookings(id) ON DELETE SET NULL,
  lead_id               UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id             UUID REFERENCES clients(id) ON DELETE SET NULL,
  automation_type       automation_type NOT NULL,
  channel               automation_channel NOT NULL,
  status                automation_status NOT NULL DEFAULT 'pending',
  recipient_phone       VARCHAR(15),
  recipient_email       TEXT,
  subject               TEXT,
  message_body          TEXT,
  provider_message_id   TEXT,
  provider_response     JSONB,
  scheduled_for         TIMESTAMPTZ,
  sent_at               TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,
  failure_reason        TEXT,
  retry_count           SMALLINT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          notification_type NOT NULL DEFAULT 'info',
  title         TEXT NOT NULL,
  body          TEXT,
  link          TEXT,
  entity_type   TEXT,
  entity_id     UUID,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  15. CLIENT PORTAL (Module 9)
-- ================================================================

CREATE TABLE client_portal_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES bookings(id) ON DELETE CASCADE,
  magic_token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
  is_used           BOOLEAN NOT NULL DEFAULT FALSE,
  used_at           TIMESTAMPTZ,
  session_token     TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  session_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  ip_address        INET,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_type   TEXT NOT NULL DEFAULT 'client',  -- 'client' | 'studio'
  sender_id     UUID,
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  attachment_urls TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questionnaire_responses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  booking_id            UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  must_have_shots       TEXT[],
  people_to_photograph  JSONB DEFAULT '[]'::JSONB,
  venue_access_notes    TEXT,
  highlight_song        TEXT,
  highlight_song_artist TEXT,
  ceremony_details      TEXT,
  vendor_contacts       JSONB DEFAULT '[]'::JSONB,
  special_instructions  TEXT,
  submitted_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  16. ANALYTICS (Module 10)
-- ================================================================

CREATE TABLE revenue_snapshots (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  snapshot_date         DATE NOT NULL,
  total_bookings        INTEGER NOT NULL DEFAULT 0,
  new_leads             INTEGER NOT NULL DEFAULT 0,
  invoices_sent         INTEGER NOT NULL DEFAULT 0,
  revenue_collected     NUMERIC(14,2) NOT NULL DEFAULT 0,
  revenue_pending       NUMERIC(14,2) NOT NULL DEFAULT 0,
  photos_delivered      INTEGER NOT NULL DEFAULT 0,
  storage_used_gb       NUMERIC(8,4) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (studio_id, snapshot_date),
  CONSTRAINT revenue_snapshots_non_negative CHECK (
    total_bookings >= 0 AND revenue_collected >= 0
  )
);


-- ================================================================
--  17. SETTINGS & ADMIN (Module 11)
-- ================================================================

CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  key_prefix    TEXT NOT NULL,         -- first 8 chars, shown in UI
  key_hash      TEXT NOT NULL UNIQUE,  -- bcrypt hash of full key
  scopes        TEXT[] NOT NULL DEFAULT ARRAY['bookings:read'],
  last_used_at  TIMESTAMPTZ,
  last_used_ip  INET,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES auth.users(id),
  revoked_at    TIMESTAMPTZ,
  revoked_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  18. SECURITY TABLES
-- ================================================================

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id       UUID REFERENCES studios(id) ON DELETE CASCADE,
  session_token   TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(48), 'hex'),
  ip_address      INET NOT NULL,
  user_agent      TEXT,
  device_info     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  revoked_at      TIMESTAMPTZ,
  revoke_reason   TEXT
);

CREATE TABLE failed_login_attempts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT,
  ip_address    INET NOT NULL,
  attempted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  was_blocked   BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent    TEXT
);

CREATE TABLE data_export_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  requested_by    UUID NOT NULL REFERENCES auth.users(id),
  request_type    TEXT NOT NULL DEFAULT 'full',  -- 'full' | 'bookings' | 'clients'
  status          data_export_status NOT NULL DEFAULT 'requested',
  download_url    TEXT,
  file_size_bytes BIGINT,
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  downloaded_at   TIMESTAMPTZ,
  failed_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE immich_sync_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  gallery_id      UUID REFERENCES galleries(id) ON DELETE SET NULL,
  upload_job_id   UUID REFERENCES file_upload_jobs(id) ON DELETE SET NULL,
  operation       TEXT NOT NULL,  -- 'upload'|'face_detect'|'cluster'|'label'|'delete'
  immich_asset_ids TEXT[],
  status          job_status NOT NULL DEFAULT 'queued',
  retry_count     SMALLINT NOT NULL DEFAULT 0,
  max_retries     SMALLINT NOT NULL DEFAULT 3,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_message   TEXT,
  response_data   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  19. GTM TABLES
-- ================================================================

CREATE TABLE referral_codes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  owner_studio_id   UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  reward_type       TEXT NOT NULL DEFAULT 'free_month',
  reward_value      INTEGER NOT NULL DEFAULT 1,  -- months
  max_uses          INTEGER DEFAULT 10,
  used_count        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at        DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referral_redemptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code_id  UUID NOT NULL REFERENCES referral_codes(id),
  referrer_studio_id UUID NOT NULL REFERENCES studios(id),
  referred_studio_id UUID NOT NULL REFERENCES studios(id) UNIQUE,
  referrer_rewarded_at TIMESTAMPTZ,
  referred_rewarded_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE studio_onboarding_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  step_number     SMALLINT NOT NULL,
  step_name       TEXT NOT NULL,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_sec  INTEGER,
  skipped         BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (studio_id, step_number)
);

CREATE TABLE nps_responses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  score         SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment       TEXT,
  category      TEXT,   -- auto-classified: 'promoter'|'passive'|'detractor'
  survey_source TEXT DEFAULT 'in_app',
  surveyed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media_files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id       UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  storage_path    TEXT NOT NULL,
  public_url      TEXT,
  file_name       TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================================
--  20. LOGGING TABLES (PostgreSQL — financial & security only)
-- ================================================================

CREATE TABLE error_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id           UUID,
  user_id             UUID,
  severity            error_severity NOT NULL DEFAULT 'error',
  error_code          TEXT,
  error_message       TEXT NOT NULL,
  stack_trace         TEXT,
  request_url         TEXT,
  request_method      VARCHAR(10),
  response_status     SMALLINT,
  environment         TEXT NOT NULL DEFAULT 'production',
  context             JSONB DEFAULT '{}'::JSONB,
  is_resolved         BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at         TIMESTAMPTZ,
  resolved_by         UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID,
  direction             webhook_direction NOT NULL DEFAULT 'inbound',
  provider              webhook_provider NOT NULL,
  event_type            TEXT NOT NULL,
  payload               JSONB NOT NULL DEFAULT '{}'::JSONB,
  signature_valid       BOOLEAN,
  processing_status     TEXT NOT NULL DEFAULT 'received',
  processing_error      TEXT,
  idempotency_key       TEXT UNIQUE,
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_gateway_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID,
  operation             TEXT NOT NULL,
  razorpay_request_id   TEXT,
  request_payload       JSONB DEFAULT '{}'::JSONB,
  response_payload      JSONB DEFAULT '{}'::JSONB,
  http_status_code      SMALLINT,
  response_time_ms      INTEGER,
  success               BOOLEAN NOT NULL DEFAULT FALSE,
  error_code            TEXT,
  error_description     TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_change_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID,
  user_id       UUID,
  table_name    TEXT NOT NULL,
  record_id     UUID NOT NULL,
  field_name    TEXT NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_events_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id           UUID,
  user_id             UUID,
  event_type          security_event_type NOT NULL,
  ip_address          INET,
  user_agent          TEXT,
  country_code        CHAR(2),
  risk_score          SMALLINT DEFAULT 0,
  additional_context  JSONB DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE background_job_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id     UUID,
  job_type      job_type NOT NULL,
  job_id        TEXT,
  status        job_status NOT NULL DEFAULT 'queued',
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  duration_ms   INTEGER,
  error_message TEXT,
  retry_count   SMALLINT NOT NULL DEFAULT 0,
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_delivery_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID,
  automation_log_id     UUID REFERENCES automation_log(id) ON DELETE SET NULL,
  provider              TEXT NOT NULL DEFAULT 'resend',
  to_email              TEXT NOT NULL,
  from_email            TEXT NOT NULL,
  subject               TEXT NOT NULL,
  template_type         automation_type,
  provider_message_id   TEXT UNIQUE,
  status                TEXT NOT NULL DEFAULT 'queued',
  opened_at             TIMESTAMPTZ,
  clicked_at            TIMESTAMPTZ,
  bounce_reason         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_delivery_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id             UUID,
  automation_log_id     UUID REFERENCES automation_log(id) ON DELETE SET NULL,
  provider              TEXT NOT NULL DEFAULT 'interakt',
  to_phone              VARCHAR(15) NOT NULL,
  template_name         TEXT,
  provider_message_id   TEXT UNIQUE,
  status                TEXT NOT NULL DEFAULT 'queued',
  sent_at               TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  read_at               TIMESTAMPTZ,
  failure_code          TEXT,
  failure_reason        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id         UUID,
  user_id           UUID,
  action            audit_action NOT NULL,
  entity_type       TEXT NOT NULL,
  entity_id         UUID,
  entity_snapshot   JSONB,
  ip_address        INET,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_limits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key           TEXT NOT NULL UNIQUE,
  hit_count     INTEGER NOT NULL DEFAULT 1,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ
);


-- ================================================================
--  21. INDEXES
-- ================================================================

-- ── Studios ──────────────────────────────────────────────────
CREATE INDEX idx_studios_slug           ON studios (slug);
CREATE INDEX idx_studios_plan_tier      ON studios (plan_tier);
CREATE INDEX idx_studios_active         ON studios (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_studios_referral_code  ON studios (referral_code);
CREATE INDEX idx_studios_subscription   ON studios (subscription_status, trial_ends_at);

-- ── Studio Members ───────────────────────────────────────────
CREATE INDEX idx_members_studio         ON studio_members (studio_id);
CREATE INDEX idx_members_user           ON studio_members (user_id);
CREATE INDEX idx_members_role           ON studio_members (studio_id, role);
CREATE INDEX idx_members_active         ON studio_members (studio_id, is_active);

-- ── RBAC ─────────────────────────────────────────────────────
CREATE INDEX idx_role_permissions_role  ON role_permissions (role);
CREATE INDEX idx_perm_overrides_member  ON member_permission_overrides (member_id, studio_id);

-- ── Clients ──────────────────────────────────────────────────
CREATE INDEX idx_clients_studio         ON clients (studio_id);
CREATE INDEX idx_clients_phone          ON clients (studio_id, phone);
CREATE INDEX idx_clients_email          ON clients (studio_id, email);
CREATE INDEX idx_clients_name_trgm      ON clients USING gin (full_name gin_trgm_ops);

-- ── Leads ────────────────────────────────────────────────────
CREATE INDEX idx_leads_studio           ON leads (studio_id);
CREATE INDEX idx_leads_status           ON leads (studio_id, status);
CREATE INDEX idx_leads_event_date       ON leads (studio_id, event_date_approx);
CREATE INDEX idx_leads_follow_up        ON leads (studio_id, follow_up_at) WHERE follow_up_at IS NOT NULL;
CREATE INDEX idx_leads_created          ON leads (studio_id, created_at DESC);

-- ── Bookings ─────────────────────────────────────────────────
CREATE INDEX idx_bookings_studio        ON bookings (studio_id);
CREATE INDEX idx_bookings_client        ON bookings (client_id);
CREATE INDEX idx_bookings_event_date    ON bookings (studio_id, event_date);
CREATE INDEX idx_bookings_status        ON bookings (studio_id, status);
CREATE INDEX idx_bookings_calendar      ON bookings (studio_id, event_date, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_pending_pay   ON bookings (studio_id, amount_pending) WHERE amount_pending > 0;

-- ── Booking Activity Feed ────────────────────────────────────
CREATE INDEX idx_activity_booking       ON booking_activity_feed (booking_id, created_at DESC);
CREATE INDEX idx_activity_studio        ON booking_activity_feed (studio_id, created_at DESC);

-- ── Proposals ────────────────────────────────────────────────
CREATE INDEX idx_proposals_booking      ON proposals (booking_id);
CREATE INDEX idx_proposals_status       ON proposals (studio_id, status);
CREATE INDEX idx_proposals_token        ON proposals (access_token);

-- ── Contracts ────────────────────────────────────────────────
CREATE INDEX idx_contracts_booking      ON contracts (booking_id);
CREATE INDEX idx_contracts_status       ON contracts (studio_id, status);
CREATE INDEX idx_contracts_token        ON contracts (access_token);
CREATE INDEX idx_contracts_unsigned     ON contracts (studio_id, sent_at) WHERE status = 'sent' AND signed_at IS NULL;

-- ── Invoices ─────────────────────────────────────────────────
CREATE INDEX idx_invoices_studio        ON invoices (studio_id);
CREATE INDEX idx_invoices_booking       ON invoices (booking_id);
CREATE INDEX idx_invoices_status        ON invoices (studio_id, status);
CREATE INDEX idx_invoices_due_date      ON invoices (studio_id, due_date) WHERE status != 'paid';
CREATE INDEX idx_invoices_token         ON invoices (access_token);
CREATE INDEX idx_invoices_overdue       ON invoices (studio_id, due_date, status) WHERE status IN ('sent','partially_paid');

-- ── Payments ─────────────────────────────────────────────────
CREATE INDEX idx_payments_studio        ON payments (studio_id);
CREATE INDEX idx_payments_invoice       ON payments (invoice_id);
CREATE INDEX idx_payments_booking       ON payments (booking_id);
CREATE INDEX idx_payments_razorpay      ON payments (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX idx_payments_date          ON payments (studio_id, created_at DESC);

-- ── Refunds ──────────────────────────────────────────────────
CREATE INDEX idx_refunds_payment        ON refunds (payment_id);
CREATE INDEX idx_refunds_booking        ON refunds (booking_id);
CREATE INDEX idx_refunds_status         ON refunds (studio_id, status);

-- ── Expenses ─────────────────────────────────────────────────
CREATE INDEX idx_expenses_booking       ON expense_tracking (booking_id);
CREATE INDEX idx_expenses_studio        ON expense_tracking (studio_id);

-- ── Shoot Assignments ────────────────────────────────────────
CREATE INDEX idx_assignments_booking    ON shoot_assignments (booking_id);
CREATE INDEX idx_assignments_member     ON shoot_assignments (member_id);
CREATE INDEX idx_assignments_date       ON shoot_assignments (studio_id, call_time);

-- ── File Upload Jobs ─────────────────────────────────────────
CREATE INDEX idx_upload_jobs_gallery    ON file_upload_jobs (gallery_id);
CREATE INDEX idx_upload_jobs_status     ON file_upload_jobs (studio_id, status);

-- ── Galleries ────────────────────────────────────────────────
CREATE INDEX idx_galleries_studio       ON galleries (studio_id);
CREATE INDEX idx_galleries_booking      ON galleries (booking_id);
CREATE INDEX idx_galleries_status       ON galleries (studio_id, status);
CREATE INDEX idx_galleries_slug         ON galleries (slug);
CREATE INDEX idx_galleries_token        ON galleries (access_token);

-- ── Face Clusters ────────────────────────────────────────────
CREATE INDEX idx_clusters_gallery       ON face_clusters (gallery_id);
CREATE INDEX idx_clusters_token         ON face_clusters (qr_access_token);

-- ── Gallery Share Logs ───────────────────────────────────────
CREATE INDEX idx_share_logs_gallery     ON gallery_share_logs (gallery_id, created_at DESC);
CREATE INDEX idx_share_logs_type        ON gallery_share_logs (gallery_id, event_type);

-- ── Automation ───────────────────────────────────────────────
CREATE INDEX idx_auto_log_studio        ON automation_log (studio_id);
CREATE INDEX idx_auto_log_booking       ON automation_log (booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_auto_log_pending       ON automation_log (status, scheduled_for) WHERE status = 'pending';

-- ── Notifications ────────────────────────────────────────────
CREATE INDEX idx_notif_user             ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notif_unread           ON notifications (user_id) WHERE is_read = FALSE;

-- ── Sessions ─────────────────────────────────────────────────
CREATE INDEX idx_sessions_user          ON sessions (user_id);
CREATE INDEX idx_sessions_token         ON sessions (session_token);
CREATE INDEX idx_sessions_active        ON sessions (user_id, expires_at) WHERE revoked_at IS NULL;

-- ── Failed Logins ────────────────────────────────────────────
CREATE INDEX idx_failed_logins_ip       ON failed_login_attempts (ip_address, attempted_at DESC);
CREATE INDEX idx_failed_logins_email    ON failed_login_attempts (email, attempted_at DESC) WHERE email IS NOT NULL;

-- ── Immich Sync Jobs ─────────────────────────────────────────
CREATE INDEX idx_immich_jobs_gallery    ON immich_sync_jobs (gallery_id);
CREATE INDEX idx_immich_jobs_status     ON immich_sync_jobs (studio_id, status);

-- ── Logs ─────────────────────────────────────────────────────
CREATE INDEX idx_error_logs_studio      ON error_logs (studio_id, created_at DESC) WHERE studio_id IS NOT NULL;
CREATE INDEX idx_error_logs_severity    ON error_logs (severity, created_at DESC);
CREATE INDEX idx_error_logs_unresolved  ON error_logs (severity, is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_webhook_logs_idem      ON webhook_logs (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_webhook_logs_provider  ON webhook_logs (provider, event_type, created_at DESC);
CREATE INDEX idx_pgw_logs_studio        ON payment_gateway_logs (studio_id, created_at DESC) WHERE studio_id IS NOT NULL;
CREATE INDEX idx_data_change_record     ON data_change_logs (table_name, record_id, changed_at DESC);
CREATE INDEX idx_security_events_user   ON security_events_log (user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_events_ip     ON security_events_log (ip_address, created_at DESC);
CREATE INDEX idx_security_events_type   ON security_events_log (event_type, created_at DESC);
CREATE INDEX idx_bg_jobs_type           ON background_job_logs (job_type, status, created_at DESC);
CREATE INDEX idx_audit_entity           ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_studio           ON audit_logs (studio_id, created_at DESC);


-- ================================================================
--  22. TRIGGERS & FUNCTIONS
-- ================================================================

-- ── Auto updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'studios','studio_members','studio_settings',
    'service_packages','package_addons','inquiry_form_configs',
    'clients','leads','bookings',
    'proposals','contract_templates','contract_clause_library',
    'contracts','contract_revisions',
    'invoices','payments','refunds','payment_disputes','expense_tracking',
    'shoot_assignments','shoot_briefs','freelancer_payments',
    'galleries','face_clusters',
    'file_upload_jobs','immich_sync_jobs',
    'automation_settings','whatsapp_templates','email_templates',
    'studio_invitations','data_export_requests',
    'questionnaire_responses','client_messages',
    'platform_admins','support_notes',
    'feature_flags','api_keys',
    'email_delivery_logs','whatsapp_delivery_logs'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();', t, t);
  END LOOP;
END $$;

-- ── Invoice number generation ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_studio   RECORD;
  v_fy_label TEXT;
  v_next_seq INTEGER;
BEGIN
  SELECT * INTO v_studio FROM studios WHERE id = NEW.studio_id FOR UPDATE;

  IF EXTRACT(MONTH FROM NOW()) >= 4 THEN
    v_fy_label := 'FY' || TO_CHAR(NOW(), 'YY') || TO_CHAR(NOW() + INTERVAL '1 year', 'YY');
  ELSE
    v_fy_label := 'FY' || TO_CHAR(NOW() - INTERVAL '1 year', 'YY') || TO_CHAR(NOW(), 'YY');
  END IF;

  UPDATE studios SET invoice_sequence = invoice_sequence + 1 WHERE id = NEW.studio_id;
  SELECT invoice_sequence INTO v_next_seq FROM studios WHERE id = NEW.studio_id;

  NEW.invoice_number := v_studio.invoice_prefix || '-' || v_fy_label || '-' || LPAD(v_next_seq::TEXT, 4, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_invoices_generate_number
  BEFORE INSERT ON invoices
  FOR EACH ROW WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION fn_generate_invoice_number();

-- ── Sync booking.amount_paid on payment capture ──────────────
CREATE OR REPLACE FUNCTION fn_sync_booking_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_total_paid NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM payments WHERE booking_id = NEW.booking_id AND status = 'captured';
  UPDATE bookings SET amount_paid = v_total_paid, updated_at = NOW() WHERE id = NEW.booking_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_payments_sync_booking
  AFTER INSERT OR UPDATE ON payments FOR EACH ROW
  EXECUTE FUNCTION fn_sync_booking_payment();

-- ── Sync invoice.amount_paid + status ────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_invoice_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_total_paid NUMERIC; v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(p.amount), 0), i.total_amount
    INTO v_total_paid, v_total
    FROM payments p JOIN invoices i ON i.id = p.invoice_id
    WHERE p.invoice_id = NEW.invoice_id AND p.status = 'captured'
    GROUP BY i.total_amount;

  UPDATE invoices SET
    amount_paid = v_total_paid,
    status = CASE
      WHEN v_total_paid >= v_total THEN 'paid'::invoice_status
      WHEN v_total_paid > 0        THEN 'partially_paid'::invoice_status
      ELSE status END,
    paid_at = CASE
      WHEN v_total_paid >= v_total AND paid_at IS NULL THEN NOW()
      ELSE paid_at END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_payments_sync_invoice
  AFTER INSERT OR UPDATE ON payments FOR EACH ROW
  EXECUTE FUNCTION fn_sync_invoice_payment();

-- ── Auto-unlock gallery on full invoice payment ──────────────
CREATE OR REPLACE FUNCTION fn_unlock_gallery_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE galleries SET
      is_download_enabled = TRUE,
      download_enabled_at = NOW(),
      updated_at = NOW()
    WHERE booking_id = NEW.booking_id AND is_download_enabled = FALSE;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_invoice_unlock_gallery
  AFTER UPDATE ON invoices FOR EACH ROW
  EXECUTE FUNCTION fn_unlock_gallery_on_payment();

-- ── Studio storage sync from gallery ────────────────────────
CREATE OR REPLACE FUNCTION fn_update_studio_storage()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE studios SET
      storage_used_gb = storage_used_gb + COALESCE(NEW.total_size_mb / 1024.0, 0),
      updated_at = NOW()
    WHERE id = NEW.studio_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE studios SET
      storage_used_gb = GREATEST(0, storage_used_gb - COALESCE(OLD.total_size_mb / 1024.0, 0)),
      updated_at = NOW()
    WHERE id = OLD.studio_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE studios SET
      storage_used_gb = GREATEST(0, storage_used_gb
        - COALESCE(OLD.total_size_mb / 1024.0, 0)
        + COALESCE(NEW.total_size_mb / 1024.0, 0)),
      updated_at = NOW()
    WHERE id = NEW.studio_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER trg_gallery_storage_sync
  AFTER INSERT OR UPDATE OR DELETE ON galleries FOR EACH ROW
  EXECUTE FUNCTION fn_update_studio_storage();

-- ── Audit log trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF    TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (entity_type, entity_id, action, entity_snapshot)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (entity_type, entity_id, action, entity_snapshot)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (entity_type, entity_id, action)
    VALUES (TG_TABLE_NAME, NEW.id, 'create');
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bookings','invoices','payments','refunds','contracts','galleries'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_audit
       AFTER INSERT OR UPDATE OR DELETE ON %s
       FOR EACH ROW EXECUTE FUNCTION fn_audit_log();', t, t);
  END LOOP;
END $$;

-- ── Auto data_change_log for sensitive fields ────────────────
CREATE OR REPLACE FUNCTION fn_data_change_log()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_old JSONB; v_new JSONB; k TEXT; v_old_val TEXT; v_new_val TEXT;
BEGIN
  v_old := row_to_json(OLD)::JSONB;
  v_new := row_to_json(NEW)::JSONB;
  FOR k IN SELECT jsonb_object_keys(v_new) LOOP
    v_old_val := v_old ->> k;
    v_new_val := v_new ->> k;
    IF v_old_val IS DISTINCT FROM v_new_val
       AND k NOT IN ('updated_at','last_active_at','view_count','download_count')
    THEN
      INSERT INTO data_change_logs (table_name, record_id, field_name, old_value, new_value)
      VALUES (TG_TABLE_NAME, NEW.id, k, v_old_val, v_new_val);
    END IF;
  END LOOP;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_invoices_change_log
  AFTER UPDATE ON invoices FOR EACH ROW
  EXECUTE FUNCTION fn_data_change_log();

CREATE TRIGGER trg_bookings_change_log
  AFTER UPDATE ON bookings FOR EACH ROW
  EXECUTE FUNCTION fn_data_change_log();

-- ── Auto-create studio_settings on studio insert ─────────────
CREATE OR REPLACE FUNCTION fn_create_studio_defaults()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO studio_settings (studio_id) VALUES (NEW.id);
  INSERT INTO inquiry_form_configs (studio_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_studios_create_defaults
  AFTER INSERT ON studios FOR EACH ROW
  EXECUTE FUNCTION fn_create_studio_defaults();

-- ── Booking activity feed auto-entries ───────────────────────
CREATE OR REPLACE FUNCTION fn_booking_activity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO booking_activity_feed (studio_id, booking_id, event_type, actor_type, note)
    VALUES (NEW.studio_id, NEW.id, 'lead_converted', 'system', 'Booking created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_activity_feed (studio_id, booking_id, event_type, actor_type,
      metadata, note)
    VALUES (NEW.studio_id, NEW.id, 'status_changed', 'system',
      jsonb_build_object('from', OLD.status, 'to', NEW.status),
      'Status changed to ' || NEW.status);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bookings_activity
  AFTER INSERT OR UPDATE ON bookings FOR EACH ROW
  EXECUTE FUNCTION fn_booking_activity();

-- ── Rate limit cleanup ────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_cleanup_rate_limits()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END; $$;

-- ── NPS auto-categorize ───────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_categorize_nps()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.category := CASE
    WHEN NEW.score >= 9 THEN 'promoter'
    WHEN NEW.score >= 7 THEN 'passive'
    ELSE 'detractor'
  END;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_nps_categorize
  BEFORE INSERT ON nps_responses FOR EACH ROW
  EXECUTE FUNCTION fn_categorize_nps();


-- ================================================================
--  23. ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'studios','studio_members','studio_invitations',
    'service_packages','package_addons','studio_settings',
    'inquiry_form_configs','feature_flags',
    'clients','leads','bookings','booking_activity_feed',
    'proposals','proposal_line_items',
    'contract_templates','contract_clause_library',
    'contracts','contract_revisions',
    'invoices','invoice_line_items','payments','refunds',
    'payment_disputes','expense_tracking',
    'platform_subscription_invoices','billing_history',
    'subscription_events',
    'shoot_assignments','shoot_briefs',
    'freelancer_payments','member_unavailability',
    'file_upload_jobs','galleries','gallery_videos',
    'face_clusters','gallery_photos','gallery_share_logs',
    'guest_selfie_lookups','photo_favorites',
    'whatsapp_templates','email_templates',
    'automation_settings','automation_log','notifications',
    'client_portal_sessions','client_messages',
    'questionnaire_responses',
    'api_keys','sessions','data_export_requests',
    'immich_sync_jobs',
    'referral_codes','referral_redemptions',
    'studio_onboarding_events','nps_responses',
    'media_files','revenue_snapshots',
    'member_permission_overrides',
    'support_notes'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- ── Helper functions ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_my_studio_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT studio_id FROM studio_members
  WHERE user_id = auth.uid() AND is_active = TRUE LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_is_studio_owner(p_studio_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM studio_members
    WHERE studio_id = p_studio_id
      AND user_id   = auth.uid()
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
    WHERE sm.user_id   = auth.uid()
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
    WHERE sm2.user_id   = auth.uid()
      AND sm2.is_active = TRUE
      AND p2.resource   = p_resource
      AND p2.action     = p_action
      AND mpo.granted   = TRUE
  );
$$;

-- ── Studios ──────────────────────────────────────────────────
CREATE POLICY studios_select ON studios FOR SELECT USING (id = fn_my_studio_id());
CREATE POLICY studios_update ON studios FOR UPDATE USING (fn_is_studio_owner(id));

-- ── Studio Members ───────────────────────────────────────────
CREATE POLICY members_select ON studio_members FOR SELECT USING (studio_id = fn_my_studio_id());
CREATE POLICY members_insert ON studio_members FOR INSERT WITH CHECK (fn_is_studio_owner(studio_id));
CREATE POLICY members_update ON studio_members FOR UPDATE USING (fn_is_studio_owner(studio_id));
CREATE POLICY members_delete ON studio_members FOR DELETE USING (fn_is_studio_owner(studio_id));

-- ── Generic tenant policy (owner + permission check) ─────────
-- Applied to all business tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'service_packages', 'package_addons', 'studio_settings',
    'inquiry_form_configs', 'clients', 'leads', 'bookings',
    'booking_activity_feed', 'proposals',
    'contract_templates', 'contract_clause_library',
    'contracts', 'contract_revisions',
    'invoices', 'payments', 'refunds',
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
    EXECUTE format('
      CREATE POLICY %s_tenant ON %s
      USING (studio_id = fn_my_studio_id())
      WITH CHECK (studio_id = fn_my_studio_id());', t, t);
  END LOOP;
END $$;

-- referral_codes uses owner_studio_id (not studio_id)
CREATE POLICY referral_codes_tenant ON referral_codes
  FOR ALL
  USING (owner_studio_id = fn_my_studio_id())
  WITH CHECK (owner_studio_id = fn_my_studio_id());

-- referral_redemptions has two studio columns
CREATE POLICY referral_redemptions_tenant ON referral_redemptions
  FOR ALL
  USING (
    referrer_studio_id = fn_my_studio_id()
    OR referred_studio_id = fn_my_studio_id()
  );

-- ── Shoot assignments — team sees own ────────────────────────
CREATE POLICY shoot_assignments_access ON shoot_assignments FOR ALL USING (
  studio_id = fn_my_studio_id()
  AND (
    fn_is_studio_owner(studio_id)
    OR member_id = (
      SELECT id FROM studio_members
      WHERE user_id = auth.uid() AND studio_id = shoot_assignments.studio_id LIMIT 1
    )
  )
);

-- ── Freelancer payments — team sees own ──────────────────────
CREATE POLICY freelancer_payments_access ON freelancer_payments FOR ALL USING (
  studio_id = fn_my_studio_id()
  AND (
    fn_is_studio_owner(studio_id)
    OR member_id = (
      SELECT id FROM studio_members
      WHERE user_id = auth.uid() AND studio_id = freelancer_payments.studio_id LIMIT 1
    )
  )
);

-- ── Notifications — per user ──────────────────────────────────
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ── Sessions — per user ───────────────────────────────────────
CREATE POLICY sessions_access ON sessions FOR ALL USING (user_id = auth.uid());

-- ── API keys — owner only ─────────────────────────────────────
CREATE POLICY api_keys_access ON api_keys FOR ALL USING (
  studio_id = fn_my_studio_id() AND fn_is_studio_owner(fn_my_studio_id())
);

-- ── Platform subscription invoices ───────────────────────────
CREATE POLICY platform_invoices_select ON platform_subscription_invoices FOR SELECT
  USING (studio_id = fn_my_studio_id());

-- ── Data export requests ──────────────────────────────────────
CREATE POLICY export_requests_access ON data_export_requests FOR ALL USING (
  studio_id = fn_my_studio_id() AND fn_is_studio_owner(fn_my_studio_id())
);

-- ── Feature flags — read only for studios ────────────────────
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT
  USING (override_studio_id = fn_my_studio_id() OR override_studio_id IS NULL);

-- ── Immich sync jobs ──────────────────────────────────────────
CREATE POLICY immich_jobs_access ON immich_sync_jobs FOR ALL USING (studio_id = fn_my_studio_id());

-- ── Support notes — studio cannot see own support notes ──────
-- (Platform admin only — no RLS policy for studios)

-- ── Guest-accessible (no studio auth) ────────────────────────
CREATE POLICY guest_selfie_insert ON guest_selfie_lookups FOR INSERT WITH CHECK (TRUE);
CREATE POLICY photo_favorites_insert ON photo_favorites FOR INSERT WITH CHECK (TRUE);
CREATE POLICY photo_favorites_studio ON photo_favorites FOR SELECT USING (studio_id = fn_my_studio_id());


-- ================================================================
--  24. VIEWS
-- ================================================================

CREATE OR REPLACE VIEW v_bookings_overview AS
SELECT b.id, b.studio_id, b.title, b.event_type, b.event_date,
       b.status, b.total_amount, b.amount_paid, b.amount_pending,
       c.full_name AS client_name, c.phone AS client_phone,
       b.venue_name, b.venue_city, b.created_at
FROM bookings b JOIN clients c ON c.id = b.client_id
WHERE b.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_outstanding_invoices AS
SELECT i.id, i.studio_id, i.invoice_number, i.invoice_type,
       i.status, i.total_amount, i.amount_due, i.due_date,
       i.payment_link_url,
       c.full_name AS client_name, c.phone AS client_phone,
       b.title AS booking_title, b.event_date
FROM invoices i
JOIN clients  c ON c.id = i.client_id
JOIN bookings b ON b.id = i.booking_id
WHERE i.status IN ('sent','partially_paid','overdue') AND i.amount_due > 0;

CREATE OR REPLACE VIEW v_todays_shoots AS
SELECT b.id AS booking_id, b.studio_id, b.title, b.event_type,
       b.event_date, b.event_time, b.venue_name, b.venue_address,
       c.full_name AS client_name, c.phone AS client_phone,
       sa.call_time, sm.display_name AS assigned_member, sm.role
FROM bookings b
JOIN clients c ON c.id = b.client_id
LEFT JOIN shoot_assignments sa ON sa.booking_id = b.id
LEFT JOIN studio_members sm    ON sm.id = sa.member_id
WHERE b.event_date = CURRENT_DATE AND b.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_studio_storage AS
SELECT s.id, s.name, s.plan_tier, s.storage_used_gb, s.storage_limit_gb,
       ROUND((s.storage_used_gb / NULLIF(s.storage_limit_gb,0)) * 100, 1) AS usage_pct,
       (s.storage_limit_gb - s.storage_used_gb) AS storage_available_gb
FROM studios s WHERE s.is_active = TRUE;

CREATE OR REPLACE VIEW v_pending_automations AS
SELECT al.id, al.studio_id, al.booking_id, al.automation_type,
       al.channel, al.scheduled_for, al.recipient_email, al.recipient_phone
FROM automation_log al
WHERE al.status = 'pending' AND al.scheduled_for <= NOW() + INTERVAL '5 minutes';

CREATE OR REPLACE VIEW v_unresolved_errors AS
SELECT id, studio_id, severity, error_code, error_message,
       request_url, created_at
FROM error_logs
WHERE is_resolved = FALSE
ORDER BY
  CASE severity WHEN 'critical' THEN 1 WHEN 'error' THEN 2 WHEN 'warning' THEN 3 ELSE 4 END,
  created_at DESC;


-- ================================================================
--  25. CRON JOBS (requires pg_cron extension in Supabase)
-- ================================================================
-- Run after enabling pg_cron via Supabase dashboard:
--
-- SELECT cron.schedule('cleanup-rate-limits',
--   '0 * * * *', $$ SELECT fn_cleanup_rate_limits() $$);
--
-- SELECT cron.schedule('daily-revenue-snapshot',
--   '0 2 * * *', $$
--     INSERT INTO revenue_snapshots (studio_id, snapshot_date,
--       total_bookings, revenue_collected, revenue_pending)
--     SELECT s.id, CURRENT_DATE,
--       COUNT(DISTINCT b.id),
--       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'captured'), 0),
--       COALESCE(SUM(b.amount_pending), 0)
--     FROM studios s
--     LEFT JOIN bookings b ON b.studio_id = s.id AND b.event_date >= DATE_TRUNC('month', CURRENT_DATE)
--     LEFT JOIN payments p ON p.studio_id = s.id AND DATE(p.created_at) = CURRENT_DATE
--     WHERE s.is_active = TRUE
--     GROUP BY s.id
--     ON CONFLICT (studio_id, snapshot_date) DO UPDATE SET
--       total_bookings = EXCLUDED.total_bookings,
--       revenue_collected = EXCLUDED.revenue_collected,
--       revenue_pending = EXCLUDED.revenue_pending;
--   $$);
--
-- SELECT cron.schedule('expire-galleries',
--   '0 3 * * *', $$
--     UPDATE galleries SET status = 'expired', updated_at = NOW()
--     WHERE expires_at < NOW() AND status = 'published';
--   $$);
--
-- SELECT cron.schedule('expire-portal-sessions',
--   '0 4 * * *', $$
--     UPDATE client_portal_sessions
--     SET is_used = TRUE, used_at = NOW()
--     WHERE token_expires_at < NOW() AND is_used = FALSE;
--   $$);
--
-- SELECT cron.schedule('check-overdue-invoices',
--   '0 9 * * *', $$
--     UPDATE invoices SET status = 'overdue', updated_at = NOW()
--     WHERE due_date < CURRENT_DATE
--       AND status IN ('sent','partially_paid');
--   $$);


-- ================================================================
--  26. SCHEMA SUMMARY
-- ================================================================
-- Tables:          62
-- Enums:           26
-- Indexes:         90+
-- Triggers:        30+
-- Views:           6
-- Functions:       15
-- Reference rows:  indian_states(36), hsn_sac_codes(5),
--                  gst_rates(5), subscription_plans(3),
--                  platform_settings(8), permissions(34),
--                  role_permissions(seeded), feature_flags(6)
--
-- Log strategy:
--   PostgreSQL  → payment_gateway_logs, webhook_logs,
--                 data_change_logs, security_events_log,
--                 background_job_logs, error_logs,
--                 email_delivery_logs, whatsapp_delivery_logs,
--                 audit_logs
--   External    → High-volume API/session/feature logs
--                 → Axiom / Betterstack (free tiers available)
--   Error track → Sentry (not duplicated in DB)
--
-- ================================================================
-- End of StudioDesk Schema v2.0
-- ================================================================
