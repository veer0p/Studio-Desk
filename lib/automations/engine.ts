import { createAdminClient } from '../supabase/admin';
import { ResendClient } from '../resend/client';
import { WhatsAppClient } from '../whatsapp/client';
import { logger } from '../logger';

/**
 * Process pending automations in the queue.
 * This would typically be run by a cron job or background worker.
 */
export async function processAutomationQueue() {
  const supabase = createAdminClient();
  const resend = new ResendClient();
  const whatsapp = new WhatsAppClient();

  // 1. Get pending automations that are due
  const { data: queue, error } = await supabase
    .from('automation_log')
    .select('*, studios(*)')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50);

  if (error || !queue) {
    if (error) logger.error('Failed to fetch automation queue:', error);
    return;
  }

  if (queue.length === 0) return;

  logger.info(`Processing ${queue.length} automations...`);

  for (const item of queue) {
    try {
      // Mark as sending/running? We don't have a 'processing' status in enum, so we use idempotency or just try/catch
      
      let deliveryId = '';
      let success = false;

      if (item.channel === 'email') {
        const result = await resend.sendEmail({
          to: item.recipient_email,
          subject: item.subject,
          html: item.message_body,
        });
        deliveryId = result.id;
        success = true;
      } else if (item.channel === 'whatsapp') {
        // WhatsApp notification - assuming we are using a template-based system
        const result = await whatsapp.sendTemplateMessage({
          to: item.recipient_phone,
          templateName: item.message_body, // Reusing message_body to store template name for WhatsApp
          // In a real scenario, we'd pass components/variables here
        });
        deliveryId = result.messageId;
        success = true;
      }

      if (success) {
        await supabase
          .from('automation_log')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: deliveryId,
          })
          .eq('id', item.id);
        
        // Log delivery specifically for tracking
        if (item.channel === 'email') {
          await supabase.from('email_delivery_logs').insert({
            studio_id: item.studio_id,
            automation_log_id: item.id,
            to_email: item.recipient_email,
            from_email: 'noreply@studiodesk.in', // Default or studio specific
            subject: item.subject,
            provider_message_id: deliveryId,
            status: 'sent',
          });
        } else {
          await supabase.from('whatsapp_delivery_logs').insert({
            studio_id: item.studio_id,
            automation_log_id: item.id,
            to_phone: item.recipient_phone,
            provider_message_id: deliveryId,
            status: 'sent',
          });
        }
      }
    } catch (err: any) {
      logger.error(`Failed to process automation ${item.id}:`, err);
      
      await supabase
        .from('automation_log')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          failure_reason: err.message || 'Unknown error',
          retry_count: item.retry_count + 1,
        })
        .eq('id', item.id);
    }
  }
}
