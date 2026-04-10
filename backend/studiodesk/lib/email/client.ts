import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'
import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  studioId?: string | null
  from?: string
}

/**
 * Send email via Gmail SMTP and log to email_delivery_logs.
 * Fire-and-forget: do not await in callers that need to return immediately.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id?: string }> {
  const { to, subject, html, studioId = null } = params
  const from = params.from ?? `${env.SMTP_FROM_NAME || 'StudioDesk'} <${env.SMTP_USER}>`

  // Log for development
  console.log('--- outgoing email ---')
  console.log(`To:      ${to}`)
  console.log(`From:    ${from}`)
  console.log(`Subject: ${subject}`)
  console.log(`HTML:    ${html.substring(0, 100)}...`)
  console.log('----------------------')

  let providerMessageId: string | null = null
  let status = 'failed'

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    providerMessageId = info.messageId
    status = 'sent'
    console.log(`[SMTP] Email sent to ${to}: ${info.messageId}`)
  } catch (err) {
    await logError({
      message: `SMTP send failed: ${String(err)}`,
      context: { to: params.to, subject: params.subject },
    })
  }

  try {
    const supabase = createAdminClient()
    await supabase.from('email_delivery_logs').insert({
      studio_id: studioId,
      provider: 'smtp-gmail',
      to_email: to,
      from_email: from,
      subject,
      status,
      provider_message_id: providerMessageId,
    })
  } catch (e) {
    console.error('[SMTP] Failed to log to email_delivery_logs:', e)
  }

  return providerMessageId ? { id: providerMessageId } : {}
}
