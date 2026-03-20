import { createAdminClient } from '@/lib/supabase/admin'
import {
  ASSIGNMENT_CONFIRMED_ID,
  ASSIGNMENT_CONFLICT_ID,
  ASSIGNMENT_PENDING_ID,
  BOOKING_ASSIGNMENT_CONFLICT_ID,
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_INVOICE_NEW_ID,
  CLIENT_ANITA_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  EDITOR_MEMBER_ID,
  MEMBER_UNAVAILABLE_ID,
  PACKAGE_CORPORATE_ID,
  PACKAGE_PORTRAIT_ID,
  PACKAGE_WEDDING_ID,
  PHOTOGRAPHER_MEMBER_ID,
  SHOOT_BRIEF_ID,
  STUDIO_A_ID,
} from '../../../supabase/seed'

function addDays(n: number) {
  const value = new Date()
  value.setDate(value.getDate() + n)
  return value
}

export async function resetAssignmentFixtures() {
  const admin = createAdminClient()
  const eventDate = addDays(20).toISOString().slice(0, 10)
  const confirmedAt = addDays(-1).toISOString()

  await admin.from('booking_activity_feed').delete().eq('studio_id', STUDIO_A_ID).in('event_type', ['team_assigned', 'shoot_confirmed', 'status_changed', 'note_added'])
  await admin.from('automation_log').delete().eq('studio_id', STUDIO_A_ID).eq('automation_type', 'custom')
  await admin.from('shoot_assignments').delete().eq('studio_id', STUDIO_A_ID)
  await admin.from('shoot_briefs').delete().eq('studio_id', STUDIO_A_ID)
  await admin.from('member_unavailability').delete().eq('studio_id', STUDIO_A_ID)

  await admin.from('studio_members').upsert(
    [
      {
        id: PHOTOGRAPHER_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        role: 'photographer',
        display_name: 'Raj Joshi',
        phone: '9876500001',
        whatsapp: '9876500001',
        specialization: ['wedding', 'portrait'],
        is_active: true,
      },
      {
        id: EDITOR_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        role: 'editor',
        display_name: 'Amit Shah',
        phone: '9876500002',
        whatsapp: '9876500002',
        specialization: ['corporate', 'video'],
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )

  await admin.from('bookings').upsert(
    [
      {
        id: BOOKING_CONVERTED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_PRIYA_ID,
        title: 'Priya Sharma - Wedding',
        event_type: 'wedding',
        event_date: eventDate,
        venue_name: 'Hotel Grand, Surat',
        total_amount: 85000,
        advance_amount: 25500,
        amount_paid: 25500,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_WEDDING_ID,
        package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 },
      },
      {
        id: BOOKING_ASSIGNMENT_CONFLICT_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        title: 'Anita Shah - Same Day Wedding Coverage',
        event_type: 'wedding',
        event_date: eventDate,
        venue_name: 'Royal Palace, Surat',
        total_amount: 65000,
        advance_amount: 20000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_WEDDING_ID,
        package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 },
      },
      {
        id: BOOKING_CONTRACT_SIGNED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Raj Kumar - Corporate Event',
        event_type: 'corporate',
        event_date: eventDate,
        venue_name: 'Convention Centre, Ahmedabad',
        total_amount: 45000,
        advance_amount: 15000,
        amount_paid: 15000,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_CORPORATE_ID,
        package_snapshot: { id: PACKAGE_CORPORATE_ID, name: 'Corporate Event', turnaround_days: 7 },
      },
      {
        id: BOOKING_INVOICE_NEW_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Meera Patel - Portrait Session',
        event_type: 'portrait',
        event_date: addDays(20).toISOString().slice(0, 10),
        venue_name: 'Studio One, Surat',
        total_amount: 18000,
        advance_amount: 5000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_PORTRAIT_ID,
        package_snapshot: { id: PACKAGE_PORTRAIT_ID, name: 'Portrait Premium', turnaround_days: 10 },
      },
    ],
    { onConflict: 'id' }
  )

  await admin.from('shoot_assignments').insert([
    {
      id: ASSIGNMENT_CONFIRMED_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      role: 'photographer',
      call_time: `${eventDate}T08:00:00.000Z`,
      call_location: JSON.stringify({ role: 'photographer', status: 'confirmed' }),
      notes: 'Main photographer for ceremony',
      is_confirmed: true,
      confirmed_at: confirmedAt,
    },
    {
      id: ASSIGNMENT_PENDING_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      member_id: EDITOR_MEMBER_ID,
      role: 'videographer',
      call_time: `${eventDate}T08:00:00.000Z`,
      call_location: JSON.stringify({ role: 'videographer', status: 'pending' }),
      notes: 'Handle candid video coverage',
      is_confirmed: false,
    },
    {
      id: ASSIGNMENT_CONFLICT_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_ASSIGNMENT_CONFLICT_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      role: 'photographer',
      call_time: `${eventDate}T07:00:00.000Z`,
      call_location: JSON.stringify({ role: 'photographer', status: 'confirmed' }),
      notes: 'Existing same-day assignment for conflict checks',
      is_confirmed: true,
      confirmed_at: confirmedAt,
    },
  ])

  await admin.from('shoot_briefs').upsert(
    {
      id: SHOOT_BRIEF_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      key_shots: ['Bridal prep', 'Ceremony', 'Reception'],
      venue_access_notes: 'Hotel Grand, Ring Road, Surat',
      contact_on_day: 'Priya Sharma',
      contact_phone: '9876543210',
      special_instructions: 'Bride allergic to flash',
      equipment_needed: ['Bring 70-200mm lens'],
      people_to_capture: {
        call_time: '08:00',
        shoot_start_time: '09:00',
        shoot_end_time: '20:00',
        venue_map_link: 'https://maps.google.com/?q=Hotel+Grand+Surat',
        client_whatsapp: '9876543210',
        reference_images: [],
        equipment_notes: 'Bring 70-200mm lens',
        outfit_notes: 'Wear formal black attire',
      },
    },
    { onConflict: 'booking_id' }
  )

  await admin.from('member_unavailability').upsert(
    {
      id: MEMBER_UNAVAILABLE_ID,
      studio_id: STUDIO_A_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      unavailable_date: eventDate,
      reason: 'Personal leave',
      all_day: true,
    },
    { onConflict: 'id' }
  )
}
