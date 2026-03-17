import { createAdminClient } from '../supabase/admin';
import { replaceVariables } from './variables';
import { logger } from '../logger';

/**
 * Logic to enqueue automations based on business events.
 * This is called from various API routes when events occur.
 */
export const Scheduler = {
  /**
   * Enqueues an automation for a specific event.
   */
  async enqueue({
    studioId,
    type,
    recipientEmail,
    recipientPhone,
    bookingId,
    leadId,
    clientId,
    variables,
    scheduledFor = new Date(),
  }: {
    studioId: string;
    type: string;
    recipientEmail?: string;
    recipientPhone?: string;
    bookingId?: string;
    leadId?: string;
    clientId?: string;
    variables: any;
    scheduledFor?: Date;
  }) {
    const supabase = createAdminClient();

    try {
      // 1. Fetch automation settings for this studio/type
      const { data: settings, error: settingsError } = await supabase
        .from('automation_settings')
        .select('*, email_templates(*), whatsapp_templates(*)')
        .eq('studio_id', studioId)
        .eq('automation_type', type)
        .single();

      if (settingsError || !settings?.is_enabled) {
        logger.info(`Automation ${type} skipped for studio ${studioId}: Disabled or not found`);
        return;
      }

      // 2. Prepare Email if enabled
      if (settings.send_email && recipientEmail && settings.email_templates) {
        const body = replaceVariables(settings.email_templates.html_body, variables);
        const subject = settings.custom_subject || settings.email_templates.subject;

        await supabase.from('automation_log').insert({
          studio_id: studioId,
          booking_id: bookingId,
          lead_id: leadId,
          client_id: clientId,
          automation_type: type,
          channel: 'email',
          status: 'pending',
          recipient_email: recipientEmail,
          subject,
          message_body: body,
          scheduled_for: scheduledFor.toISOString(),
        });
      }

      // 3. Prepare WhatsApp if enabled
      if (settings.send_whatsapp && recipientPhone && settings.whatsapp_templates) {
        // WhatsApp templates are usually handled by providers like Interakt
        // We log it here for the engine to process
        await supabase.from('automation_log').insert({
          studio_id: studioId,
          booking_id: bookingId,
          lead_id: leadId,
          client_id: clientId,
          automation_type: type,
          channel: 'whatsapp',
          status: 'pending',
          recipient_phone: recipientPhone,
          message_body: settings.whatsapp_templates.body_text, // Original template
          scheduled_for: scheduledFor.toISOString(),
        });
      }

      logger.info(`Automation ${type} enqueued for studio ${studioId}`);
    } catch (err) {
      logger.error(`Failed to enqueue automation ${type}:`, err);
    }
  },

  /**
   * Helper to trigger lead acknowledgment
   */
  async triggerLeadAcknowledgment(lead: any, studio: any) {
    await this.enqueue({
      studioId: studio.id,
      type: 'lead_acknowledgment',
      recipientEmail: lead.email,
      recipientPhone: lead.phone,
      leadId: lead.id,
      clientId: lead.client_id,
      variables: {
        client: { full_name: lead.full_name },
        studio: { name: studio.name, slug: studio.slug },
      },
    });
  },

  /**
   * Helper to trigger payment reminder
   */
  async triggerPaymentReminder(invoice: any, client: any, studio: any) {
    await this.enqueue({
      studioId: studio.id,
      type: 'balance_payment_reminder',
      recipientEmail: client.email,
      recipientPhone: client.phone,
      bookingId: invoice.booking_id,
      clientId: client.id,
      variables: {
        client,
        studio,
        invoice: {
          invoice_number: invoice.invoice_number,
          total_amount: invoice.total_amount,
          amount_pending: invoice.amount_pending,
          due_date: invoice.due_date,
          payment_link: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/public/${invoice.access_token}`,
        },
      },
      scheduledFor: new Date(), // Immediate or based on due date logic
    });
  }
};
