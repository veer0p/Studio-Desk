import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'
import { assignmentRepo } from '@/lib/repositories/assignment.repo'

type Db = SupabaseClient<any>

function logInsert(supabase: Db, table: string, payload: Record<string, unknown>) {
  supabase.from(table).insert(payload).then(() => {}).catch(() => {})
}

function dbRole(role: string) {
  if (['photographer', 'videographer', 'assistant', 'editor'].includes(role)) return role
  return 'assistant'
}

function isoCallTime(eventDate: string) {
  return `${eventDate}T00:00:00.000Z`
}

function metaForAssignment(current: any, data: any) {
  const next = {
    role: data.role ?? current.role,
    status: data.status ?? current.status ?? 'pending',
    decline_reason: current.decline_reason ?? null,
    declined_at: current.declined_at ?? null,
  } as Record<string, unknown>

  if (data.status === 'confirmed') {
    next.status = 'confirmed'
    next.decline_reason = null
    next.declined_at = null
  }
  if (data.status === 'declined') {
    next.status = 'declined'
    next.decline_reason = data.decline_reason ?? current.decline_reason ?? null
    next.declined_at = new Date().toISOString()
  }
  if (data.status === 'pending') {
    next.status = 'pending'
    next.decline_reason = null
    next.declined_at = null
  }

  return next
}

function briefDbPayload(studioId: string, bookingId: string, data: any) {
  return {
    studio_id: studioId,
    booking_id: bookingId,
    key_shots: data.shot_list ?? [],
    venue_access_notes: data.venue_address ?? null,
    contact_on_day: data.client_name ?? null,
    contact_phone: data.client_phone ?? null,
    special_instructions: data.special_instructions ?? null,
    equipment_needed: data.equipment_notes ? [data.equipment_notes] : [],
    people_to_capture: {
      call_time: data.call_time ?? null,
      shoot_start_time: data.shoot_start_time ?? null,
      shoot_end_time: data.shoot_end_time ?? null,
      venue_map_link: data.venue_map_link ?? null,
      client_whatsapp: data.client_whatsapp ?? null,
      reference_images: data.reference_images ?? [],
      equipment_notes: data.equipment_notes ?? null,
      outfit_notes: data.outfit_notes ?? null,
    },
  }
}

function briefResponse(row: any) {
  const meta = row?.people_to_capture && typeof row.people_to_capture === 'object' ? row.people_to_capture : {}
  return {
    id: row.id,
    booking_id: row.booking_id,
    call_time: meta.call_time ?? null,
    shoot_start_time: meta.shoot_start_time ?? null,
    shoot_end_time: meta.shoot_end_time ?? null,
    venue_address: row.venue_access_notes ?? null,
    venue_map_link: meta.venue_map_link ?? null,
    client_name: row.contact_on_day ?? null,
    client_phone: row.contact_phone ?? null,
    client_whatsapp: meta.client_whatsapp ?? null,
    special_instructions: row.special_instructions ?? null,
    shot_list: row.key_shots ?? [],
    reference_images: meta.reference_images ?? [],
    equipment_notes: meta.equipment_notes ?? row.equipment_needed?.join(', ') ?? null,
    outfit_notes: meta.outfit_notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function getBooking(supabase: Db, bookingId: string, studioId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, studio_id, client_id, event_date, title, status, deleted_at')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .maybeSingle()

  if (error) throw Errors.validation('Failed to fetch booking')
  if (!data || data.deleted_at) throw Errors.notFound('Booking')
  return data
}

async function getMembers(supabase: Db, studioId: string, memberIds: string[]) {
  const { data, error } = await supabase
    .from('studio_members')
    .select('id, display_name, whatsapp, is_active')
    .eq('studio_id', studioId)
    .in('id', memberIds)
    .eq('is_active', true)

  if (error) throw Errors.validation('Failed to fetch team members')
  return data ?? []
}

async function getMember(supabase: Db, studioId: string, memberId: string) {
  const { data, error } = await supabase
    .from('studio_members')
    .select('id')
    .eq('id', memberId)
    .eq('studio_id', studioId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw Errors.validation('Failed to fetch team member')
  return data
}

export const AssignmentService = {
  async getAssignmentsByBooking(supabase: Db, bookingId: string, studioId: string) {
    await getBooking(supabase, bookingId, studioId)
    return assignmentRepo.getAssignmentsByBooking(supabase, bookingId, studioId)
  },

  async assignTeamToBooking(supabase: Db, studioId: string, bookingId: string, assignments: any[], assignedBy: string) {
    const booking = await getBooking(supabase, bookingId, studioId)
    if (['closed', 'lost'].includes(booking.status)) {
      throw Errors.conflict('Cannot assign team to a closed booking')
    }

    const memberIds = [...new Set(assignments.map((row) => row.member_id))]
    const members = await getMembers(supabase, studioId, memberIds)
    if (members.length !== memberIds.length) {
      throw Errors.validation('One or more team members not found in studio')
    }

    const memberMap = new Map(members.map((row: any) => [row.id, row]))
    const availability = await Promise.all(
      assignments.map((row) => assignmentRepo.checkMemberAvailability(supabase, row.member_id, studioId, booking.event_date))
    )

    const conflicts = availability
      .map((row, index) => ({ row, assignment: assignments[index] }))
      .filter((item) => !item.row.available)
      .map((item) => ({
        member_id: item.assignment.member_id,
        member_name: memberMap.get(item.assignment.member_id)?.display_name ?? 'Member',
        conflicts: item.row.conflicts,
      }))

    const saved = await Promise.all(
      assignments.map((row) =>
        assignmentRepo.createAssignment(supabase, {
          studio_id: studioId,
          booking_id: bookingId,
          member_id: row.member_id,
          role: dbRole(row.role),
          call_time: isoCallTime(booking.event_date),
          call_location: JSON.stringify({ role: row.role, status: 'pending' }),
          notes: row.notes ?? null,
          is_confirmed: false,
          confirmed_at: null,
        })
      )
    )

    logInsert(supabase, 'booking_activity_feed', {
      studio_id: studioId,
      booking_id: bookingId,
      event_type: 'team_assigned',
      actor_id: assignedBy,
      actor_type: 'member',
      metadata: { member_ids: memberIds, roles: assignments.map((row) => row.role) },
    })

    for (const row of assignments) {
      const member = memberMap.get(row.member_id)
      logInsert(supabase, 'automation_log', {
        studio_id: studioId,
        booking_id: bookingId,
        automation_type: 'custom',
        channel: 'whatsapp',
        status: 'sent',
        recipient_phone: member?.whatsapp ?? null,
        message_body: `Shoot assigned for ${booking.title} on ${booking.event_date}`,
      })
    }

    return { assignments: saved, conflicts }
  },

  async updateAssignment(supabase: Db, assignmentId: string, studioId: string, data: any, actor: any) {
    const current = await assignmentRepo.getAssignmentById(supabase, assignmentId, studioId)
    if (!current) throw Errors.notFound('Assignment')

    const isOwner = actor.role === 'owner'
    const isSelf = current.member_id === actor.memberId

    if (!isOwner && !isSelf) throw Errors.forbidden()
    if (data.status && !isSelf) throw Errors.forbidden()
    if (!isOwner && (data.role !== undefined || data.notes !== undefined)) throw Errors.forbidden()
    if (data.status === 'declined' && !data.decline_reason) {
      throw Errors.validation('Decline reason required when declining')
    }

    const meta = metaForAssignment(current, data)
    const nextStatus = String(meta.status)
    const updated = await assignmentRepo.updateAssignment(supabase, assignmentId, studioId, {
      role: dbRole(String(meta.role)),
      notes: data.notes ?? current.notes,
      is_confirmed: nextStatus === 'confirmed',
      confirmed_at:
        nextStatus === 'confirmed'
          ? new Date().toISOString()
          : nextStatus === 'declined'
            ? null
            : current.confirmed_at,
      call_location: JSON.stringify(meta),
    })

    if (data.status) {
      logInsert(supabase, 'booking_activity_feed', {
        studio_id: studioId,
        booking_id: current.booking_id,
        event_type: data.status === 'confirmed' ? 'shoot_confirmed' : 'status_changed',
        actor_id: actor.userId,
        actor_type: 'member',
        metadata: { assignment_id: assignmentId, status: data.status },
      })
    }

    return updated
  },

  async removeAssignment(supabase: Db, assignmentId: string, studioId: string) {
    await assignmentRepo.deleteAssignment(supabase, assignmentId, studioId)
  },

  async getTeamSchedule(supabase: Db, studioId: string, params: any) {
    const diff = Math.floor((new Date(params.to_date).getTime() - new Date(params.from_date).getTime()) / 86400000)
    if (diff > 90) throw Errors.validation('Schedule range cannot exceed 90 days')

    const [assignments, unavailability] = await Promise.all([
      assignmentRepo.getTeamSchedule(supabase, studioId, params),
      assignmentRepo.getMemberUnavailability(supabase, studioId, params.from_date, params.to_date),
    ])

    const grouped = new Map<string, any>()
    for (const row of assignments) {
      if (!grouped.has(row.event_date)) {
        grouped.set(row.event_date, { date: row.event_date, bookings: [], unavailable_members: [] })
      }
      const day = grouped.get(row.event_date)
      let booking = day.bookings.find((item: any) => item.booking_id === row.booking_id)
      if (!booking) {
        booking = {
          booking_id: row.booking_id,
          booking_title: row.booking_title,
          event_type: row.event_type,
          venue_name: row.venue_name,
          client_name: row.client_name,
          assignments: [],
        }
        day.bookings.push(booking)
      }
      booking.assignments.push({
        id: row.id,
        member_id: row.member_id,
        member_name: row.member?.display_name ?? '',
        role: row.role,
        status: row.status,
        notes: row.notes,
      })
    }

    for (const row of unavailability) {
      const date = row.unavailable_date
      if (!grouped.has(date)) {
        grouped.set(date, { date, bookings: [], unavailable_members: [] })
      }
      grouped.get(date).unavailable_members.push({
        member_id: row.member_id,
        member_name: row.member?.display_name ?? '',
        reason: row.reason ?? null,
      })
    }

    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date))
  },

  async getMemberAssignments(supabase: Db, memberId: string, studioId: string, params: any) {
    const member = await getMember(supabase, studioId, memberId)
    if (!member) throw Errors.notFound('Team member')
    return assignmentRepo.getAssignmentsByMember(supabase, memberId, studioId, params)
  },

  async getShootBrief(supabase: Db, bookingId: string, studioId: string) {
    await getBooking(supabase, bookingId, studioId)
    const row = await assignmentRepo.getShootBrief(supabase, bookingId, studioId)
    return row ? briefResponse(row) : null
  },

  async upsertShootBrief(supabase: Db, bookingId: string, studioId: string, data: any, userId: string) {
    await getBooking(supabase, bookingId, studioId)
    if (data.shoot_start_time && data.shoot_end_time && data.shoot_start_time >= data.shoot_end_time) {
      throw Errors.validation('Shoot start time must be before shoot end time')
    }
    const row = await assignmentRepo.upsertShootBrief(supabase, briefDbPayload(studioId, bookingId, data))
    logInsert(supabase, 'booking_activity_feed', {
      studio_id: studioId,
      booking_id: bookingId,
      event_type: 'note_added',
      actor_id: userId,
      actor_type: 'member',
      metadata: { type: 'shoot_brief_updated' },
    })
    return briefResponse(row)
  },
}
