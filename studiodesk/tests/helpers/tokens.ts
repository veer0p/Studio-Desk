import { createClient } from '@supabase/supabase-js'

type NullableToken = string | null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const tokens = {
  owner: null as NullableToken,
  photographer: null as NullableToken,
  editor: null as NullableToken,
  outsider: null as NullableToken,
}

async function signIn(email: string, password: string): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session?.access_token) {
    throw new Error(`Failed login for ${email}: ${error?.message ?? 'no token'}`)
  }
  return data.session.access_token
}

export async function setupTokens() {
  tokens.owner = await signIn('owner@test.com', 'Test@1234')
  tokens.photographer = await signIn('photographer@test.com', 'Test@1234')
  tokens.editor = await signIn('editor@test.com', 'Test@1234')
  tokens.outsider = await signIn('outsider@test.com', 'Test@1234')
}

export { tokens }
