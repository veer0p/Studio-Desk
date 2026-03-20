import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { email } = await req.json()
    if (!email) return Response.error('Email is required', 'VALIDATION_ERROR', 400)
    
    await AuthService.resetPassword(supabase, email)
    return Response.ok({ success: true, message: 'Password reset email sent' })
  } catch (err: any) {
    return Response.error(err.message || 'Failed to send reset email', 'AUTH_ERROR', 400)
  }
}
