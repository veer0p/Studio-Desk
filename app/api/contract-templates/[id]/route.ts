import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';
import { renderTemplate } from '@/lib/contracts/template-renderer';
import { logError } from '@/lib/logger';

/**
 * GET /api/contract-templates/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data: template, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    // Render preview with sample data
    const preview = renderTemplate(template.content_html, {
        client_name: '[CLIENT NAME]',
        studio_name: 'Studio Name',
        event_date: '01 Jan 2024',
        event_type: 'Wedding',
        venue: 'Sample Venue',
        total_amount: '₹0.00',
        advance_amount: '₹0.00',
        balance_amount: '₹0.00',
        deliverables: '• Item 1\n• Item 2',
        turnaround_days: '45 working days',
        today_date: '01 Jan 2024',
        payment_schedule: '50% Advance'
    } as any);

    return NextResponse.json({ data: template, rendered_preview: preview });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/contract-templates/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from('contract_templates')
      .update(body)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/contract-templates/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireOwner(req);
    const { error } = await supabase
      .from('contract_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
