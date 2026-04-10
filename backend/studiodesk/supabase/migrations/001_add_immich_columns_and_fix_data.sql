-- Add missing columns to studios table
-- Applied: 2026-04-10

-- Add Immich integration columns
ALTER TABLE studios
ADD COLUMN IF NOT EXISTS immich_user_id TEXT,
ADD COLUMN IF NOT EXISTS immich_api_key TEXT;

-- Expand booking_activity_feed event_type enum
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'booking_created';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'booking_updated';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'booking_deleted';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'status_changed';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'payment_recorded';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'gallery_shared';
ALTER TYPE activity_event_type
ADD VALUE IF NOT EXISTS 'notes_added';

-- Fix: Update duplicate bookings - keep the most recent one, mark others as deleted
-- These are bookings with same client_id + event_date + title
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY client_id, event_date, title ORDER BY created_at DESC) as rn
  FROM bookings
  WHERE deleted_at IS NULL
  AND (client_id, event_date, title) IN (
    SELECT client_id, event_date, title
    FROM bookings
    WHERE deleted_at IS NULL
    GROUP BY client_id, event_date, title
    HAVING COUNT(*) > 1
  )
)
UPDATE bookings
SET deleted_at = NOW(),
    updated_at = NOW()
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Fix: Update invoice with partially paid amount that's incorrectly marked as overdue
UPDATE invoices
SET status = 'partially_paid',
    updated_at = NOW()
WHERE status = 'overdue'
  AND amount_paid > 0
  AND amount_paid < total_amount;

-- Fix: Update zero-amount bookings in contract_signed status
UPDATE bookings
SET status = 'proposal_sent'
WHERE status = 'contract_signed'
  AND total_amount = 0
  AND deleted_at IS NULL;

-- Fix: Update gallery with 0 photos but ready status
UPDATE galleries
SET status = 'processing'
WHERE status = 'ready'
  AND total_photos = 0
  AND total_videos = 0;
