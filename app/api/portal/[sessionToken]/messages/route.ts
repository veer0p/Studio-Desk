import { NextRequest, NextResponse } from 'next/server';
import { requirePortalSession } from '@/lib/portal/auth';

/**
 * @swagger
 * /api/portal/{sessionToken}/messages:
 *   get:
 *     summary: Get message thread for this booking
 *     description: Returns the full conversation history. Marks studio messages as read.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message thread retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientPortalMessage'
 *                 unread_count:
 *                   type: integer
 *   post:
 *     summary: Client sends message
 *     description: Allows the client to send a message to the studio regarding this booking.
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
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: 'string' }
 *               attachment_urls: { type: 'array', items: { type: 'string', format: 'uri' } }
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientPortalMessage'
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, supabase } = await requirePortalSession(req);

    // 1. Fetch messages
    const { data: messages, error } = await supabase
      .from('client_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Mark studio messages as read
    await supabase
      .from('client_messages')
      .update({ is_read: true })
      .eq('booking_id', bookingId)
      .eq('sender_type', 'studio')
      .eq('is_read', false);

    const unread_count = messages?.filter(m => m.sender_type === 'studio' && !m.is_read).length || 0;

    return NextResponse.json({
      messages: messages || [],
      unread_count: unread_count
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[PORTAL_MESSAGES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, studioId, clientId, supabase } = await requirePortalSession(req);

    const { message, attachment_urls } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('client_messages')
      .insert({
        booking_id: bookingId,
        studio_id: studioId,
        sender_type: 'client',
        message,
        attachment_urls: attachment_urls || []
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Notify studio (owner)
    const { data: client } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', clientId)
      .single();

    await supabase.from('notifications').insert({
      studio_id: studioId,
      type: 'portal_message',
      title: 'New message from client',
      body: `${client?.full_name || 'A client'} sent a message regarding their booking.`,
      metadata: { booking_id: bookingId, message_id: newMessage.id }
    });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[PORTAL_MESSAGES_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
