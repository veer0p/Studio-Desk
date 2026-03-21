import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Response } from '@/lib/response'
import { AuthService } from '@/lib/services/auth.service'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    await AuthService.updatePassword(supabase, body)
    return Response.ok({ success: true, message: 'Password updated successfully' })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return Response.error(err.errors[0]?.message || 'Validation failed', 'VALIDATION_ERROR', 400)
    }
    return Response.error(err.message || 'Failed to update password', 'AUTH_ERROR', 400)
  }
}
