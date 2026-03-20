import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'
import { ServiceError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const result = await AuthService.me(supabase)
    return Response.ok(result)
  } catch (err: any) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    return Response.error('Unauthenticated', 'AUTH_ERROR', 401)
  }
}
