/**
 * Integration tests hit local Supabase + real route handlers.
 * Loads env before any `@/` imports in test modules (via vitest config order).
 */
import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })
config({ path: join(process.cwd(), '.env') })
config({ path: join(process.cwd(), '.env.test') })
