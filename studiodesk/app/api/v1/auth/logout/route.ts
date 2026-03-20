import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  await AuthService.logout(supabase)
  return Response.ok({ success: true })
}
