import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'

const RESEND_API_URL = 'https://api.resend.com/emails'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  studioId?: string | null
  from?: string
}

/**
 * Send email via Resend API and log to email_delivery_logs.
 * Fire-and-forget: do not await in callers that need to return immediately.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id?: string }> {
  const { to, subject, html, studioId = null } = params
  const from = params.from ?? 'StudioDesk <onboarding@resend.dev>'

  let providerMessageId: string | null = null
  let status = 'failed'

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    const body = await res.json().catch(() => ({}))
    if (res.ok && body.id) {
      providerMessageId = body.id
      status = 'sent'
    }
  } catch (err) {
    await logError({
      message: `Resend send failed: ${String(err)}`,
      context: { to: params.to, subject: params.subject },
    })
  }

  try {
    const supabase = createAdminClient()
    await supabase.from('email_delivery_logs').insert({
      studio_id: studioId,
      provider: 'resend',
      to_email: to,
      from_email: from,
      subject,
      status,
      provider_message_id: providerMessageId,
    })
  } catch (e) {
    console.error('[Resend] Failed to log to email_delivery_logs:', e)
  }

  return providerMessageId ? { id: providerMessageId } : {}
}
