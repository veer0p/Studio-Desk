import { createAdminClient } from '@/lib/supabase/admin'
import {
  AUTOMATION_WHATSAPP_TEMPLATES,
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_GALLERY_B_ID,
  CLIENT_MEERA_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  CLIENT_VIKRAM_ID,
  LEAD_1_ID,
  STUDIO_A_ID,
  STUDIO_B_ID,
} from '../../../supabase/seed'

const DB_COMPATIBLE_SETTINGS = [
  {
    automation_type: 'lead_acknowledgment',
    is_enabled: true,
    trigger_offset_days: 0,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'contract_reminder',
    is_enabled: true,
    trigger_offset_days: 3,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'advance_payment_reminder',
    is_enabled: true,
    trigger_offset_days: 3,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'balance_payment_reminder',
    is_enabled: true,
    trigger_offset_days: 3,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'gallery_ready',
    is_enabled: true,
    trigger_offset_days: 0,
    trigger_delay_hours: 0,
    send_email: true,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'shoot_reminder_client',
    is_enabled: true,
    trigger_offset_days: 1,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
]

function addDays(n: number) {
  const value = new Date()
  value.setDate(value.getDate() + n)
  return value
}

function automationLogs() {
  const now = new Date()
  return [
    {
      studio_id: STUDIO_A_ID,
      booking_id: null,
      lead_id: LEAD_1_ID,
      client_id: CLIENT_MEERA_ID,
      automation_type: 'lead_acknowledgment',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '7654321098',
      recipient_email: 'meera@test.com',
      subject: 'Lead acknowledgment',
      message_body: 'Hi Meera Patel, thank you for reaching out to XYZ Photography!',
      provider_message_id: 'wamid.fixture.lead.1',
      scheduled_for: addDays(-1).toISOString(),
      sent_at: addDays(-1).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: null,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'advance_payment_reminder',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Advance payment reminder',
      message_body: 'Hi Priya Sharma, your advance payment is due soon.',
      provider_message_id: 'wamid.fixture.advance.1',
      scheduled_for: addDays(-3).toISOString(),
      sent_at: addDays(-3).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONTRACT_SIGNED_ID,
      lead_id: null,
      client_id: CLIENT_RAJ_ID,
      automation_type: 'gallery_ready',
      channel: 'email',
      status: 'failed',
      recipient_phone: null,
      recipient_email: null,
      subject: 'Your photos are ready',
      message_body: 'Hi Raj Kumar, your photo gallery from XYZ Photography is ready!',
      failure_reason: 'No email for client',
      scheduled_for: addDays(-4).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: null,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'contract_reminder',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Contract reminder',
      message_body: 'Hi Priya Sharma, please sign your agreement with XYZ Photography.',
      provider_message_id: 'wamid.fixture.contract.1',
      scheduled_for: addDays(-5).toISOString(),
      sent_at: addDays(-5).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: null,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'balance_payment_reminder',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Balance payment reminder',
      message_body: 'Hi Priya Sharma, your balance payment is due soon.',
      provider_message_id: 'wamid.fixture.payment.1',
      scheduled_for: addDays(-2).toISOString(),
      sent_at: addDays(-2).toISOString(),
    },
    {
      studio_id: STUDIO_B_ID,
      booking_id: BOOKING_GALLERY_B_ID,
      lead_id: null,
      client_id: CLIENT_VIKRAM_ID,
      automation_type: 'custom',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9966554433',
      recipient_email: 'vikram@test.com',
      subject: 'Outside Studio',
      message_body: 'This log belongs to Studio B.',
      provider_message_id: 'wamid.fixture.studio-b.1',
      scheduled_for: now.toISOString(),
      sent_at: now.toISOString(),
    },
  ]
}

export async function resetAutomationFixtures() {
  const admin = createAdminClient()

  const ops = [
    (admin.from('automation_log') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID]),
    (admin.from('automation_settings') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID]),
    (admin.from('whatsapp_templates') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID]),
    (admin.from('email_templates') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID]),
    (admin.from('rate_limits') as any).delete().like('key', 'automation:%'),
    (admin.from('rate_limits') as any).delete().like('key', 'automation_test:%'),
  ]
  for (const op of ops) {
    const { error } = await op
    if (error) throw error
  }

  const { error: waError } = await (admin.from('whatsapp_templates') as any).insert(
    AUTOMATION_WHATSAPP_TEMPLATES.map((row) => ({ studio_id: STUDIO_A_ID, ...row }))
  )
  if (waError) throw waError

  const { error: emailError } = await (admin.from('email_templates') as any).insert([
    {
      studio_id: STUDIO_A_ID,
      automation_type: 'gallery_ready',
      name: 'Gallery Ready',
      subject: 'Your photos are ready',
      html_body: '<p>Your photo gallery is ready.</p>',
      text_body: 'Your photo gallery is ready.',
      variables_used: ['client_name', 'studio_name', 'gallery_url'],
      is_default: true,
      is_active: true,
    },
  ])
  if (emailError) throw emailError

  const { error: settingsError } = await (admin.from('automation_settings') as any).insert(
    DB_COMPATIBLE_SETTINGS.map((row) => ({ studio_id: STUDIO_A_ID, ...row }))
  )
  if (settingsError) throw settingsError

  const { error: logError } = await (admin.from('automation_log') as any).insert(automationLogs())
  if (logError) throw logError
}
