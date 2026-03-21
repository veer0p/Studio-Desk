import { NextRequest } from 'next/server'
import { createClient, createClientFromAccessToken } from '@/lib/supabase/server'
import { getMemberByUserId } from '@/lib/supabase/queries'
import { Errors } from '@/lib/errors'

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const bearer =
    authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''

  const supabase = bearer ? createClientFromAccessToken(bearer) : createClient()

  // ALWAYS use getUser() - never getSession()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw Errors.unauthorized()
  }

  const member = await getMemberByUserId(supabase, user.id)
  if (!member) {
    throw Errors.forbidden()
  }

  return { user, member, supabase }
}

export async function requireOwner(req: NextRequest) {
  const context = await requireAuth(req)

  if (context.member.role !== 'owner') {
    throw Errors.forbidden()
  }

  return context
}
