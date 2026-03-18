import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
// TODO: Run `npx supabase gen types typescript --local --schema public > types/database.ts`
// import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
