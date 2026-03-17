import { NextRequest, NextResponse } from 'next/server';
import { requirePortalSession } from '@/lib/portal/auth';

/**
 * @swagger
 * /api/portal/{sessionToken}/booking:
 *   get:
 *     summary: Get booking summary for client portal
 *     description: Returns a safe, client-facing summary of the booking, including contract and invoice status.
 *     tags: [Client Portal]
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The secure portal session token
 *     responses:
 *       200:
 *         description: Booking summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientPortalBooking'
 *       401:
 *         description: Invalid or expired session
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionToken: string } }
) {
  try {
    const { bookingId, studioId, supabase } = await requirePortalSession(req);

    // 1. Fetch Booking Details + Studio Info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        event_name,
        event_date,
        venue_name,
        venue_city,
        status,
        event_type,
        studio:studio_id (
          name,
          logo_url,
          phone,
          email
        )
      `)
      .eq('id', bookingId)
      .eq('studio_id', studioId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Fetch Contract Status
    const { data: contract } = await supabase
      .from('contracts')
      .select('status, signed_at, signed_pdf_url')
      .eq('booking_id', bookingId)
      .single();

    // 3. Fetch Invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('invoice_number, invoice_type, status, total_amount, balance_amount, payment_link_url, due_date')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    // 4. Fetch Gallery Status
    const { data: gallery } = await supabase
      .from('galleries')
      .select('is_published, slug, total_photos')
      .eq('booking_id', bookingId)
      .single();

    // 5. Check Questionnaire Status
    const { data: questionnaire } = await supabase
      .from('questionnaire_responses')
      .select('submitted_at')
      .eq('booking_id', bookingId)
      .single();

    const result = {
      booking_title: booking.event_name,
      event_type: booking.event_type,
      event_date: booking.event_date,
      venue_name: booking.venue_name,
      venue_city: booking.venue_city,
      status: booking.status,
      studio: booking.studio,
      contract: contract ? {
        status: contract.status,
        signed_at: contract.signed_at,
        signed_pdf_url: contract.signed_pdf_url
      } : null,
      invoices: invoices?.map(inv => ({
        invoice_number: inv.invoice_number,
        type: inv.invoice_type,
        status: inv.status,
        amount_due: inv.balance_amount,
        payment_link_url: inv.payment_link_url,
        due_date: inv.due_date
      })) || [],
      gallery: gallery ? {
        is_published: gallery.is_published,
        gallery_url: gallery.is_published ? `/galleries/public/${gallery.slug}` : null,
        total_photos: gallery.total_photos
      } : null,
      questionnaire_submitted: !!questionnaire?.submitted_at
    };

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[PORTAL_BOOKING_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
