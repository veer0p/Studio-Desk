import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';
import { sendTemplate } from '@/lib/whatsapp/client';

/**
 * @swagger
 * /api/proposals/public/{token}:
 *   get:
 *     summary: Public proposal portal view
 *     description: |
 *       Retrieves proposal details for public viewing. 
 *       Marks as viewed on first access.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proposal details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Proposal' }
 *       410:
 *         description: Proposal expired
 *       404:
 *         description: Not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        studio:studios(name, logo_url, business_address, city, state, phone, gstin),
        client:clients(full_name, email),
        line_items:proposal_line_items(*),
        booking:bookings(*)
      `)
      .eq('access_token', params.token)
      .single();

    if (error || !proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    if (new Date(proposal.valid_until) < new Date()) {
        return NextResponse.json({ error: 'Proposal has expired' }, { status: 410 });
    }

    // Mark viewed
    if (!proposal.viewed_at) {
        await supabase.from('proposals').update({ viewed_at: new Date().toISOString() }).eq('id', proposal.id);
    }

    return NextResponse.json({ data: proposal });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/proposals/public/{token}:
 *   post:
 *     summary: Accept proposal
 *     description: |
 *       Accepts the proposal, updates lead status, and triggers auto-creation of contract draft.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proposal accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 contract_id: { type: string, format: uuid }
 *                 contract_access_token: { type: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createAdminClient();
    
    // 1. Fetch
    const { data: proposal } = await supabase
      .from('proposals')
      .select('*, studio:studios(*), client:clients(*)')
      .eq('access_token', params.token)
      .single();

    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Update Proposal
    await supabase.from('proposals').update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
    }).eq('id', proposal.id);

    // 3. Update Lead
    await supabase.from('leads').update({ status: 'proposal_accepted' }).eq('booking_id', proposal.booking_id);

    // 4. Auto-create Contract Draft (Variable replacement logic will be in contract route)
    // We just trigger it by resolving the default template
    const { data: template } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('studio_id', proposal.studio_id)
        .eq('is_default', true)
        .eq('event_type', proposal.booking_event_type || 'other')
        .maybeSingle();

    let contract_id = null;
    let contract_token = generateSecureToken();

    if (template) {
        const { data: contract } = await supabase.from('contracts').insert({
            studio_id: proposal.studio_id,
            booking_id: proposal.booking_id,
            client_id: proposal.client_id,
            template_id: template.id,
            status: 'draft',
            access_token: contract_token
        }).select().single();
        contract_id = contract?.id;
    }

    // 5. Notify Owner
    sendTemplate({
        to: proposal.studio.phone,
        templateName: 'proposal_accepted_owner',
        variables: [proposal.client.full_name, proposal.studio.name],
        studioId: proposal.studio_id
    });

    await supabase.from('booking_activity_feed').insert({
        booking_id: proposal.booking_id,
        studio_id: proposal.studio_id,
        activity_type: 'proposal_accepted',
        metadata: { proposal_id: proposal.id, contract_id }
    });

    return NextResponse.json({ success: true, contract_id, contract_access_token: contract_token });

  } catch (error: any) {
    await logError({ message: 'Public proposal acceptance failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
