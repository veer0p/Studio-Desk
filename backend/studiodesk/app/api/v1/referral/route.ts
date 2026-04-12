import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { redeemReferralSchema } from '@/lib/validations/referral.schema'
import { logError } from '@/lib/logger'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const parts: string[] = []
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * CHARS.length)
    parts.push(CHARS[idx])
  }
  return `STUDIO-${parts.join('')}`
}

/**
 * GET /api/v1/referral
 * Get current studio's referral code, usage stats, and redemption history.
 */
export async function GET(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    // Get active referral code
    const { data: code } = await adminClient
      .from('referral_codes')
      .select('*')
      .eq('owner_studio_id', studio_id)
      .eq('is_active', true)
      .maybeSingle()

    // Get redemption stats
    const { data: redemptions } = await adminClient
      .from('referral_redemptions')
      .select('*, studios!referred_studio_id(name)')
      .eq('referrer_studio_id', studio_id)
      .order('created_at', { ascending: false })
      .limit(20)

    return ApiResponse.ok({
      code: code || null,
      stats: {
        total_redemptions: redemptions?.length || 0,
        total_rewards: redemptions?.filter((r: any) => r.referrer_rewarded_at).length || 0,
      },
      redemptions: (redemptions || []).map((r: any) => ({
        id: r.id,
        referred_studio_name: r.studios?.name || 'Unknown',
        created_at: r.created_at,
        rewarded: !!r.referrer_rewarded_at,
      })),
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/referral
 * Generate a new referral code for the current studio.
 */
export async function POST(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    // Check for existing active code
    const { data: existing } = await adminClient
      .from('referral_codes')
      .select('id')
      .eq('owner_studio_id', studio_id)
      .eq('is_active', true)
      .maybeSingle()

    if (existing) {
      return ApiResponse.error('An active referral code already exists', 'CONFLICT', 409)
    }

    const code = generateCode()

    const { data, error } = await adminClient
      .from('referral_codes')
      .insert({
        code,
        owner_studio_id: studio_id,
        reward_type: 'free_month',
        reward_value: 1,
        max_uses: 10,
      })
      .select('*')
      .single()

    if (error) {
      throw new Error('Failed to create referral code')
    }

    return ApiResponse.ok({ code: data.code })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
