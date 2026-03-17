import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest } from 'next/server';

type ErrorLogParams = {
  message: string;
  stack?: string;
  studioId?: string;
  userId?: string;
  severity?: 'error' | 'warning' | 'info';
  requestUrl?: string;
  context?: Record<string, any>;
};

/**
 * logError
 * 
 * Inserts into error_logs table. Fails silently to avoid infinite loops or blocking users.
 */
export async function logError({
  message,
  stack,
  studioId,
  userId,
  severity = 'error',
  requestUrl,
  context,
}: ErrorLogParams) {
  try {
    const supabase = createAdminClient();
    
    await supabase.from('error_logs').insert({
      message,
      stack_trace: stack,
      studio_id: studioId,
      user_id: userId,
      severity,
      request_url: requestUrl,
      context,
    });
  } catch (err) {
    // Fallback to console in development
    console.error('Logging failed:', message, err);
  }
}

type SecurityEventParams = {
  eventType: string;
  req: NextRequest;
  studioId?: string;
  userId?: string;
  context?: Record<string, any>;
};

/**
 * logSecurityEvent
 * 
 * Inserts into security_events_log. Extracts metadata from the request automatically.
 */
export async function logSecurityEvent({
  eventType,
  req,
  studioId,
  userId,
  context,
}: SecurityEventParams) {
  try {
    const supabase = createAdminClient();
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await supabase.from('security_events_log').insert({
      event_type: eventType,
      studio_id: studioId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      context,
    });
  } catch (err) {
    console.error('Security logging failed:', eventType, err);
  }
}
