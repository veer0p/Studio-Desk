-- =====================================================
-- Add 2FA TOTP secret storage to platform_admins
-- Date: 2026-04-12
-- =====================================================

ALTER TABLE platform_admins
  ADD COLUMN IF NOT EXISTS totp_secret TEXT;

-- Add index for faster 2FA status lookups
CREATE INDEX IF NOT EXISTS idx_platform_admins_2fa
  ON platform_admins (role, is_2fa_enabled) WHERE is_active = true;
