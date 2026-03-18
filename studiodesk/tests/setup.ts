import { beforeAll, afterEach } from 'vitest'
import { config } from 'dotenv'
import { join } from 'path'

// Load .env.test variables
config({ path: join(process.cwd(), '.env.test') })

beforeAll(async () => {
  // Global beforeAll: verify local Supabase is reachable, skip integration tests gracefully if not running
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not found in .env.test')
    return
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    })
    if (!res.ok && res.status !== 404) { // 404 might be expected if no tables yet
       console.warn(`Local Supabase at ${supabaseUrl} might not be reachable. Status: ${res.status}`)
    }
  } catch (error) {
    console.warn(`Local Supabase at ${supabaseUrl} is not reachable. Integration tests might fail.`)
  }
})

afterEach(() => {
  // Global afterEach: no cleanup needed (tests use unique IDs per run)
})
