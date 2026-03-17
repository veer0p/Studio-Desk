import { Resend } from 'resend';
import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(env.RESEND_API_KEY);

type EmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  studioId?: string;
  automationType?: string;
};

/**
 * sendEmail
 * 
 * Sends an email via Resend API.
 * Logs the delivery to email_delivery_logs.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'StudioDesk <noreply@studiodesk.in>',
  replyTo,
  studioId,
  automationType,
}: EmailParams) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      reply_to: replyTo,
    });

    // Log the delivery status
    if (studioId) {
      await supabase.from('email_delivery_logs').insert({
        studio_id: studioId,
        recipient: Array.isArray(to) ? to.join(',') : to,
        subject,
        status: error ? 'failed' : 'delivered',
        provider_message_id: data?.id,
        error_details: error ? JSON.stringify(error) : null,
        automation_type: automationType,
      });
    }

    if (error) {
      console.error('Resend API error:', error);
      return { id: null, status: 'error' };
    }

    return { id: data?.id, status: 'sent' };
  } catch (error) {
    console.error('Email delivery failed:', error);

    if (studioId) {
      await supabase.from('email_delivery_logs').insert({
        studio_id: studioId,
        recipient: Array.isArray(to) ? to.join(',') : to,
        subject,
        status: 'failed',
        error_details: String(error),
        automation_type: automationType,
      });
    }

    return { id: null, status: 'error' };
  }
}
