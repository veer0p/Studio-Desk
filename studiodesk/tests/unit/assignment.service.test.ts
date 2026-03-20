import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AssignmentService } from '@/lib/services/assignment.service'
import { assignmentRepo } from '@/lib/repositories/assignment.repo'

vi.mock('@/lib/repositories/assignment.repo', () => ({
  assignmentRepo: {
    getAssignmentsByBooking: vi.fn(),
    getAssignmentById: vi.fn(),
    getAssignmentsByMember: vi.fn(),
    getTeamSchedule: vi.fn(),
    checkMemberAvailability: vi.fn(),
    createAssignment: vi.fn(),
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    getShootBrief: vi.fn(),
    upsertShootBrief: vi.fn(),
    getMemberUnavailability: vi.fn(),
  },
}))

function chain(result: any) {
  const self: any = {
    eq: vi.fn(() => self),
    in: vi.fn(() => self),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => self),
  }
  return self
}

function createSupabase(config: any = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'bookings') return { select: vi.fn(() => chain({ data: config.booking ?? null, error: null })) }
      if (table === 'studio_members') {
        const self: any = {
          eq: vi.fn(() => self),
          in: vi.fn(() => self),
          maybeSingle: vi.fn(async () => ({ data: config.member ?? null, error: null })),
          select: vi.fn(() => self),
          then: (resolve: any) => resolve({ data: config.members ?? [], error: null }),
        }
        return { select: vi.fn(() => self) }
      }
      return { insert: vi.fn(() => Promise.resolve({ error: null })) }
    }),
  } as any
}

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('assignTeamToBooking rejects closed bookings and missing studio members', async () => {
    await expect(
      AssignmentService.assignTeamToBooking(createSupabase({ booking: { id: 'b1', status: 'closed' } }), 's1', 'b1', [{ member_id: 'm1', role: 'photographer' }], 'u1')
    ).rejects.toMatchObject({ code: 'CONFLICT' })

    await expect(
      AssignmentService.assignTeamToBooking(createSupabase({ booking: { id: 'b1', status: 'contract_signed', event_date: '2026-05-01', title: 'Shoot' }, members: [] }), 's1', 'b1', [{ member_id: 'm1', role: 'photographer' }], 'u1')
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('assignTeamToBooking saves assignments, runs parallel checks, and returns conflicts', async () => {
    const supabase = createSupabase({
      booking: { id: 'b1', status: 'contract_signed', event_date: '2026-05-01', title: 'Shoot' },
      members: [
        { id: 'm1', display_name: 'Raj', whatsapp: '9876500001' },
        { id: 'm2', display_name: 'Amit', whatsapp: '9876500002' },
      ],
    })
    vi.mocked(assignmentRepo.checkMemberAvailability)
      .mockResolvedValueOnce({ available: false, conflicts: [{ type: 'booking' }] } as any)
      .mockResolvedValueOnce({ available: true, conflicts: [] } as any)
    vi.mocked(assignmentRepo.createAssignment)
      .mockResolvedValueOnce({ id: 'a1' } as any)
      .mockResolvedValueOnce({ id: 'a2' } as any)

    const result = await AssignmentService.assignTeamToBooking(
      supabase,
      's1',
      'b1',
      [
        { member_id: 'm1', role: 'photographer' },
        { member_id: 'm2', role: 'videographer' },
      ],
      'u1'
    )

    expect(result.assignments).toHaveLength(2)
    expect(result.conflicts).toHaveLength(1)
    expect(assignmentRepo.createAssignment).toHaveBeenCalledTimes(2)
    expect(supabase.from).toHaveBeenCalledWith('automation_log')
    expect(supabase.from).toHaveBeenCalledWith('booking_activity_feed')
  })

  it('updateAssignment enforces decline reason and timestamps confirm/decline', async () => {
    vi.mocked(assignmentRepo.getAssignmentById).mockResolvedValue({
      id: 'a1',
      booking_id: 'b1',
      member_id: 'm1',
      role: 'photographer',
      status: 'pending',
      notes: null,
      confirmed_at: null,
      declined_at: null,
      decline_reason: null,
    } as any)
    vi.mocked(assignmentRepo.updateAssignment).mockResolvedValue({ id: 'a1', status: 'confirmed' } as any)

    await expect(
      AssignmentService.updateAssignment({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any, 'a1', 's1', { status: 'declined' }, { role: 'photographer', memberId: 'm1', userId: 'u1' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    await AssignmentService.updateAssignment({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any, 'a1', 's1', { status: 'confirmed' }, { role: 'photographer', memberId: 'm1', userId: 'u1' })
    let payload = vi.mocked(assignmentRepo.updateAssignment).mock.calls.at(-1)?.[3] as any
    expect(payload.confirmed_at).toBeTruthy()

    await AssignmentService.updateAssignment({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any, 'a1', 's1', { status: 'declined', decline_reason: 'Busy' }, { role: 'photographer', memberId: 'm1', userId: 'u1' })
    payload = vi.mocked(assignmentRepo.updateAssignment).mock.calls.at(-1)?.[3] as any
    expect(JSON.parse(payload.call_location).declined_at).toBeTruthy()
  })

  it('getTeamSchedule validates range and groups assignments plus unavailability', async () => {
    await expect(
      AssignmentService.getTeamSchedule({} as any, 's1', { from_date: '2026-01-01', to_date: '2026-05-01' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    vi.mocked(assignmentRepo.getTeamSchedule).mockResolvedValue([
      { id: 'a1', booking_id: 'b1', booking_title: 'Shoot', event_type: 'wedding', event_date: '2026-05-01', venue_name: 'Hall', client_name: 'Priya', member_id: 'm1', role: 'photographer', status: 'confirmed', notes: null, member: { display_name: 'Raj' } },
      { id: 'a2', booking_id: 'b1', booking_title: 'Shoot', event_type: 'wedding', event_date: '2026-05-01', venue_name: 'Hall', client_name: 'Priya', member_id: 'm2', role: 'videographer', status: 'pending', notes: null, member: { display_name: 'Amit' } },
    ] as any)
    vi.mocked(assignmentRepo.getMemberUnavailability).mockResolvedValue([
      { member_id: 'm3', unavailable_date: '2026-05-01', reason: 'Leave', member: { display_name: 'Neha' } },
    ] as any)

    const result = await AssignmentService.getTeamSchedule({} as any, 's1', { from_date: '2026-05-01', to_date: '2026-05-30' })
    expect(result).toHaveLength(1)
    expect(result[0].bookings).toHaveLength(1)
    expect(result[0].bookings[0].assignments).toHaveLength(2)
    expect(result[0].unavailable_members).toHaveLength(1)
  })

  it('upsertShootBrief validates times, saves, and logs activity', async () => {
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'bookings') return { select: vi.fn(() => chain({ data: { id: 'b1' }, error: null })) }
        return { insert: vi.fn(() => Promise.resolve({ error: null })) }
      }),
    } as any

    await expect(
      AssignmentService.upsertShootBrief(supabase, 'b1', 's1', { shoot_start_time: '18:00', shoot_end_time: '09:00' }, 'u1')
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    vi.mocked(assignmentRepo.upsertShootBrief).mockResolvedValue({
      id: 'sb1',
      booking_id: 'b1',
      key_shots: ['Ceremony'],
      venue_access_notes: 'Venue',
      contact_on_day: 'Priya',
      contact_phone: '9876543210',
      special_instructions: 'No flash',
      equipment_needed: ['Lens'],
      people_to_capture: { call_time: '08:00', reference_images: [] },
      created_at: 'x',
      updated_at: 'y',
    } as any)

    const brief = await AssignmentService.upsertShootBrief(supabase, 'b1', 's1', { call_time: '08:00', shot_list: ['Ceremony'] }, 'u1')
    expect(brief.call_time).toBe('08:00')
    expect(supabase.from).toHaveBeenCalledWith('booking_activity_feed')
  })
})
