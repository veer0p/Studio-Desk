import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth/guards';
import { revisionRequestSchema } from '@/lib/validations/leads';
import { logError } from '@/lib/logger';

/**
 * POST /api/contracts/[id]/revision
 * Publicly accessible (client calling back after seeing contract) 
 * but usually called from portal with access_token.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const validated = revisionRequestSchema.parse(body);

    const { data: contract } = await supabase.from('contracts').select('id, studio_id, booking_id').eq('id', params.id).single();
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Insert Revision
    await supabase.from('contract_revisions').insert({
        studio_id: contract.studio_id,
        contract_id: contract.id,
        revision_note: validated.revision_note,
        status: 'pending'
    });

    // Reset contract to draft
    await supabase.from('contracts').update({ status: 'draft' }).eq('id', contract.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/contracts/[id]/revision
 * Studio owner resolves revision.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, member } = await requireAuth(req);
        const { revision_id, resolution_note, new_content_html } = await req.json();

        // 1. Resolve Revision record
        await supabase.from('contract_revisions').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution_note
        }).eq('id', revision_id);

        // 2. Update Contract Content
        if (new_content_html) {
            await supabase.from('contracts').update({
                content_html: new_content_html
            }).eq('id', params.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error instanceof NextResponse) return error;
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
