import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_HITS = 10
const INQUIRY_MAX_HITS = 5

/**
 * Check rate limit by key (e.g. team_accept:ip).
 * If over limit, throws Errors.rateLimited().
 * Otherwise increments hit count and returns.
 */
export async function checkAndIncrementRateLimit(key: string): Promise<void> {
  return checkAndIncrementRateLimitWithMax(key, MAX_HITS)
}

/**
 * Inquiry form: 5 submissions per IP per hour per studio.
 */
export async function checkInquiryRateLimit(key: string): Promise<void> {
  return checkAndIncrementRateLimitWithMax(key, INQUIRY_MAX_HITS)
}

async function checkAndIncrementRateLimitWithMax(key: string, maxHits: number): Promise<void> {
  const supabase = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('id, hit_count, window_start')
    .eq('key', key)
    .maybeSingle()

  const row = existing as { id: string; hit_count: number; window_start: string } | null

  if (!row) {
    await supabase.from('rate_limits').insert({
      key,
      hit_count: 1,
      window_start: now.toISOString(),
    })
    return
  }

  const start = new Date(row.window_start)
  if (start < windowStart) {
    await supabase
      .from('rate_limits')
      .update({
        hit_count: 1,
        window_start: now.toISOString(),
      })
      .eq('id', row.id)
    return
  }

  if (row.hit_count >= maxHits) {
    throw Errors.rateLimited()
  }

  await supabase
    .from('rate_limits')
    .update({ hit_count: row.hit_count + 1 })
    .eq('id', row.id)
}
