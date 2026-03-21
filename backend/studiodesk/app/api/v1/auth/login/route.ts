import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const result = await AuthService.login(supabase, body)
    return Response.ok(result)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return Response.error(err.errors[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error(err.message || 'Invalid credentials', err.code || 'AUTH_ERROR', 401)
  }
}
