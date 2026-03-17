import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { updateLeadSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Get lead details
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lead details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lead' }
 *       404:
 *         description: Lead not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        client:clients(*),
        booking:bookings(*),
        assigned_member:studio_members(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leads/{id}:
 *   patch:
 *     summary: Update lead details
 *     description: |
 *       Updates lead info. Strict status transition rules apply:
 *       Stages: new_lead -> contacted -> proposal_sent -> proposal_accepted -> contract_signed.
 *       Cannot move backward except to 'lost'.
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LeadUpdate' }
 *     responses:
 *       200:
 *         description: Lead updated
 *       422:
 *         description: Invalid status transition
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = updateLeadSchema.parse(body);

    const { data: currentLeads } = await supabase.from('leads').select('status').eq('id', params.id).single();
    if (!currentLeads) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Status logic: Check valid transition (Module rules)
    if (validated.status && validated.status !== currentLeads.status) {
      // Forbidden backward step (example check, simplified)
      const stages = ['new_lead', 'contacted', 'proposal_sent', 'proposal_accepted', 'contract_signed'];
      const currentIndex = stages.indexOf(currentLeads.status);
      const nextIndex = stages.indexOf(validated.status);
      
      if (nextIndex !== -1 && nextIndex < currentIndex && validated.status !== 'lost') {
         return NextResponse.json({ error: 'Cannot move lead to a previous stage' }, { status: 422 });
      }
    }

    const { data, error } = await supabase
      .from('leads')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Log status change
    if (validated.status) {
      await supabase.from('booking_activity_feed').insert({
        studio_id: member.studio_id,
        activity_type: 'lead_status_updated',
        metadata: { lead_id: params.id, new_status: validated.status }
      });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Update lead failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Soft-delete lead
 *     description: Marks lead as deleted. Leads converted to bookings cannot be deleted.
 *     tags: [Pipeline]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lead deleted
 *       422:
 *         description: Cannot delete converted lead
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    
    const { data: lead } = await supabase.from('leads').select('booking_id').eq('id', params.id).single();
    if (lead?.booking_id) return NextResponse.json({ error: 'Cannot delete converted lead' }, { status: 422 });

    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
