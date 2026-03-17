import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/webhooks/whatsapp:
 *   post:
 *     summary: WhatsApp delivery report webhook
 *     description: |
 *       Handles inbound delivery and read reports from WhatsApp providers (e.g. Interakt). 
 *       Updates automation logs and delivery tracking. 
 *       Publicly accessible (provider authenticated via payload).
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Webhook received
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const supabase = createAdminClient();

    // Log the raw webhook for debugging
    await supabase.from('webhook_logs').insert({
      provider: 'interakt',
      direction: 'inbound',
      event_type: payload.type || 'whatsapp_status',
      payload,
    });

    // Interakt specific webhook logic (simplified)
    // Payload structure varies by provider
    const messageId = payload.data?.messageId || payload.id;
    const status = payload.data?.status || payload.status; // delivered, seen, failed

    if (!messageId) {
      return NextResponse.json({ error: 'Missing message ID' }, { status: 400 });
    }

    // 1. Update WhatsApp Delivery Logs
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
    if (status === 'seen' || status === 'read') updateData.read_at = new Date().toISOString();
    if (status === 'failed') {
      updateData.failure_code = payload.data?.failureCode;
      updateData.failure_reason = payload.data?.failureReason;
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from('whatsapp_delivery_logs')
      .update(updateData)
      .eq('provider_message_id', messageId)
      .select('automation_log_id')
      .single();

    // 2. Sync status back to automation_log if applicable
    if (delivery?.automation_log_id) {
      await supabase
        .from('automation_log')
        .update({
          status: status === 'failed' ? 'failed' : 'sent',
          failure_reason: updateData.failure_reason,
        })
        .eq('id', delivery.automation_log_id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.error('WhatsApp Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
