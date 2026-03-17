import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/settings/subscription:
 *   get:
 *     summary: Get subscription details
 *     description: Returns current plan tier, storage usage, and billing info.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: studio, error } = await supabase
      .from('studios')
      .select('plan_tier, storage_used_gb, subscription_expires_at')
      .eq('id', member.studio_id)
      .single();

    if (error) throw error;

    // Map limits
    const limits = {
      starter: { storage: 20, galleries: 5 },
      pro: { storage: 100, galleries: 50 },
      free: { storage: 5, galleries: 1 }
    };

    const tier = (studio?.plan_tier as keyof typeof limits) || 'free';
    const limit = limits[tier];

    return NextResponse.json({
      plan_tier: tier,
      storage_used_gb: studio?.storage_used_gb || 0,
      storage_limit_gb: limit.storage,
      gallery_limit: limit.galleries,
      expires_at: studio?.subscription_expires_at
    });
  } catch (error: any) {
    console.error('[SETTINGS_SUBSCRIPTION_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
