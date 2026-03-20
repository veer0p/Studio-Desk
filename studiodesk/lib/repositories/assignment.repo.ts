import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>

const ASSIGNMENT_SELECT = `
  id, studio_id, booking_id, member_id, role, notes, confirmed_at, created_at, updated_at,
  call_location, is_confirmed,
  member:studio_members!shoot_assignments_member_id_fkey(
    display_name, phone, whatsapp, profile_photo_url, specialization
  )
`

const MEMBER_ASSIGNMENT_SELECT = `
  id, studio_id, booking_id, member_id, role, notes, confirmed_at, created_at, updated_at,
  call_location, is_confirmed,
  booking:bookings!shoot_assignments_booking_id_fkey(
    id, title, event_type, event_date, venue_name, status, deleted_at,
    client:clients!bookings_client_id_fkey(full_name, phone)
  )
`

function readMeta(value: unknown) {
  if (typeof value !== 'string' || !value.trim().startsWith('{')) return {}
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return {}
  }
}

function assignmentStatus(row: any, meta: Record<string, unknown>) {
  if (meta.status === 'declined') return 'declined'
  if (meta.status === 'confirmed' || row.is_confirmed) return 'confirmed'
  return 'pending'
}

function mapAssignment(row: any) {
  const meta = readMeta(row.call_location)
  return {
    id: row.id,
    booking_id: row.booking_id,
    member_id: row.member_id,
    role: String(meta.role ?? row.role ?? 'assistant'),
    status: assignmentStatus(row, meta),
    notes: row.notes ?? null,
    confirmed_at: row.confirmed_at ?? null,
    declined_at: meta.declined_at ?? null,
    decline_reason: meta.decline_reason ?? null,
    member: row.member
      ? {
          display_name: row.member.display_name ?? '',
          phone: row.member.phone ?? null,
          whatsapp: row.member.whatsapp ?? null,
          profile_photo_url: row.member.profile_photo_url ?? null,
          specialization: row.member.specialization ?? [],
        }
      : undefined,
    booking_title: row.booking?.title ?? '',
    event_type: row.booking?.event_type ?? null,
    event_date: row.booking?.event_date ?? null,
    venue_name: row.booking?.venue_name ?? null,
    booking_status: row.booking?.status ?? null,
    client_name: row.booking?.client?.full_name ?? '',
    client_phone: row.booking?.client?.phone ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export const assignmentRepo = {
  async getAssignmentsByBooking(supabase: Db, bookingId: string, studioId: string) {
    const { data, error } = await supabase
      .from('shoot_assignments')
      .select(ASSIGNMENT_SELECT)
      .eq('booking_id', bookingId)
      .eq('studio_id', studioId)
      .order('role', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch assignments')
    return (data ?? []).map(mapAssignment)
  },

  async getAssignmentById(supabase: Db, assignmentId: string, studioId: string) {
    const { data, error } = await supabase
      .from('shoot_assignments')
      .select(ASSIGNMENT_SELECT)
      .eq('id', assignmentId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch assignment')
    return data ? mapAssignment(data) : null
  },

  async getAssignmentsByMember(supabase: Db, memberId: string, studioId: string, params: any) {
    const { data, error } = await supabase
      .from('shoot_assignments')
      .select(MEMBER_ASSIGNMENT_SELECT)
      .eq('member_id', memberId)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch assignments')
    return (data ?? [])
      .map(mapAssignment)
      .filter((row) => row.event_date && row.booking_status !== null)
      .filter((row) => !params.from_date || row.event_date >= params.from_date)
      .filter((row) => !params.to_date || row.event_date <= params.to_date)
      .filter((row) => !params.status || row.status === params.status)
      .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)))
  },

  async getTeamSchedule(supabase: Db, studioId: string, params: any) {
    const { data, error } = await supabase
      .from('shoot_assignments')
      .select(`${ASSIGNMENT_SELECT}, booking:bookings!shoot_assignments_booking_id_fkey(
        id, title, event_type, event_date, venue_name, status, deleted_at,
        client:clients!bookings_client_id_fkey(full_name, phone)
      )`)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch schedule')
    return (data ?? [])
      .map(mapAssignment)
      .filter((row) => row.event_date && row.event_date >= params.from_date && row.event_date <= params.to_date)
      .filter((row) => !params.member_id || row.member_id === params.member_id)
      .sort((a, b) => {
        if (a.event_date !== b.event_date) return String(a.event_date).localeCompare(String(b.event_date))
        return String(a.role).localeCompare(String(b.role))
      })
  },

  async checkMemberAvailability(supabase: Db, memberId: string, studioId: string, eventDate: string) {
    const [assignmentsRes, unavailableRes] = await Promise.all([
      supabase
        .from('shoot_assignments')
        .select('id, booking:bookings!shoot_assignments_booking_id_fkey(title, event_date, deleted_at), call_location, is_confirmed')
        .eq('member_id', memberId)
        .eq('studio_id', studioId),
      supabase
        .from('member_unavailability')
        .select('id, unavailable_date, reason')
        .eq('member_id', memberId)
        .eq('studio_id', studioId)
        .eq('unavailable_date', eventDate),
    ])

    if (assignmentsRes.error || unavailableRes.error) {
      throw Errors.validation('Failed to check member availability')
    }

    const bookingConflicts = (assignmentsRes.data ?? [])
      .filter((row: any) => row.booking?.event_date === eventDate && !row.booking?.deleted_at)
      .filter((row: any) => assignmentStatus(row, readMeta(row.call_location)) !== 'declined')
      .map((row: any) => ({
        type: 'booking',
        booking_title: row.booking?.title ?? 'Booking',
        event_date: row.booking?.event_date ?? eventDate,
      }))

    const unavailabilityConflicts = (unavailableRes.data ?? []).map((row: any) => ({
      type: 'unavailability',
      booking_title: row.reason ?? 'Unavailable',
      event_date: row.unavailable_date,
    }))

    const conflicts = [...bookingConflicts, ...unavailabilityConflicts]
    return { available: conflicts.length === 0, conflicts }
  },

  async createAssignment(supabase: Db, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('shoot_assignments')
      .upsert(data, { onConflict: 'booking_id,member_id' })
      .select('id')
      .single()

    if (error || !row) throw Errors.validation('Failed to save assignment')
    return this.getAssignmentById(supabase, row.id as string, data.studio_id as string)
  },

  async updateAssignment(supabase: Db, assignmentId: string, studioId: string, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('shoot_assignments')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .eq('studio_id', studioId)
      .select('id')
      .single()

    if (error || !row) throw Errors.validation('Failed to update assignment')
    return this.getAssignmentById(supabase, row.id as string, studioId)
  },

  async deleteAssignment(supabase: Db, assignmentId: string, studioId: string) {
    const current = await this.getAssignmentById(supabase, assignmentId, studioId)
    if (!current) throw Errors.notFound('Assignment')
    const { error } = await supabase
      .from('shoot_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete assignment')
  },

  async getShootBrief(supabase: Db, bookingId: string, studioId: string) {
    const { data, error } = await supabase
      .from('shoot_briefs')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch shoot brief')
    return data
  },

  async upsertShootBrief(supabase: Db, data: Record<string, unknown>) {
    const { data: row, error } = await supabase
      .from('shoot_briefs')
      .upsert(data, { onConflict: 'booking_id' })
      .select('*')
      .single()

    if (error) throw Errors.validation('Failed to save shoot brief')
    return row
  },

  async getMemberUnavailability(supabase: Db, studioId: string, fromDate: string, toDate: string) {
    const { data, error } = await supabase
      .from('member_unavailability')
      .select('id, studio_id, member_id, unavailable_date, reason, member:studio_members!member_unavailability_member_id_fkey(display_name)')
      .eq('studio_id', studioId)
      .gte('unavailable_date', fromDate)
      .lte('unavailable_date', toDate)

    if (error) throw Errors.validation('Failed to fetch unavailability')
    return data ?? []
  },
}
