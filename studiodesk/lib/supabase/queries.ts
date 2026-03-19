import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

// TODO: Run `npx supabase gen types typescript --local --schema public > types/database.ts`
type Database = any

export async function getMemberByUserId(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('studio_members')
    .select('studio_id, role, id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  
  return {
    studio_id: data.studio_id,
    role: data.role,
    member_id: data.id
  }
}

export async function getBookingById(supabase: SupabaseClient<Database>, bookingId: string, studioId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single()

  if (error) throw Errors.notFound('Booking')
  return data
}

export async function getClientById(supabase: SupabaseClient<Database>, clientId: string, studioId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single()

  if (error) throw Errors.notFound('Client')
  return data
}

export async function getInvoiceById(supabase: SupabaseClient<Database>, invoiceId: string, studioId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('studio_id', studioId)
    .is('deleted_at', null)
    .single()

  if (error) throw Errors.notFound('Invoice')
  return data
}

export async function checkStorageQuota(supabase: SupabaseClient<Database>, studioId: string, uploadSizeGb: number) {
  const { data, error } = await supabase
    .from('studios')
    .select('storage_used_gb, storage_quota_gb')
    .eq('id', studioId)
    .single()

  if (error || !data) throw Errors.notFound('Studio')

  if (data.storage_used_gb + uploadSizeGb > data.storage_quota_gb) {
    throw Errors.quotaExceeded()
  }
}
