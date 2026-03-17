import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';

/**
 * @swagger
 * /api/settings/export:
 *   get:
 *     summary: List data export requests
 *     description: Returns a history of data export requests for the studio.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of export requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ExportRequest' }
 *   post:
 *     summary: Request data export
 *     description: Triggers a background job to export all studio data (clients, bookings, invoices). DPDP compliance.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       202:
 *         description: Export request accepted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ExportRequest' }
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: requests, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('studio_id', member.studio_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('[SETTINGS_EXPORT_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);

    // Check for pending requests
    const { data: pending } = await supabase
      .from('data_export_requests')
      .select('id')
      .eq('studio_id', member.studio_id)
      .eq('status', 'processing')
      .single();

    if (pending) {
      return NextResponse.json({ error: 'An export is already in progress' }, { status: 422 });
    }

    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        studio_id: member.studio_id,
        requested_by: member.id,
        request_type: 'full_studio_backup',
        status: 'processing'
      })
      .select()
      .single();

    if (error) throw error;

    // In a real app, this would trigger a background worker
    // For now we just return the accepted status

    return NextResponse.json(data, { status: 202 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_EXPORT_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
