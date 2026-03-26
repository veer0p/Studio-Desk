import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const result = await AuthService.signup(supabase, body)
    return Response.created(result)
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err.name === 'ZodError') {
      return Response.error(err.issues?.[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error(err.message || 'Internal server error', err.code || 'INTERNAL_ERROR', err.status || 500)
  }
}
