import { NextRequest, NextResponse } from 'next/server';
import { requirePortalSession } from '@/lib/portal/auth';
import { questionnaireResponseSchema } from '@/lib/validations/portal';

/**
 * @swagger
 * /api/portal/{sessionToken}/questionnaire:
 *   get:
 *     summary: Get questionnaire responses
 *     description: Retrieves the current questionnaire responses for the booking.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questionnaire retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireResponse'
 *   post:
 *     summary: Submit/Update questionnaire
 *     description: Upserts questionnaire responses. Locked 7 days before the event.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionnaireResponse'
 *     responses:
 *       200:
 *         description: Questionnaire submitted successfully
 *       422:
 *         description: Questionnaire is locked (too close to event)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, supabase } = await requirePortalSession(req);

    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json(data || {});
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[PORTAL_QUESTIONNAIRE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, studioId, clientId, supabase } = await requirePortalSession(req);

    // 1. Check if locked (7 days before event)
    const { data: booking } = await supabase
      .from('bookings')
      .select('event_date')
      .eq('id', bookingId)
      .single();

    if (booking?.event_date) {
      const eventDate = new Date(booking.event_date);
      const now = new Date();
      const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return NextResponse.json({ 
          error: 'Questionnaire is locked as the event is less than 7 days away. Please contact the studio for any changes.',
          code: 'QUESTIONNAIRE_LOCKED'
        }, { status: 422 });
      }
    }

    const body = await req.json();
    const validated = questionnaireResponseSchema.parse(body);

    // 2. Upsert
    const { data: response, error: upsertError } = await supabase
      .from('questionnaire_responses')
      .upsert({
        booking_id: bookingId,
        studio_id: studioId,
        ...validated,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // 3. Notify studio
    const { data: client } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', clientId)
      .single();

    await supabase.from('notifications').insert({
      studio_id: studioId,
      type: 'portal_questionnaire',
      title: 'Questionnaire Submitted',
      body: `${client?.full_name || 'A client'} has submitted their event questionnaire.`,
      metadata: { booking_id: bookingId }
    });

    return NextResponse.json({ submitted: true, submitted_at: response.submitted_at });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PORTAL_QUESTIONNAIRE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
