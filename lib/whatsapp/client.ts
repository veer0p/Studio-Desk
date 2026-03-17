import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';

type WhatsAppParams = {
  to: string;
  templateName: string;
  variables: string[];
  studioId: string;
};

/**
 * sendTemplate
 * 
 * Sends a WhatsApp template message via Interakt API.
 * Logs the attempt to automation_log.
 */
export async function sendTemplate({ to, templateName, variables, studioId }: WhatsAppParams) {
  const supabase = createAdminClient();
  
  // Format phone to +91XXXXXXXXXX
  const formattedPhone = `+91${to.replace(/\D/g, '').slice(-10)}`;

  try {
    const response = await fetch(`${env.WHATSAPP_API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Base ${env.WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        event: templateName,
        traits: variables.reduce((acc, curr, idx) => ({ ...acc, [`var${idx + 1}`]: curr }), {}),
      }),
    });

    const data = await response.json();

    // Log the automation attempt
    await supabase.from('automation_log').insert({
      studio_id: studioId,
      channel: 'whatsapp',
      recipient: formattedPhone,
      template_name: templateName,
      status: response.ok ? 'sent' : 'failed',
      provider_response: data,
    });

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return { messageId: null, status: 'error' };
    }

    return { messageId: data.id || 'success', status: 'sent' };
  } catch (error) {
    console.error('WhatsApp delivery failed:', error);
    
    await supabase.from('automation_log').insert({
      studio_id: studioId,
      channel: 'whatsapp',
      recipient: formattedPhone,
      template_name: templateName,
      status: 'failed',
      provider_response: { error: String(error) },
    });

    return { messageId: null, status: 'error' };
  }
}
