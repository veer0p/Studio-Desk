import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { redeemReferralSchema } from '@/lib/validations/referral.schema'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/referral/redeem
 * Redeem a referral code (called when a new studio signs up).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = redeemReferralSchema.safeParse(body)
    if (!validated.success) {
      return ApiResponse.error(validated.error.issues[0]?.message, 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    // Find the referral code
    const { data: code, error: codeError } = await adminClient
      .from('referral_codes')
      .select('*')
      .eq('code', validated.data.code)
      .eq('is_active', true)
      .single()

    if (codeError || !code) {
      return ApiResponse.error('Invalid referral code', 'NOT_FOUND', 404)
    }

    // Check if expired
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return ApiResponse.error('Referral code has expired', 'EXPIRED', 410)
    }

    // Check if max uses reached
    if (code.max_uses && code.used_count >= code.max_uses) {
      return ApiResponse.error('Referral code usage limit reached', 'QUOTA_EXCEEDED', 422)
    }

    // Check if studio already redeemed
    const { data: existing } = await adminClient
      .from('referral_redemptions')
      .select('id')
      .eq('referred_studio_id', validated.data.new_studio_id)
      .maybeSingle()

    if (existing) {
      return ApiResponse.error('This studio already redeemed a referral code', 'CONFLICT', 409)
    }

    // Create redemption record
    const { error: redemptionError } = await adminClient
      .from('referral_redemptions')
      .insert({
        referral_code_id: code.id,
        referrer_studio_id: code.owner_studio_id,
        referred_studio_id: validated.data.new_studio_id,
      })

    if (redemptionError) {
      throw new Error('Failed to create redemption record')
    }

    // Increment usage count
    await adminClient
      .from('referral_codes')
      .update({ used_count: code.used_count + 1 })
      .eq('id', code.id)

    // Reward the referrer (e.g., free month subscription)
    // In production, this would call the subscription service to extend the trial
    await adminClient
      .from('referral_redemptions')
      .update({ referrer_rewarded_at: new Date().toISOString() })
      .eq('referral_code_id', code.id)
      .eq('referred_studio_id', validated.data.new_studio_id)

    // Reward the referred studio
    await adminClient
      .from('referral_redemptions')
      .update({ referred_rewarded_at: new Date().toISOString() })
      .eq('referral_code_id', code.id)
      .eq('referred_studio_id', validated.data.new_studio_id)

    return ApiResponse.ok({
      success: true,
      reward: 'Free month of subscription applied to both studios',
    })
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
