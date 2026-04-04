import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'

export async function POST(req: NextRequest) {
  return handleLogout(req)
}

export async function GET(req: NextRequest) {
  return handleLogout(req)
}

async function handleLogout(req: NextRequest) {
  try {
    const supabase = createClient()
    await AuthService.logout(supabase)
    return Response.ok({ success: true })
  } catch (err: any) {
    console.error('[Logout Route] Error:', err)
    return Response.error(err.message || 'Logout failed', 'LOGOUT_ERROR', 500)
  }
}
