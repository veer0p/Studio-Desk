import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * React cache() for per-request deduplication.
 * Useful for fetching the same studio data multiple times in different
 * server components during a single request.
 */
export const getStudio = cache(async (studioId: string) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', studioId)
    .single();

  if (error) {
    console.error('Error fetching studio:', error);
    return null;
  }
  return data;
});

/**
 * cacheStudioData wraps the stable data fetching in unstable_cache
 * Default TTL: 5 minutes (300 seconds)
 */
export async function getCachedStudio(studioId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', studioId)
        .single();
      
      if (error) return null;
      return data;
    },
    [`studio-${studioId}`],
    {
      revalidate: 300, // 5 minutes
      tags: [`studio-${studioId}`],
    }
  )();
}

/**
 * Invalidate the studio cache after updates.
 * Call this in server actions after patching studio settings.
 */
import { revalidateTag } from 'next/cache';

export function invalidateStudioCache(studioId: string) {
  revalidateTag(`studio-${studioId}`);
}

/**
 * Cache for invoice numbers to prevent collisions or repeated slow lookups
 * Invalidate on new invoice creation.
 */
export async function getCachedInvoiceNumber(studioId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      // Logic to get next invoice number format
      const { data } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('studio_id', studioId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return data?.[0]?.invoice_number || null;
    },
    [`invoice-number-${studioId}`],
    {
      revalidate: 60, // 1 minute
      tags: [`invoice-number-${studioId}`],
    }
  )();
}

export function invalidateInvoiceNumberCache(studioId: string) {
  revalidateTag(`invoice-number-${studioId}`);
}
