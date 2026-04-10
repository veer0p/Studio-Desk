import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'
import nodemailer from 'nodemailer'

// Create SMTP transporter if credentials are available
const smtpTransporter = env.SMTP_USER && env.SMTP_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null

const RESEND_API_URL = 'https://api.resend.com/emails'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  studioId?: string | null
  from?: string
}

/**
 * Send email via SMTP (Gmail) or Resend API and log to email_delivery_logs.
 * Prefers SMTP over Resend. Fire-and-forget: do not await in callers that need to return immediately.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id?: string }> {
  const { to, subject, html, studioId = null } = params
  const from = params.from ?? (smtpTransporter ? `${env.SMTP_FROM_NAME || 'StudioDesk'} <${env.SMTP_USER}>` : 'StudioDesk <onboarding@resend.dev>')

  // Log for development
  console.log('--- outgoing email ---')
  console.log(`To:      ${to}`)
  console.log(`From:    ${from}`)
  console.log(`Subject: ${subject}`)
  console.log(`HTML:    ${html.substring(0, 100)}...`)
  console.log('----------------------')

  let providerMessageId: string | null = null
  let status = 'failed'
  let provider = 'unknown'

  try {
    if (smtpTransporter) {
      // Use SMTP (Gmail)
      provider = 'smtp-gmail'
      const info = await smtpTransporter.sendMail({
        from,
        to,
        subject,
        html,
      })
      providerMessageId = info.messageId
      status = 'sent'
      console.log(`[SMTP] Email sent to ${to}: ${info.messageId}`)
    } else if (env.RESEND_API_KEY && !env.RESEND_API_KEY.startsWith('rzp_test_') && !env.RESEND_API_KEY.startsWith('re_')) {
      // Fallback to Resend
      provider = 'resend'
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
    } else {
      console.warn('[Email] No email provider configured. Set SMTP_USER/SMTP_PASS or RESEND_API_KEY.')
      status = 'skipped'
    }
  } catch (err) {
    await logError({
      message: `Email send failed (${provider}): ${String(err)}`,
      context: { to: params.to, subject: params.subject },
    })
  }

  try {
    const supabase = createAdminClient()
    await supabase.from('email_delivery_logs').insert({
      studio_id: studioId,
      provider,
      to_email: to,
      from_email: from,
      subject,
      status,
      provider_message_id: providerMessageId,
    })
  } catch (e) {
    console.error('[Email] Failed to log to email_delivery_logs:', e)
  }

  return providerMessageId ? { id: providerMessageId } : {}
}
