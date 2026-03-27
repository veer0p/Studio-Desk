import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

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

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }

    const result = await AuthService.updateMe(supabase, body)
    return Response.ok(result)
  } catch (err: any) {
    if (err instanceof ServiceError) return Response.error(err.message, err.code, err.status)
    if (err?.name === 'ZodError') {
      return Response.error(err.issues?.[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error(err.message || 'Internal server error', err.code || 'INTERNAL_ERROR', err.status || 500)
  }
}
