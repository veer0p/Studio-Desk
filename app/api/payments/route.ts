import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: List payments for current studio
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: booking_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [captured, failed, refunded] }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Payment' } }
 *                 count: { type: integer }
 *                 page: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number),
        client:clients(name)
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .order('payment_date', { ascending: false });

    if (bookingId) query = query.eq('booking_id', bookingId);
    if (status) query = query.eq('status', status);
    if (fromDate) query = query.gte('payment_date', fromDate);
    if (toDate) query = query.lte('payment_date', toDate);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
        data,
        count: count || 0,
        page,
        pageSize: limit
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'List payments failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
