import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { Database } from '@/types/supabase'

/**
 * WARNING: This client uses the service_role key.
 * ONLY for webhooks, cron jobs, background workers, or admin operations.
 * NEVER use this on the client side or in a way that exposes it to users.
 */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Helper to get current studio context for a user
 */
export async function getCurrentStudio(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('studio_members')
    .select('studio_id, role, id, studios(*)')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    studio_id: data.studio_id as string,
    role: data.role as string,
    member_id: data.id as string,
    studio: data.studios,
  }
}
