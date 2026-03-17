import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Common reusable query helpers.
 * All queries are scoped to studio_id and filter out deleted records.
 */

export async function getStudioBySlug(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .from('studios')
    .select('id, name, slug, logo_url, settings')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return data;
}

export async function getMemberByUserId(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('studio_members')
    .select('studio_id, role, id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return {
    studio_id: data.studio_id,
    role: data.role,
    member_id: data.id,
  };
}

export async function getBookingById(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  studioId: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return data;
}

export async function getClientById(
  supabase: SupabaseClient<Database>,
  clientId: string,
  studioId: string
) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return data;
}

export async function getInvoiceById(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
  studioId: string
) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return data;
}

export async function checkStorageQuota(
  supabase: SupabaseClient<Database>,
  studioId: string,
  uploadSizeGb: number
) {
  const { data, error } = await supabase
    .from('studios')
    .select('storage_used_gb, storage_limit_gb')
    .eq('id', studioId)
    .single();

  if (error || !data) {
    throw new Error('Failed to verify studio storage quota');
  }

  const projectedUsage = Number(data.storage_used_gb) + uploadSizeGb;
  if (projectedUsage > Number(data.storage_limit_gb)) {
    throw new Error('Storage quota exceeded. Please upgrade your plan.');
  }

  return true;
}
