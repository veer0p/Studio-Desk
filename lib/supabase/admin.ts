import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { Database } from '@/types/database';

/**
 * ADMIN CLIENT
 * 
 * WARNING: This client uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security (RLS).
 * ONLY use this in:
 * - Webhook handlers (Razorpay, WhatsApp)
 * - Cron jobs / Automations
 * - System-level logging / Error tracking
 * - Background processes
 * 
 * NEVER use this in client components or regular API routes that don't require admin privileges.
 */
export const createAdminClient = () => {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

/**
 * Helper to fetch a studio and its member for a given user.
 * Frequently used in admin/background tasks.
 */
export async function getCurrentStudio(userId: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('studio_members')
    .select('*, studios(*)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
