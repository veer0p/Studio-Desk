-- Disable email confirmation for new signups
-- This allows users to sign up without needing to click a confirmation link
-- Applied: 2026-04-10

UPDATE auth.config
SET enable_confirmations = false;

-- Also update the site URL for proper redirect
UPDATE auth.config 
SET site_url = 'http://localhost:3000';
