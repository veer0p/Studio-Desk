import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { createAssignmentSchema } from '@/lib/validations/team';
import { sendTemplate } from '@/lib/whatsapp/client';
import { sendEmail } from '@/lib/resend/client';
import { logError } from '@/lib/logger';
import { formatIndianDate, formatTime } from '@/lib/formatters';

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: List shoot assignments
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: booking_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: member_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of shoot assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/ShootAssignment' } }
 *                 count: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const bookingId = searchParams.get('booking_id');
    const memberId = searchParams.get('member_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('shoot_assignments')
      .select(`
        *,
        booking:bookings(title, event_date, venue_name, venue_city),
        member:studio_members(display_name, role, phone)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .order('call_time', { ascending: true });

    if (bookingId) query = query.eq('booking_id', bookingId);
    if (memberId) query = query.eq('member_id', memberId);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data, count, page, pageSize: limit });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create shoot assignment
 *     description: |
 *       Assigns a team member to a booking. 
 *       Detects double-booking or unavailability conflicts unless 'force' is used. 
 *       Triggers WhatsApp & Email notifications to the member.
 *     tags: [Team]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ShootAssignmentCreate' }
 *     responses:
 *       201:
 *         description: Assignment created
 *       409:
 *         description: Conflict detected (double booking or unavailability)
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member, studio } = await requireOwner(req);
    const body = await req.json();
    const validated = createAssignmentSchema.parse(body);

    // 1. Fetch member & booking
    const [{ data: targetMember }, { data: booking }] = await Promise.all([
        supabase.from('studio_members').select('*').eq('id', validated.member_id).eq('studio_id', member.studio_id).single(),
        supabase.from('bookings').select('*, client:clients(*)').eq('id', validated.booking_id).eq('studio_id', member.studio_id).single()
    ]);

    if (!targetMember || !targetMember.is_active) return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // 2. Conflict Detection
    const dateStr = validated.call_time.split('T')[0];
    const warnings = [];

    if (!validated.force) {
        // a) Double booked
        const { data: doubleBooked } = await supabase
            .from('shoot_assignments')
            .select('id, booking:bookings(title)')
            .eq('member_id', validated.member_id)
            .ilike('call_time', `${dateStr}%`)
            .maybeSingle();
        
        if (doubleBooked) {
            warnings.push({ type: 'double_booked', booking: doubleBooked.booking });
        }

        // b) Unavailability
        const { data: unavailable } = await supabase
            .from('member_unavailability')
            .select('reason')
            .eq('member_id', validated.member_id)
            .eq('unavailable_date', dateStr)
            .maybeSingle();

        if (unavailable) {
            warnings.push({ type: 'marked_unavailable', reason: unavailable.reason });
        }

        if (warnings.length > 0) {
            return NextResponse.json({ warnings }, { status: 409 });
        }
    }

    // 3. Insert Assignment
    const { data: assignment, error: aErr } = await supabase
      .from('shoot_assignments')
      .insert({
        studio_id: member.studio_id,
        booking_id: validated.booking_id,
        member_id: validated.member_id,
        role: validated.role,
        call_time: validated.call_time,
        call_location: validated.call_location || booking.venue_name,
        day_rate: validated.day_rate,
        notes: validated.notes
      })
      .select()
      .single();

    if (aErr) throw aErr;

    // 4. Notifications
    const eventTime = formatTime(validated.call_time);
    const eventDate = formatIndianDate(booking.event_date);

    await Promise.allSettled([
        sendTemplate({
            to: targetMember.phone,
            templateName: 'shoot_assignment_team',
            variables: [
                booking.title,
                eventDate,
                eventTime,
                booking.venue_name,
                booking.client.full_name,
                booking.client.phone,
                studio.name
            ],
            studioId: member.studio_id
        }),
        sendEmail({
            to: targetMember.email_at_invite,
            subject: `Assignment: ${booking.title} - ${eventDate}`,
            html: `
                <p>Hi ${targetMember.display_name},</p>
                <p>You have been assigned to <strong>${booking.title}</strong>.</p>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p><strong>Call Time:</strong> ${eventTime}</p>
                <p><strong>Location:</strong> ${validated.call_location || booking.venue_name}</p>
            `,
            studioId: member.studio_id
        })
    ]);

    // 5. Update booking status
    await supabase.from('bookings').update({ status: 'shoot_scheduled' }).eq('id', validated.booking_id).eq('status', 'advance_paid');

    await supabase.from('booking_activity_feed').insert({
        booking_id: validated.booking_id,
        studio_id: member.studio_id,
        activity_type: 'team_assigned',
        metadata: { assignment_id: assignment.id, member_name: targetMember.display_name }
    });

    return NextResponse.json({ assignment_id: assignment.id, notification_sent: true });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Create assignment failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
