/**
 * StudioDesk local seed (Modules 1 & 2).
 * Run after: npx supabase db reset
 * Usage: npm run db:seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (e.g. from `npx supabase status` or .env.local).
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  STUDIO_A_ID,
  STUDIO_B_ID,
  OWNER_USER_ID,
  PHOTOGRAPHER_USER_ID,
  EDITOR_USER_ID,
  OUTSIDER_USER_ID,
  OWNER_MEMBER_ID,
  PHOTOGRAPHER_MEMBER_ID,
  EDITOR_MEMBER_ID,
  OUTSIDER_MEMBER_ID,
  PACKAGE_WEDDING_ID,
  PACKAGE_CORPORATE_ID,
  PACKAGE_PORTRAIT_ID,
  PACKAGE_BIRTHDAY_INACTIVE_ID,
  ADDON_DRONE_ID,
  ADDON_SHOOTER_ID,
  ADDON_SDE_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  CLIENT_MEERA_ID,
  CLIENT_DEV_ID,
  CLIENT_ANITA_ID,
  CLIENT_VIKRAM_ID,
  LEAD_1_ID,
  LEAD_2_ID,
  LEAD_3_ID,
  LEAD_4_ID,
  LEAD_5_ID,
  LEAD_6_ID,
  LEAD_7_ID,
  LEAD_8_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_INVOICE_NEW_ID,
  BOOKING_INVOICE_DUP_ID,
  BOOKING_INVOICE_PAID_ID,
  BOOKING_INVOICE_OVERDUE_ID,
  BOOKING_INVOICE_LINK_ID,
  BOOKING_ASSIGNMENT_CONFLICT_ID,
  BOOKING_GALLERY_B_ID,
  INQUIRY_FORM_CONFIG_A_ID,
  INVITE_PENDING_ID,
  INVITE_EXPIRED_ID,
  STUDIO_SETTINGS_A_ID,
  STUDIO_SETTINGS_B_ID,
  CONTRACT_TEMPLATE_WEDDING_ID,
  CONTRACT_TEMPLATE_GENERAL_ID,
  CONTRACT_DRAFT_ID,
  CONTRACT_SENT_ID,
  CONTRACT_SIGNED_ID,
  CONTRACT_REMINDER_ID,
  INVOICE_DRAFT_ID,
  INVOICE_SENT_ID,
  INVOICE_PAID_ID,
  INVOICE_OVERDUE_ID,
  INVOICE_LINK_ID,
  INVOICE_CREDIT_NOTE_ID,
  PAYMENT_MANUAL_ID,
  PAYMENT_RAZORPAY_ID,
  ASSIGNMENT_CONFIRMED_ID,
  ASSIGNMENT_PENDING_ID,
  ASSIGNMENT_CONFLICT_ID,
  SHOOT_BRIEF_ID,
  MEMBER_UNAVAILABLE_ID,
  GALLERY_DRAFT_ID,
  GALLERY_PUBLISHED_ID,
  GALLERY_STUDIO_B_ID,
  FACE_CLUSTER_BRIDE_ID,
  FACE_CLUSTER_UNKNOWN_ID,
  FACE_CLUSTER_GROOM_ID,
  UPLOAD_JOB_COMPLETED_ID,
  UPLOAD_JOB_PROCESSING_ID,
  IMMICH_PERSON_BRIDE_ID,
  IMMICH_PERSON_UNKNOWN_ID,
  IMMICH_PERSON_GROOM_ID,
  ONBOARDING_A_EVT_1,
  ONBOARDING_A_EVT_2,
  ONBOARDING_A_EVT_3,
  ONBOARDING_A_EVT_4,
  ONBOARDING_A_EVT_5,
  PLAN_STARTER_ID,
  PLAN_STUDIO_ID,
  PLAN_AGENCY_ID,
  INVITE_PENDING_TOKEN,
  INVITE_EXPIRED_TOKEN,
  CONTRACT_DRAFT_TOKEN,
  CONTRACT_SENT_TOKEN,
  CONTRACT_SIGNED_TOKEN,
  CONTRACT_REMINDER_TOKEN,
  INVOICE_DRAFT_TOKEN,
  INVOICE_SENT_TOKEN,
  INVOICE_PAID_TOKEN,
  INVOICE_OVERDUE_TOKEN,
  INVOICE_LINK_TOKEN,
  INVOICE_CREDIT_NOTE_TOKEN,
  GALLERY_DRAFT_TOKEN,
  GALLERY_PUBLISHED_TOKEN,
  GALLERY_STUDIO_B_TOKEN,
  SEED_IDS,
} from './seed-ids'

export * from './seed-ids'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DEFAULT_LOCAL_SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? DEFAULT_LOCAL_SERVICE_ROLE

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function buildRevenueSnapshots(now: Date) {
  const rows = []
  for (let offset = 89; offset >= 0; offset -= 1) {
    const day = addDays(now, -offset)
    const amount = 3000 + ((89 - offset) * 137) % 12001
    rows.push({
      studio_id: STUDIO_A_ID,
      snapshot_date: day.toISOString().slice(0, 10),
      total_bookings: 8 + ((89 - offset) % 8),
      new_leads: (89 - offset) % 4,
      invoices_sent: 4 + ((89 - offset) % 5),
      revenue_collected: Number(amount.toFixed(2)),
      photos_delivered: 1 + ((89 - offset) % 6),
      storage_used_gb: Number((2.5 + (89 - offset) * 0.03).toFixed(4)),
    })
  }
  return rows
}

export const DEFAULT_AUTOMATION_SETTINGS = [
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
    automation_type: 'lead_follow_up',
    is_enabled: true,
    trigger_offset_days: 2,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'proposal_sent',
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
    automation_type: 'proposal_reminder',
    is_enabled: true,
    trigger_offset_days: 2,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'contract_sent',
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
    automation_type: 'contract_signed',
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
    automation_type: 'payment_overdue_reminder',
    is_enabled: true,
    trigger_offset_days: 1,
    trigger_delay_hours: 0,
    send_email: true,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'payment_received',
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
    automation_type: 'gallery_reminder',
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
    automation_type: 'shoot_reminder',
    is_enabled: true,
    trigger_offset_days: 1,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
  {
    automation_type: 'post_shoot_followup',
    is_enabled: false,
    trigger_offset_days: 1,
    trigger_delay_hours: 0,
    send_email: false,
    send_whatsapp: true,
    send_sms: false,
    custom_subject: null,
    custom_message: null,
  },
] as const

export const AUTOMATION_WHATSAPP_TEMPLATES = [
  {
    automation_type: 'lead_acknowledgment',
    template_name: 'Lead Acknowledgment',
    provider_template_id: 'tmpl_lead_ack',
    language: 'en',
    category: 'utility',
    body_text:
      'Hi {{client_name}}, thank you for reaching out to {{studio_name}}! We received your inquiry for {{event_type}} on {{event_date}}.',
    variables: ['client_name', 'studio_name', 'event_type', 'event_date'],
    status: 'approved',
    is_active: true,
  },
  {
    automation_type: 'gallery_ready',
    template_name: 'Gallery Ready',
    provider_template_id: 'tmpl_gallery_ready',
    language: 'en',
    category: 'utility',
    body_text:
      'Hi {{client_name}}, your photo gallery from {{studio_name}} is ready! View it here: {{gallery_url}}',
    variables: ['client_name', 'studio_name', 'gallery_url'],
    status: 'approved',
    is_active: true,
  },
] as const

export const AUTOMATION_EMAIL_TEMPLATES = [
  {
    automation_type: 'proposal_sent',
    name: 'Proposal Sent',
    subject: 'Your proposal from {{studio_name}} is ready',
    html_body:
      '<p>Hi {{client_name}}, your photography proposal from <strong>{{studio_name}}</strong> is ready.</p>',
    text_body: 'Hi {{client_name}}, your photography proposal from {{studio_name}} is ready.',
    variables_used: ['client_name', 'studio_name'],
    is_default: true,
    is_active: true,
  },
] as const

function buildAutomationLogs(now: Date) {
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
      message_body:
        'Hi Meera Patel, thank you for reaching out to XYZ Photography! We received your inquiry for wedding on 15 Nov 2025.',
      provider_message_id: 'wamid.seed.lead.1',
      scheduled_for: addDays(now, -1).toISOString(),
      sent_at: addDays(now, -1).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: LEAD_4_ID,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'advance_payment_reminder',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Advance payment reminder',
      message_body: 'Hi Priya Sharma, your advance payment of Rs 25,500 for Priya Sharma - Wedding is due soon.',
      provider_message_id: 'wamid.seed.advance.1',
      scheduled_for: addDays(now, -3).toISOString(),
      sent_at: addDays(now, -3).toISOString(),
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
      scheduled_for: addDays(now, -4).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: null,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'contract_sent',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Contract sent',
      message_body: 'Hi Priya Sharma, please review and sign your photography agreement with XYZ Photography here.',
      provider_message_id: 'wamid.seed.contract.1',
      scheduled_for: addDays(now, -5).toISOString(),
      sent_at: addDays(now, -5).toISOString(),
    },
    {
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      lead_id: null,
      client_id: CLIENT_PRIYA_ID,
      automation_type: 'payment_received',
      channel: 'whatsapp',
      status: 'sent',
      recipient_phone: '9876543210',
      recipient_email: 'priya@test.com',
      subject: 'Payment received',
      message_body: 'Hi Priya Sharma, we received your payment of Rs 25,500 for Priya Sharma - Wedding. Thank you!',
      provider_message_id: 'wamid.seed.payment.1',
      scheduled_for: addDays(now, -2).toISOString(),
      sent_at: addDays(now, -2).toISOString(),
    },
  ]
}

async function seedAutomationData(now: Date) {
  await supabase.from('automation_log').delete().eq('studio_id', STUDIO_A_ID)
  await supabase.from('automation_settings').delete().eq('studio_id', STUDIO_A_ID)
  await supabase.from('whatsapp_templates').delete().eq('studio_id', STUDIO_A_ID)
  await supabase.from('email_templates').delete().eq('studio_id', STUDIO_A_ID)

  const { error: whatsappErr } = await supabase.from('whatsapp_templates').insert(
    AUTOMATION_WHATSAPP_TEMPLATES.map((row) => ({ studio_id: STUDIO_A_ID, ...row }))
  )
  if (whatsappErr) throw whatsappErr

  const { error: emailErr } = await supabase.from('email_templates').insert(
    AUTOMATION_EMAIL_TEMPLATES.map((row) => ({ studio_id: STUDIO_A_ID, ...row }))
  )
  if (emailErr) throw emailErr

  const { error: settingsErr } = await supabase.from('automation_settings').insert(
    DEFAULT_AUTOMATION_SETTINGS.map((row) => ({ studio_id: STUDIO_A_ID, ...row }))
  )
  if (settingsErr) throw settingsErr

  const { error: logErr } = await supabase.from('automation_log').insert(buildAutomationLogs(now))
  if (logErr) throw logErr
}

async function seedRevenueSnapshots(now: Date) {
  const { error: deleteError } = await supabase
    .from('revenue_snapshots')
    .delete()
    .eq('studio_id', STUDIO_A_ID)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('revenue_snapshots').insert(buildRevenueSnapshots(now))
  if (insertError) throw insertError
}

async function ensureAuthUser(
  email: string,
  password: string,
  preferredId: string
): Promise<string> {
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (listErr) throw listErr
  const users = list?.users ?? []
  const hit = users.find((u) => u.email === email)
  if (hit) return hit.id

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // GoTrue may honor a stable UUID on local/dev; if not, we retry without `id`.
    id: preferredId,
  } as { email: string; password: string; email_confirm: boolean; id?: string })

  if (error && /already|registered|duplicate/i.test(error.message)) {
    const { data: list2, error: e2 } = await supabase.auth.admin.listUsers({ perPage: 200 })
    if (e2) throw e2
    const u = list2?.users?.find((x) => x.email === email)
    if (u) return u.id
    throw error
  }
  if (error) {
    const { data: retry, error: err2 } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (err2) throw err2
    console.warn(
      `[seed] Auth user ${email} created without fixed id (GoTrue ignored id). Using ${retry.user!.id}`
    )
    return retry.user!.id
  }
  return data.user!.id
}

async function seed() {
  console.log('Seeding StudioDesk (Modules 1 & 2)...')
  const now = new Date()

  const { encrypt } = await import('../lib/crypto')
  const encryptedBankSeed = encrypt('123456789012')
  const settingsBlob = (value: Record<string, unknown>) =>
    `__studiodesk_settings_v1__:${JSON.stringify(value)}`

  const ownerUserId = await ensureAuthUser('owner@test.com', 'Test@1234', OWNER_USER_ID)
  const photographerUserId = await ensureAuthUser(
    'photographer@test.com',
    'Test@1234',
    PHOTOGRAPHER_USER_ID
  )
  const editorUserId = await ensureAuthUser('editor@test.com', 'Test@1234', EDITOR_USER_ID)
  const outsiderUserId = await ensureAuthUser('outsider@test.com', 'Test@1234', OUTSIDER_USER_ID)

  const { error: studioAError } = await supabase.from('studios').upsert(
    {
      id: STUDIO_A_ID,
      name: 'XYZ Photography',
      slug: 'xyz-photography',
      tagline: 'Capturing moments',
      gstin: '24AABCU9603R1ZT',
      pan: 'AABCU9603R',
      phone: '9876543210',
      email: 'studio@xyzphoto.com',
      city: 'Surat',
      state: 'Gujarat',
      state_id: 7,
      bank_name: 'HDFC Bank',
      bank_account_number: encryptedBankSeed,
      bank_ifsc: 'HDFC0001234',
      razorpay_account_id: 'acc_test123',
      whatsapp_api_provider: 'interakt',
      whatsapp_api_key: encrypt('test-whatsapp-key-123'),
      whatsapp_phone: '9876543210',
      invoice_prefix: 'XYZ',
      invoice_sequence: 0,
      default_advance_pct: 30,
      default_hsn_code: '9983',
      plan_tier: 'studio',
      subscription_status: 'active',
      trial_ends_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      storage_limit_gb: 100,
      storage_used_gb: 2.5,
      onboarding_completed: true,
      onboarding_step: 5,
      onboarding_completed_at: now.toISOString(),
      is_active: true,
    },
    { onConflict: 'id' }
  )
  if (studioAError) throw studioAError

  const { error: onboardingEventsError } = await supabase.from('studio_onboarding_events').upsert(
    [
      {
        id: ONBOARDING_A_EVT_1,
        studio_id: STUDIO_A_ID,
        step_number: 1,
        step_name: 'basic_info',
        completed_at: now.toISOString(),
        time_spent_sec: 120,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_2,
        studio_id: STUDIO_A_ID,
        step_number: 2,
        step_name: 'business_details',
        completed_at: now.toISOString(),
        time_spent_sec: 90,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_3,
        studio_id: STUDIO_A_ID,
        step_number: 3,
        step_name: 'payment_setup',
        completed_at: now.toISOString(),
        time_spent_sec: 60,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_4,
        studio_id: STUDIO_A_ID,
        step_number: 4,
        step_name: 'inquiry_form',
        completed_at: now.toISOString(),
        time_spent_sec: 45,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_5,
        studio_id: STUDIO_A_ID,
        step_number: 5,
        step_name: 'first_package',
        completed_at: now.toISOString(),
        time_spent_sec: 180,
        skipped: false,
      },
    ],
    { onConflict: 'studio_id,step_number' }
  )
  if (onboardingEventsError) throw onboardingEventsError

  const { error: plansError } = await supabase.from('subscription_plans').upsert(
    [
      {
        id: PLAN_STARTER_ID,
        tier: 'starter',
        name: 'Starter',
        monthly_price_inr: 999,
        annual_price_inr: 9999,
        max_team_members: 1,
        max_bookings_per_month: 50,
        storage_limit_gb: 20,
        is_active: true,
      },
      {
        id: PLAN_STUDIO_ID,
        tier: 'studio',
        name: 'Studio',
        monthly_price_inr: 2999,
        annual_price_inr: 29999,
        max_team_members: 3,
        max_bookings_per_month: null,
        storage_limit_gb: 100,
        is_active: true,
      },
      {
        id: PLAN_AGENCY_ID,
        tier: 'agency',
        name: 'Agency',
        monthly_price_inr: 5999,
        annual_price_inr: 59999,
        max_team_members: 10,
        max_bookings_per_month: null,
        storage_limit_gb: 500,
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )
  if (plansError) throw plansError

  const { error: studioBError } = await supabase.from('studios').upsert(
    {
      id: STUDIO_B_ID,
      name: 'ABC Clicks',
      slug: 'abc-clicks',
      state: 'Gujarat',
      invoice_prefix: 'ABC',
      invoice_sequence: 0,
      plan_tier: 'starter',
      subscription_status: 'active',
      storage_limit_gb: 20,
      storage_used_gb: 0,
      onboarding_completed: false,
      onboarding_step: 0,
      is_active: true,
    },
    { onConflict: 'id' }
  )
  if (studioBError) throw studioBError

  const { error: membersError } = await supabase.from('studio_members').upsert(
    [
      {
        id: OWNER_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        user_id: ownerUserId,
        role: 'owner',
        display_name: 'Studio Owner',
        is_active: true,
        accepted_at: now.toISOString(),
      },
      {
        id: PHOTOGRAPHER_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        user_id: photographerUserId,
        role: 'photographer',
        display_name: 'Raj Joshi',
        phone: '9876500001',
        whatsapp: '9876500001',
        specialization: ['wedding', 'portrait'],
        is_active: true,
        accepted_at: now.toISOString(),
      },
      {
        id: EDITOR_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        user_id: editorUserId,
        role: 'editor',
        display_name: 'Amit Shah',
        phone: '9876500002',
        whatsapp: '9876500002',
        specialization: ['corporate', 'video'],
        is_active: true,
        accepted_at: now.toISOString(),
      },
      {
        id: OUTSIDER_MEMBER_ID,
        studio_id: STUDIO_B_ID,
        user_id: outsiderUserId,
        role: 'owner',
        display_name: 'Outside Owner',
        is_active: true,
        accepted_at: now.toISOString(),
      },
    ],
    { onConflict: 'id' }
  )
  if (membersError) throw membersError

  const { error: pkgError } = await supabase.from('service_packages').upsert(
    [
      {
        id: PACKAGE_WEDDING_ID,
        studio_id: STUDIO_A_ID,
        name: 'Wedding Full Day',
        event_type: 'wedding',
        base_price: 85000,
        is_gst_applicable: true,
        turnaround_days: 30,
        deliverables: ['500+ photos', '1 highlights reel', 'Online gallery', 'USB drive'],
        is_active: true,
        sort_order: 1,
      },
      {
        id: PACKAGE_CORPORATE_ID,
        studio_id: STUDIO_A_ID,
        name: 'Corporate Event',
        event_type: 'corporate',
        base_price: 45000,
        is_gst_applicable: true,
        turnaround_days: 7,
        is_active: true,
        sort_order: 2,
      },
      {
        id: PACKAGE_PORTRAIT_ID,
        studio_id: STUDIO_A_ID,
        name: 'Portrait Session',
        event_type: 'portrait',
        base_price: 20000,
        is_gst_applicable: true,
        turnaround_days: 7,
        is_active: true,
        sort_order: 3,
      },
      {
        id: PACKAGE_BIRTHDAY_INACTIVE_ID,
        studio_id: STUDIO_A_ID,
        name: 'Birthday Party',
        event_type: 'birthday',
        base_price: 25000,
        is_gst_applicable: true,
        is_active: false,
        sort_order: 4,
      },
    ],
    { onConflict: 'id' }
  )
  if (pkgError) throw pkgError

  const { error: addonError } = await supabase.from('package_addons').upsert(
    [
      {
        id: ADDON_DRONE_ID,
        studio_id: STUDIO_A_ID,
        name: 'Drone Coverage',
        price: 15000,
        unit: 'flat',
        is_active: true,
      },
      {
        id: ADDON_SHOOTER_ID,
        studio_id: STUDIO_A_ID,
        name: 'Second Shooter',
        price: 12000,
        unit: 'flat',
        is_active: true,
      },
      {
        id: ADDON_SDE_ID,
        studio_id: STUDIO_A_ID,
        name: 'Same Day Edit',
        price: 8000,
        unit: 'flat',
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )
  if (addonError) throw addonError

  const { error: clientsError } = await supabase.from('clients').upsert(
    [
      {
        id: CLIENT_PRIYA_ID,
        studio_id: STUDIO_A_ID,
        full_name: 'Priya Sharma',
        phone: '9876543210',
        email: 'priya@test.com',
        city: 'Surat',
        state: 'Gujarat',
        tags: ['vip', 'wedding'],
      },
      {
        id: CLIENT_RAJ_ID,
        studio_id: STUDIO_A_ID,
        full_name: 'Raj Kumar',
        phone: '8765432109',
        email: 'raj@test.com',
        city: 'Ahmedabad',
        state: 'Gujarat',
        company_name: 'Raj Enterprises',
        gstin: '24AABCU9603R1ZT',
      },
      {
        id: CLIENT_MEERA_ID,
        studio_id: STUDIO_A_ID,
        full_name: 'Meera Patel',
        phone: '7654321098',
        email: 'meera@test.com',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
      {
        id: CLIENT_DEV_ID,
        studio_id: STUDIO_A_ID,
        full_name: 'Dev Agarwal',
        phone: '9988776655',
        email: null,
        city: 'Surat',
        state: 'Gujarat',
      },
      {
        id: CLIENT_ANITA_ID,
        studio_id: STUDIO_A_ID,
        full_name: 'Anita Shah',
        phone: '9977665544',
        email: 'anita@test.com',
        city: 'Ahmedabad',
        state: 'Gujarat',
      },
      {
        id: CLIENT_VIKRAM_ID,
        studio_id: STUDIO_B_ID,
        full_name: 'Vikram Mehta',
        phone: '9966554433',
        email: 'vikram@test.com',
      },
    ],
    { onConflict: 'id' }
  )
  if (clientsError) throw clientsError

  const in6mo = addMonths(now, 6)
  const in2w = addDays(now, 14)
  const tomorrow = addDays(now, 1)
  const overdueFollowUp = addDays(now, -3)

  const { error: leadsPartError } = await supabase.from('leads').upsert(
    [
      {
        id: LEAD_1_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_MEERA_ID,
        event_type: 'wedding',
        event_date_approx: in6mo.toISOString().slice(0, 10),
        budget_min: 80000,
        budget_max: 120000,
        status: 'new_lead',
        source: 'inquiry_form',
        priority: 1,
        converted_to_booking: false,
        form_data: { note: 'Inquiry from website' },
      },
      {
        id: LEAD_2_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_DEV_ID,
        event_type: 'corporate',
        status: 'contacted',
        source: 'walk_in',
        priority: 2,
        follow_up_at: tomorrow.toISOString(),
        converted_to_booking: false,
        last_contacted_at: now.toISOString(),
      },
      {
        id: LEAD_3_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        event_type: 'portrait',
        status: 'proposal_sent',
        source: 'instagram',
        priority: 2,
        converted_to_booking: false,
        last_contacted_at: addDays(now, -1).toISOString(),
      },
      {
        id: LEAD_5_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_DEV_ID,
        event_type: 'birthday',
        status: 'lost',
        source: 'facebook',
        priority: 3,
        converted_to_booking: false,
        notes: 'Second inquiry — opted out',
      },
      {
        id: LEAD_6_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        event_type: 'corporate',
        status: 'new_lead',
        source: 'google',
        priority: 1,
        follow_up_at: overdueFollowUp.toISOString(),
        converted_to_booking: false,
      },
      {
        id: LEAD_7_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        event_type: 'wedding',
        event_date_approx: in2w.toISOString().slice(0, 10),
        status: 'contacted',
        source: 'phone',
        priority: 1,
        converted_to_booking: false,
        last_contacted_at: now.toISOString(),
      },
      {
        id: LEAD_8_ID,
        studio_id: STUDIO_B_ID,
        client_id: CLIENT_VIKRAM_ID,
        event_type: 'portrait',
        status: 'new_lead',
        source: 'walk_in',
        priority: 2,
        converted_to_booking: false,
      },
    ],
    { onConflict: 'id' }
  )
  if (leadsPartError) throw leadsPartError

  const eventDate = addMonths(now, 2)
  const { error: lead4Error } = await supabase.from('leads').upsert(
    {
      id: LEAD_4_ID,
      studio_id: STUDIO_A_ID,
      client_id: CLIENT_PRIYA_ID,
      event_type: 'wedding',
      event_date_approx: eventDate.toISOString().slice(0, 10),
      status: 'contract_signed',
      source: 'referral',
      priority: 2,
      converted_to_booking: false,
      booking_id: null,
      last_contacted_at: addDays(now, -5).toISOString(),
    },
    { onConflict: 'id' }
  )
  if (lead4Error) throw lead4Error

  const { error: bookingError } = await supabase.from('bookings').upsert(
    {
      id: BOOKING_CONVERTED_ID,
      studio_id: STUDIO_A_ID,
      client_id: CLIENT_PRIYA_ID,
      lead_id: LEAD_4_ID,
      title: 'Priya Sharma — Wedding',
      event_type: 'wedding',
      event_date: eventDate.toISOString().slice(0, 10),
      total_amount: 85000,
      advance_amount: 25500,
      amount_paid: 25500,
      gst_type: 'cgst_sgst',
      status: 'contract_signed',
      package_id: PACKAGE_WEDDING_ID,
    },
    { onConflict: 'id' }
  )
  if (bookingError) throw bookingError

  const { error: bookingPatchError } = await supabase.from('bookings').upsert(
    [
      {
        id: BOOKING_CONVERTED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_PRIYA_ID,
        lead_id: LEAD_4_ID,
        title: 'Priya Sharma - Wedding',
        event_type: 'wedding',
        event_date: eventDate.toISOString().slice(0, 10),
        venue_name: 'Hotel Grand, Surat',
        total_amount: 85000,
        advance_amount: 25500,
        amount_paid: 25500,
        gst_type: 'cgst_sgst',
        status: 'proposal_sent',
        package_id: PACKAGE_WEDDING_ID,
        package_snapshot: {
          id: PACKAGE_WEDDING_ID,
          name: 'Wedding Full Day',
          turnaround_days: 30,
        },
      },
      {
        id: BOOKING_CONTRACT_SIGNED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Raj Kumar - Corporate Event',
        event_type: 'corporate',
        event_date: addMonths(now, 1).toISOString().slice(0, 10),
        venue_name: 'Convention Centre, Ahmedabad',
        total_amount: 45000,
        advance_amount: 15000,
        amount_paid: 15000,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_CORPORATE_ID,
        package_snapshot: {
          id: PACKAGE_CORPORATE_ID,
          name: 'Corporate Event',
          turnaround_days: 7,
        },
      },
    ],
    { onConflict: 'id' }
  )
  if (bookingPatchError) throw bookingPatchError

  const { error: invoiceBookingError } = await supabase.from('bookings').upsert(
    [
      {
        id: BOOKING_INVOICE_NEW_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_MEERA_ID,
        title: 'Meera Patel - Portrait Session',
        event_type: 'portrait',
        event_date: addDays(now, 20).toISOString().slice(0, 10),
        venue_name: 'Studio One, Surat',
        total_amount: 18000,
        advance_amount: 5000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_PORTRAIT_ID,
        package_snapshot: { id: PACKAGE_PORTRAIT_ID, name: 'Portrait Premium', turnaround_days: 10 },
      },
      {
        id: BOOKING_INVOICE_DUP_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_PRIYA_ID,
        title: 'Priya Sharma - Advance Billing',
        event_type: 'wedding',
        event_date: addDays(now, 45).toISOString().slice(0, 10),
        venue_name: 'Emerald Banquet, Surat',
        total_amount: 85000,
        advance_amount: 25500,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_WEDDING_ID,
        package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 },
      },
      {
        id: BOOKING_INVOICE_PAID_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Raj Kumar - Paid Corporate Event',
        event_type: 'corporate',
        event_date: addDays(now, 10).toISOString().slice(0, 10),
        venue_name: 'Convention Centre, Ahmedabad',
        total_amount: 25500,
        advance_amount: 25500,
        amount_paid: 25500,
        gst_type: 'cgst_sgst',
        status: 'advance_paid',
        package_id: PACKAGE_CORPORATE_ID,
        package_snapshot: { id: PACKAGE_CORPORATE_ID, name: 'Corporate Event', turnaround_days: 7 },
      },
      {
        id: BOOKING_INVOICE_OVERDUE_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        title: 'Anita Shah - Overdue Balance',
        event_type: 'portrait',
        event_date: addDays(now, -2).toISOString().slice(0, 10),
        venue_name: 'Lake View Resort, Ahmedabad',
        total_amount: 59500,
        advance_amount: 10000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_PORTRAIT_ID,
        package_snapshot: { id: PACKAGE_PORTRAIT_ID, name: 'Portrait Premium', turnaround_days: 10 },
      },
      {
        id: BOOKING_INVOICE_LINK_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_DEV_ID,
        title: 'Dev Agarwal - Payment Link Invoice',
        event_type: 'corporate',
        event_date: addDays(now, 25).toISOString().slice(0, 10),
        venue_name: 'Business Hub, Surat',
        total_amount: 50000,
        advance_amount: 10000,
        amount_paid: 10000,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_CORPORATE_ID,
        package_snapshot: { id: PACKAGE_CORPORATE_ID, name: 'Corporate Event', turnaround_days: 7 },
      },
      {
        id: BOOKING_ASSIGNMENT_CONFLICT_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_ANITA_ID,
        title: 'Anita Shah - Same Day Wedding Coverage',
        event_type: 'wedding',
        event_date: eventDate.toISOString().slice(0, 10),
        venue_name: 'Royal Palace, Surat',
        total_amount: 65000,
        advance_amount: 20000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
        package_id: PACKAGE_WEDDING_ID,
        package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 },
      },
    ],
    { onConflict: 'id' }
  )
  if (invoiceBookingError) throw invoiceBookingError

  const { error: lead4Upd } = await supabase
    .from('leads')
    .update({
      converted_to_booking: true,
      booking_id: BOOKING_CONVERTED_ID,
    })
    .eq('id', LEAD_4_ID)
  if (lead4Upd) throw lead4Upd

  const { error: inquiryError } = await supabase.from('inquiry_form_configs').upsert(
    {
      id: INQUIRY_FORM_CONFIG_A_ID,
      studio_id: STUDIO_A_ID,
      form_title: 'Book Your Photography Session',
      form_subtitle: 'Tell us about your event',
      button_text: 'Submit',
      show_event_type: true,
      show_event_date: true,
      show_venue: true,
      show_guest_count: true,
      show_budget: true,
      show_message: true,
      require_phone: true,
      require_email: false,
      require_event_date: false,
      enable_recaptcha: false,
    },
    { onConflict: 'studio_id' }
  )
  if (inquiryError) throw inquiryError

  const expiresPending = addDays(now, 1)
  const expiresPast = addDays(now, -3)

  const { error: inviteError } = await supabase.from('studio_invitations').upsert(
    [
      {
        id: INVITE_PENDING_ID,
        studio_id: STUDIO_A_ID,
        invited_by: OWNER_MEMBER_ID,
        email: 'pending@test.com',
        role: 'videographer',
        token: INVITE_PENDING_TOKEN,
        expires_at: expiresPending.toISOString(),
        resent_count: 0,
      },
      {
        id: INVITE_EXPIRED_ID,
        studio_id: STUDIO_A_ID,
        invited_by: OWNER_MEMBER_ID,
        email: 'expired@test.com',
        role: 'assistant',
        token: INVITE_EXPIRED_TOKEN,
        expires_at: expiresPast.toISOString(),
        resent_count: 1,
      },
    ],
    { onConflict: 'id' }
  )
  if (inviteError) throw inviteError

  const contractHtml = '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>'
  const contractSentAt = addDays(now, -2).toISOString()
  const reminderRecentAt = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
  const signedAt = addDays(now, -7).toISOString()

  // Avoid partial-unique conflicts for one default template per studio.
  await supabase.from('contract_templates').update({ is_default: false }).eq('studio_id', STUDIO_A_ID)

  const { error: templateError } = await supabase.from('contract_templates').upsert(
    [
      {
        id: CONTRACT_TEMPLATE_WEDDING_ID,
        studio_id: STUDIO_A_ID,
        name: 'Wedding Photography Agreement',
        event_type: 'wedding',
        content_html:
          '<h1>Photography Agreement</h1><p><strong>{{client_name}}</strong> agrees to photography coverage on {{event_date}} at {{venue}} for &#8377;{{total_amount}}.</p>',
        version: 1,
        is_default: false,
        is_active: true,
      },
      {
        id: CONTRACT_TEMPLATE_GENERAL_ID,
        studio_id: STUDIO_A_ID,
        name: 'General Agreement',
        event_type: null,
        content_html:
          '<h1>General Photography Agreement</h1><p>{{studio_name}} will deliver coverage for {{event_type}} on {{event_date}}.</p>',
        version: 1,
        is_default: true,
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )
  if (templateError) throw templateError

  const { error: contractError } = await supabase.from('contracts').upsert(
    [
      {
        id: CONTRACT_DRAFT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        template_id: CONTRACT_TEMPLATE_WEDDING_ID,
        status: 'draft',
        content_html: contractHtml,
        access_token: CONTRACT_DRAFT_TOKEN,
        notes: 'Draft contract',
      },
      {
        id: CONTRACT_SENT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        template_id: CONTRACT_TEMPLATE_WEDDING_ID,
        status: 'sent',
        content_html: contractHtml,
        access_token: CONTRACT_SENT_TOKEN,
        sent_at: contractSentAt,
      },
      {
        id: CONTRACT_SIGNED_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONTRACT_SIGNED_ID,
        client_id: CLIENT_RAJ_ID,
        template_id: CONTRACT_TEMPLATE_GENERAL_ID,
        status: 'signed',
        content_html: '<h1>Corporate Agreement</h1><p>Signed agreement.</p>',
        access_token: CONTRACT_SIGNED_TOKEN,
        sent_at: addDays(now, -9).toISOString(),
        signed_at: signedAt,
        signature_data: 'Raj Kumar',
        signed_ip: '103.1.2.3',
        signed_user_agent: 'Seeded',
      },
      {
        id: CONTRACT_REMINDER_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        template_id: CONTRACT_TEMPLATE_WEDDING_ID,
        status: 'sent',
        content_html: contractHtml,
        access_token: CONTRACT_REMINDER_TOKEN,
        sent_at: addDays(now, -1).toISOString(),
        reminder_sent_at: reminderRecentAt,
      },
    ],
    { onConflict: 'id' }
  )
  if (contractError) throw contractError

  const sentAt = addDays(now, -2).toISOString()
  const paidAt = addDays(now, -1).toISOString()
  const overdueDate = addDays(now, -5).toISOString().slice(0, 10)
  const futureDue = addDays(now, 7).toISOString().slice(0, 10)
  const linkExpiry = addDays(now, 7).toISOString()

  const { error: invoiceError } = await supabase.from('invoices').upsert(
    [
      {
        id: INVOICE_DRAFT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_DUP_ID,
        client_id: CLIENT_PRIYA_ID,
        invoice_number: 'XYZ-SEED-DRAFT',
        invoice_type: 'advance',
        status: 'draft',
        subtotal: 30000,
        gst_type: 'exempt',
        cgst_rate: 0,
        sgst_rate: 0,
        igst_rate: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        total_amount: 30000,
        amount_paid: 0,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        access_token: INVOICE_DRAFT_TOKEN,
        notes: 'Draft advance invoice',
      },
      {
        id: INVOICE_SENT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_DUP_ID,
        client_id: CLIENT_PRIYA_ID,
        invoice_number: 'XYZ-SEED-SENT',
        invoice_type: 'advance',
        status: 'sent',
        subtotal: 25500,
        gst_type: 'exempt',
        cgst_rate: 0,
        sgst_rate: 0,
        igst_rate: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        total_amount: 25500,
        amount_paid: 0,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        due_date: futureDue,
        sent_at: sentAt,
        razorpay_order_id: 'order_seed_webhook',
        access_token: INVOICE_SENT_TOKEN,
      },
      {
        id: INVOICE_PAID_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_PAID_ID,
        client_id: CLIENT_RAJ_ID,
        invoice_number: 'XYZ-SEED-PAID',
        invoice_type: 'advance',
        status: 'paid',
        subtotal: 21610.17,
        gst_type: 'cgst_sgst',
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: 1944.92,
        sgst_amount: 1944.91,
        igst_amount: 0,
        total_amount: 25500,
        amount_paid: 25500,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        due_date: futureDue,
        paid_at: paidAt,
        access_token: INVOICE_PAID_TOKEN,
      },
      {
        id: INVOICE_OVERDUE_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_OVERDUE_ID,
        client_id: CLIENT_ANITA_ID,
        invoice_number: 'XYZ-SEED-OVERDUE',
        invoice_type: 'balance',
        status: 'overdue',
        subtotal: 50423.73,
        gst_type: 'cgst_sgst',
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: 4538.14,
        sgst_amount: 4538.13,
        igst_amount: 0,
        total_amount: 59500,
        amount_paid: 0,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        due_date: overdueDate,
        sent_at: sentAt,
        access_token: INVOICE_OVERDUE_TOKEN,
      },
      {
        id: INVOICE_LINK_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_LINK_ID,
        client_id: CLIENT_DEV_ID,
        invoice_number: 'XYZ-SEED-LINK',
        invoice_type: 'advance',
        status: 'sent',
        subtotal: 42372.88,
        gst_type: 'cgst_sgst',
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: 3813.56,
        sgst_amount: 3813.56,
        igst_amount: 0,
        total_amount: 50000,
        amount_paid: 10000,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        due_date: futureDue,
        sent_at: sentAt,
        razorpay_payment_link_id: 'plink_seed_001',
        payment_link_url: 'https://rzp.io/i/seed-link-001',
        payment_link_expires_at: linkExpiry,
        access_token: INVOICE_LINK_TOKEN,
      },
      {
        id: INVOICE_CREDIT_NOTE_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_INVOICE_PAID_ID,
        client_id: CLIENT_RAJ_ID,
        invoice_number: 'XYZ-SEED-CN',
        invoice_type: 'credit_note',
        status: 'paid',
        subtotal: 5000,
        gst_type: 'exempt',
        cgst_rate: 0,
        sgst_rate: 0,
        igst_rate: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        total_amount: 5000,
        amount_paid: 5000,
        hsn_sac_code: '998389',
        place_of_supply: 'Gujarat',
        place_of_supply_state_id: 7,
        credit_note_for: INVOICE_PAID_ID,
        paid_at: paidAt,
        access_token: INVOICE_CREDIT_NOTE_TOKEN,
      },
    ],
    { onConflict: 'id' }
  )
  if (invoiceError) throw invoiceError

  await supabase
    .from('invoice_line_items')
    .delete()
    .in('invoice_id', [INVOICE_DRAFT_ID, INVOICE_SENT_ID, INVOICE_PAID_ID, INVOICE_OVERDUE_ID, INVOICE_LINK_ID, INVOICE_CREDIT_NOTE_ID])

  const { error: lineItemError } = await supabase.from('invoice_line_items').insert([
    { invoice_id: INVOICE_DRAFT_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance Photography', quantity: 1, unit_price: 30000, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_SENT_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance Photography', quantity: 1, unit_price: 25500, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_PAID_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Corporate Advance', quantity: 1, unit_price: 21610.17, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_OVERDUE_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Balance Payment', quantity: 1, unit_price: 50423.73, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_LINK_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Advance with Payment Link', quantity: 1, unit_price: 42372.88, hsn_sac_code: '998389' },
    { invoice_id: INVOICE_CREDIT_NOTE_ID, studio_id: STUDIO_A_ID, sort_order: 0, name: 'Credit Note - XYZ-SEED-PAID', quantity: 1, unit_price: 5000, hsn_sac_code: '998389' },
  ])
  if (lineItemError) throw lineItemError

  const { error: paymentError } = await supabase.from('payments').upsert(
    [
      {
        id: PAYMENT_MANUAL_ID,
        studio_id: STUDIO_A_ID,
        invoice_id: INVOICE_PAID_ID,
        booking_id: BOOKING_INVOICE_PAID_ID,
        amount: 25500,
        currency: 'INR',
        method: 'cash',
        status: 'captured',
        payment_date: now.toISOString().slice(0, 10),
        captured_at: paidAt,
        notes: 'Seed manual payment',
      },
      {
        id: PAYMENT_RAZORPAY_ID,
        studio_id: STUDIO_A_ID,
        invoice_id: INVOICE_LINK_ID,
        booking_id: BOOKING_INVOICE_LINK_ID,
        amount: 10000,
        currency: 'INR',
        method: 'upi',
        status: 'captured',
        razorpay_payment_id: 'pay_seed_001',
        razorpay_order_id: 'order_seed_001',
        payment_date: now.toISOString().slice(0, 10),
        captured_at: paidAt,
      },
    ],
    { onConflict: 'id' }
  )
  if (paymentError) throw paymentError

  await supabase
    .from('shoot_assignments')
    .delete()
    .in('id', [ASSIGNMENT_CONFIRMED_ID, ASSIGNMENT_PENDING_ID, ASSIGNMENT_CONFLICT_ID])

  const { error: assignmentError } = await supabase.from('shoot_assignments').insert([
    {
      id: ASSIGNMENT_CONFIRMED_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      role: 'photographer',
      call_time: `${eventDate.toISOString().slice(0, 10)}T08:00:00.000Z`,
      call_location: JSON.stringify({ role: 'photographer', status: 'confirmed' }),
      notes: 'Main photographer for ceremony',
      is_confirmed: true,
      confirmed_at: addDays(now, -1).toISOString(),
    },
    {
      id: ASSIGNMENT_PENDING_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      member_id: EDITOR_MEMBER_ID,
      role: 'videographer',
      call_time: `${eventDate.toISOString().slice(0, 10)}T08:00:00.000Z`,
      call_location: JSON.stringify({ role: 'videographer', status: 'pending' }),
      notes: 'Handle candid video coverage',
      is_confirmed: false,
    },
    {
      id: ASSIGNMENT_CONFLICT_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_ASSIGNMENT_CONFLICT_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      role: 'photographer',
      call_time: `${eventDate.toISOString().slice(0, 10)}T07:00:00.000Z`,
      call_location: JSON.stringify({ role: 'photographer', status: 'confirmed' }),
      notes: 'Existing same-day assignment for conflict checks',
      is_confirmed: true,
      confirmed_at: addDays(now, -2).toISOString(),
    },
  ])
  if (assignmentError) throw assignmentError

  await supabase.from('shoot_briefs').delete().eq('id', SHOOT_BRIEF_ID)
  const { error: shootBriefError } = await supabase.from('shoot_briefs').upsert(
    {
      id: SHOOT_BRIEF_ID,
      studio_id: STUDIO_A_ID,
      booking_id: BOOKING_CONVERTED_ID,
      key_shots: ['Bridal prep', 'Ceremony', 'Reception'],
      venue_access_notes: 'Hotel Grand, Ring Road, Surat',
      contact_on_day: 'Priya Sharma',
      contact_phone: '9876543210',
      special_instructions: 'Bride allergic to flash',
      equipment_needed: ['Bring 70-200mm lens'],
      people_to_capture: {
        call_time: '08:00',
        shoot_start_time: '09:00',
        shoot_end_time: '20:00',
        venue_map_link: 'https://maps.google.com/?q=Hotel+Grand+Surat',
        client_whatsapp: '9876543210',
        reference_images: [],
        equipment_notes: 'Bring 70-200mm lens',
        outfit_notes: 'Wear formal black attire',
      },
    },
    { onConflict: 'booking_id' }
  )
  if (shootBriefError) throw shootBriefError

  await supabase.from('member_unavailability').delete().eq('id', MEMBER_UNAVAILABLE_ID)
  const { error: unavailabilityError } = await supabase.from('member_unavailability').upsert(
    {
      id: MEMBER_UNAVAILABLE_ID,
      studio_id: STUDIO_A_ID,
      member_id: PHOTOGRAPHER_MEMBER_ID,
      unavailable_date: eventDate.toISOString().slice(0, 10),
      reason: 'Personal leave',
      all_day: true,
    },
    { onConflict: 'id' }
  )
  if (unavailabilityError) throw unavailabilityError

  const { error: galleryBookingError } = await supabase.from('bookings').upsert(
    {
      id: BOOKING_GALLERY_B_ID,
      studio_id: STUDIO_B_ID,
      client_id: CLIENT_VIKRAM_ID,
      title: 'Vikram Mehta - Studio B Wedding',
      event_type: 'wedding',
      event_date: addMonths(now, 3).toISOString().slice(0, 10),
      venue_name: 'Riverfront Lawn, Ahmedabad',
      total_amount: 95000,
      advance_amount: 25000,
      amount_paid: 0,
      gst_type: 'cgst_sgst',
      status: 'contract_signed',
      package_id: PACKAGE_WEDDING_ID,
      package_snapshot: { id: PACKAGE_WEDDING_ID, name: 'Wedding Full Day', turnaround_days: 30 },
    },
    { onConflict: 'id' }
  )
  if (galleryBookingError) throw galleryBookingError

  const galleryMetaDraft = JSON.stringify({ name: 'Priya Wedding Draft Gallery' })
  const galleryMetaPublished = JSON.stringify({
    name: 'Sharma Wedding Gallery',
    share_link_url: 'https://test.immich.app/share/xxx',
    share_link_immich_id: 'share_immich_seed_001',
    qr_code_url: 'https://studiodesk.test/gallery/sharma-wedding-gallery-test',
    cover_photo_immich_id: 'asset-priya-1',
  })
  const galleryMetaStudioB = JSON.stringify({ name: 'Studio B Private Gallery' })
  const { error: galleryError } = await supabase.from('galleries').upsert(
    [
      {
        id: GALLERY_DRAFT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        immich_album_id: 'mock-draft-album-id',
        immich_library_id: galleryMetaDraft,
        status: 'ready',
        total_photos: 0,
        total_videos: 0,
        total_size_mb: 0,
        is_published: false,
        is_download_enabled: false,
        slug: 'priya-wedding-gallery-draft',
        access_token: GALLERY_DRAFT_TOKEN,
        view_count: 0,
        download_count: 0,
        expires_at: addMonths(now, 1).toISOString(),
      },
      {
        id: GALLERY_PUBLISHED_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONTRACT_SIGNED_ID,
        immich_album_id: 'mock-album-id',
        immich_library_id: galleryMetaPublished,
        status: 'published',
        total_photos: 450,
        total_videos: 2,
        total_size_mb: 1024.5,
        is_published: true,
        is_download_enabled: true,
        published_at: addDays(now, -2).toISOString(),
        download_enabled_at: addDays(now, -2).toISOString(),
        slug: 'sharma-wedding-gallery-test',
        access_token: GALLERY_PUBLISHED_TOKEN,
        view_count: 45,
        download_count: 3,
        expires_at: addMonths(now, 1).toISOString(),
      },
      {
        id: GALLERY_STUDIO_B_ID,
        studio_id: STUDIO_B_ID,
        booking_id: BOOKING_GALLERY_B_ID,
        immich_album_id: 'mock-b-album-id',
        immich_library_id: galleryMetaStudioB,
        status: 'ready',
        total_photos: 12,
        total_videos: 0,
        total_size_mb: 48.2,
        is_published: false,
        is_download_enabled: false,
        slug: 'studio-b-gallery-test',
        access_token: GALLERY_STUDIO_B_TOKEN,
        view_count: 0,
        download_count: 0,
        expires_at: addMonths(now, 1).toISOString(),
      },
    ],
    { onConflict: 'id' }
  )
  if (galleryError) throw galleryError

  await supabase.from('face_clusters').delete().eq('gallery_id', GALLERY_PUBLISHED_ID)
  const { error: clusterError } = await supabase.from('face_clusters').insert([
    {
      id: FACE_CLUSTER_BRIDE_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_BRIDE_ID,
      label: 'Bride - Priya',
      is_labeled: true,
      photo_count: 127,
      representative_photo_url: 'https://thumb.test/priya.jpg',
    },
    {
      id: FACE_CLUSTER_UNKNOWN_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_UNKNOWN_ID,
      label: null,
      is_labeled: false,
      photo_count: 43,
      representative_photo_url: 'https://thumb.test/unknown.jpg',
    },
    {
      id: FACE_CLUSTER_GROOM_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_GROOM_ID,
      label: 'Groom - Raj',
      is_labeled: true,
      photo_count: 98,
      representative_photo_url: 'https://thumb.test/raj.jpg',
    },
  ])
  if (clusterError) throw clusterError

  await supabase.from('gallery_photos').delete().eq('gallery_id', GALLERY_PUBLISHED_ID)
  const { error: galleryPhotoError } = await supabase.from('gallery_photos').insert([
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-priya-1',
      filename: 'priya-1.jpg',
      file_size_mb: 4.2,
      taken_at: addDays(now, -10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_BRIDE_ID],
    },
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-priya-2',
      filename: 'priya-2.jpg',
      file_size_mb: 4.8,
      taken_at: addDays(now, -10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_BRIDE_ID],
    },
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-raj-1',
      filename: 'raj-1.jpg',
      file_size_mb: 5.1,
      taken_at: addDays(now, -10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_GROOM_ID],
    },
  ])
  if (galleryPhotoError) throw galleryPhotoError

  await supabase.from('file_upload_jobs').delete().in('id', [UPLOAD_JOB_COMPLETED_ID, UPLOAD_JOB_PROCESSING_ID])
  const { error: uploadJobError } = await supabase.from('file_upload_jobs').insert([
    {
      id: UPLOAD_JOB_COMPLETED_ID,
      studio_id: STUDIO_A_ID,
      gallery_id: GALLERY_DRAFT_ID,
      status: 'completed',
      total_files: 50,
      processed_files: 50,
      failed_files: 0,
      total_size_mb: 250,
      processed_size_mb: 250,
      started_at: addDays(now, -1).toISOString(),
      completed_at: addDays(now, -1).toISOString(),
      error_log: [],
    },
    {
      id: UPLOAD_JOB_PROCESSING_ID,
      studio_id: STUDIO_A_ID,
      gallery_id: GALLERY_DRAFT_ID,
      status: 'processing',
      total_files: 50,
      processed_files: 30,
      failed_files: 0,
      total_size_mb: 250,
      processed_size_mb: 150,
      started_at: addDays(now, -1).toISOString(),
      error_log: [],
    },
  ])
  if (uploadJobError) throw uploadJobError

  const { error: settingsError } = await supabase.from('studio_settings').upsert(
    [
      {
        id: STUDIO_SETTINGS_A_ID,
        studio_id: STUDIO_A_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: true,
        notify_payment_email: true,
        notify_payment_whatsapp: true,
        timezone: 'Asia/Kolkata',
        invoice_terms: 'Payment is due as per agreed schedule.',
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 30,
        gallery_watermark_default: true,
        email_from_name: 'XYZ Photography',
        email_reply_to: 'studio@xyzphoto.com',
      },
      {
        id: STUDIO_SETTINGS_B_ID,
        studio_id: STUDIO_B_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: false,
        notify_payment_email: true,
        notify_payment_whatsapp: false,
        timezone: 'Asia/Kolkata',
        invoice_terms: null,
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 14,
        gallery_watermark_default: false,
        email_from_name: null,
        email_reply_to: null,
      },
    ],
    { onConflict: 'studio_id' }
  )
  if (settingsError) throw settingsError

  await seedRevenueSnapshots(now)
  await seedAutomationData(now)

  console.log('Seed complete.')
  console.log('Users:', {
    ownerUserId,
    photographerUserId,
    editorUserId,
    outsiderUserId,
  })
}

// Run seed only when executed directly (not when imported by Vitest)
if (typeof require !== 'undefined' && require.main === module) {
  seed().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

module.exports = SEED_IDS
