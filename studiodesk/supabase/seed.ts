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
      invoice_prefix: 'XYZ',
      invoice_sequence: 0,
      default_advance_pct: 30,
      default_hsn_code: '9983',
      plan_tier: 'studio',
      subscription_status: 'active',
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
        display_name: 'Test Photographer',
        is_active: true,
        accepted_at: now.toISOString(),
      },
      {
        id: EDITOR_MEMBER_ID,
        studio_id: STUDIO_A_ID,
        user_id: editorUserId,
        role: 'editor',
        display_name: 'Test Editor',
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

  const { error: settingsError } = await supabase.from('studio_settings').upsert(
    [
      {
        id: STUDIO_SETTINGS_A_ID,
        studio_id: STUDIO_A_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: false,
        notify_payment_email: true,
        notify_payment_whatsapp: false,
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 30,
        gallery_watermark_default: true,
        timezone: 'Asia/Kolkata',
      },
      {
        id: STUDIO_SETTINGS_B_ID,
        studio_id: STUDIO_B_ID,
        notify_new_lead_email: true,
        notify_new_lead_whatsapp: false,
        notify_payment_email: true,
        notify_payment_whatsapp: false,
        invoice_bank_details_visible: true,
        gallery_default_expiry_days: 14,
        gallery_watermark_default: false,
        timezone: 'Asia/Kolkata',
      },
    ],
    { onConflict: 'studio_id' }
  )
  if (settingsError) throw settingsError

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
