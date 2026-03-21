import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'

const GENERIC_MESSAGE = 'If an account exists for this email, reset instructions have been sent'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.error('Invalid email', 'VALIDATION_ERROR', 400)
    }

    await AuthService.resetPassword(supabase, email)
    return Response.ok({ success: true, message: GENERIC_MESSAGE })
  } catch {
    // Do not leak account existence or provider internals.
    return Response.ok({ success: true, message: GENERIC_MESSAGE })
  }
}
