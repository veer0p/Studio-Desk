import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for integration tests')
}

export type AuthToken = { access_token: string; user_id: string }

let ownerCache: AuthToken | null = null
let photographerCache: AuthToken | null = null
let editorCache: AuthToken | null = null
let outsiderCache: AuthToken | null = null

async function signIn(email: string, password: string): Promise<AuthToken> {
  // @ts-expect-error: residual strict constraint
  const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session?.access_token || !data.user?.id) {
    throw new Error(`signIn failed for ${email}: ${error?.message ?? 'no session'}`)
  }
  return { access_token: data.session.access_token, user_id: data.user.id }
}

export async function getOwnerToken(): Promise<AuthToken> {
  if (!ownerCache) ownerCache = await signIn('owner@test.com', 'Test@1234')
  return ownerCache
}

export async function getPhotographerToken(): Promise<AuthToken> {
  if (!photographerCache) photographerCache = await signIn('photographer@test.com', 'Test@1234')
  return photographerCache
}

export async function getEditorToken(): Promise<AuthToken> {
  if (!editorCache) editorCache = await signIn('editor@test.com', 'Test@1234')
  return editorCache
}

export async function getOutsiderToken(): Promise<AuthToken> {
  if (!outsiderCache) outsiderCache = await signIn('outsider@test.com', 'Test@1234')
  return outsiderCache
}
