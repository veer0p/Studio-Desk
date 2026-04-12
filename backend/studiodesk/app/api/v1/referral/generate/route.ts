import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { randomBytes } from 'crypto'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  return Array.from(bytes)
    .map(b => chars[b % chars.length])
    .join('')
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)

    // Check if code already exists
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('owner_studio_id', member.studio_id)
      .maybeSingle()

    let code: string

    if (existing) {
      // Update existing code with new value
      code = generateCode()
      const { error } = await supabase
        .from('referral_codes')
        .update({ code, is_active: true })
        .eq('owner_studio_id', member.studio_id)

      if (error) throw error
    } else {
      code = generateCode()
      const { error } = await supabase
        .from('referral_codes')
        .insert({
          owner_studio_id: member.studio_id,
          code,
          reward_type: 'credits',
          reward_value: 500,
          used_count: 0,
          is_active: true,
        })

      if (error) throw error
    }

    return Response.created({ code })
  } catch (err: unknown) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err && typeof err === 'object' && 'status' in err && 'code' in err) {
      const typed = err as { message?: string; code?: string; status?: number }
      return Response.error(typed.message ?? 'Error', typed.code, typed.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
