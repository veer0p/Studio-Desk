/**
 * Aligns subscription_plans with supabase/seed.ts before integration tests.
 * Local DBs often drift (e.g. max_team_members = 3). Table has UNIQUE(tier), so we UPDATE by tier.
 *
 * Applies `studio_invitations.updated_at` DDL when possible (trigger references NEW.updated_at).
 */
import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'
import {
  EDITOR_MEMBER_ID,
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  CONTRACT_DRAFT_ID,
  CONTRACT_DRAFT_TOKEN,
  CONTRACT_REMINDER_ID,
  CONTRACT_REMINDER_TOKEN,
  CONTRACT_SENT_ID,
  CONTRACT_SENT_TOKEN,
  CONTRACT_SIGNED_ID,
  CONTRACT_SIGNED_TOKEN,
  CONTRACT_TEMPLATE_GENERAL_ID,
  CONTRACT_TEMPLATE_WEDDING_ID,
  LEAD_1_ID,
  LEAD_2_ID,
  LEAD_3_ID,
  LEAD_4_ID,
  LEAD_5_ID,
  LEAD_6_ID,
  LEAD_7_ID,
  LEAD_8_ID,
  INVITE_EXPIRED_ID,
  INVITE_EXPIRED_TOKEN,
  INVITE_PENDING_ID,
  INVITE_PENDING_TOKEN,
  ONBOARDING_A_EVT_1,
  ONBOARDING_A_EVT_2,
  ONBOARDING_A_EVT_3,
  ONBOARDING_A_EVT_4,
  ONBOARDING_A_EVT_5,
  OUTSIDER_MEMBER_ID,
  OWNER_MEMBER_ID,
  PHOTOGRAPHER_MEMBER_ID,
  STUDIO_A_ID,
  STUDIO_B_ID,
} from '../../supabase/seed-ids'

config({ path: join(process.cwd(), '.env.local') })
config({ path: join(process.cwd(), '.env') })

async function ensureStudioInvitationsUpdatedAtColumn(): Promise<void> {
  const url =
    process.env.SUPABASE_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 5000,
  })
  try {
    await client.connect()
    await client.query(`
      ALTER TABLE public.studio_invitations
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `)
    await client.query(`
      UPDATE public.studio_invitations
      SET updated_at = COALESCE(created_at, NOW())
      WHERE updated_at IS NULL;
    `)
  } catch (e) {
    console.warn(
      '[integration global-setup] studio_invitations.updated_at migrate skipped:',
      (e as Error).message
    )
  } finally {
    await client.end().catch(() => {})
  }
}

async function resetTeamInviteFixtures(admin: ReturnType<typeof createClient>): Promise<void> {
  const now = new Date()
  const pendingExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  const expiredExpiresAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const acceptedAt = now.toISOString()

  const { error: cleanupStudioAMembersError } = await (admin.from('studio_members') as any)
    .delete()
    .eq('studio_id', STUDIO_A_ID)
    .neq('id', OWNER_MEMBER_ID)
    .neq('id', PHOTOGRAPHER_MEMBER_ID)
    .neq('id', EDITOR_MEMBER_ID)
  if (cleanupStudioAMembersError) {
    console.error(
      '[integration global-setup] cleanup Studio A members:',
      cleanupStudioAMembersError.message
    )
  }

  const { error: cleanupStudioBMembersError } = await (admin.from('studio_members') as any)
    .delete()
    .eq('studio_id', STUDIO_B_ID)
    .neq('id', OUTSIDER_MEMBER_ID)
  if (cleanupStudioBMembersError) {
    console.error(
      '[integration global-setup] cleanup Studio B members:',
      cleanupStudioBMembersError.message
    )
  }

  const seedMemberResets = [
    {
      id: OWNER_MEMBER_ID,
      studio_id: STUDIO_A_ID,
      role: 'owner',
      display_name: 'Studio Owner',
    },
    {
      id: PHOTOGRAPHER_MEMBER_ID,
      studio_id: STUDIO_A_ID,
      role: 'photographer',
      display_name: 'Test Photographer',
    },
    {
      id: EDITOR_MEMBER_ID,
      studio_id: STUDIO_A_ID,
      role: 'editor',
      display_name: 'Test Editor',
    },
    {
      id: OUTSIDER_MEMBER_ID,
      studio_id: STUDIO_B_ID,
      role: 'owner',
      display_name: 'Outside Owner',
    },
  ] as const

  for (const member of seedMemberResets) {
    const { error } = await (admin.from('studio_members') as any)
      .update({
        role: member.role,
        display_name: member.display_name,
        is_active: true,
        accepted_at: acceptedAt,
      })
      .eq('id', member.id)
      .eq('studio_id', member.studio_id)

    if (error) {
      console.error('[integration global-setup] reset seed member:', member.id, error.message)
    }
  }

  const { error: cleanupInvitesError } = await (admin.from('studio_invitations') as any)
    .delete()
    .eq('studio_id', STUDIO_A_ID)
    .neq('id', INVITE_PENDING_ID)
    .neq('id', INVITE_EXPIRED_ID)
  if (cleanupInvitesError) {
    console.error('[integration global-setup] cleanup invitations:', cleanupInvitesError.message)
  }

  const { error: resetInvitesError } = await (admin.from('studio_invitations') as any)
    .upsert(
      [
        {
          id: INVITE_PENDING_ID,
          studio_id: STUDIO_A_ID,
          invited_by: OWNER_MEMBER_ID,
          email: 'pending@test.com',
          role: 'videographer',
          token: INVITE_PENDING_TOKEN,
          expires_at: pendingExpiresAt,
          accepted_at: null,
          resent_count: 0,
          last_resent_at: null,
        },
        {
          id: INVITE_EXPIRED_ID,
          studio_id: STUDIO_A_ID,
          invited_by: OWNER_MEMBER_ID,
          email: 'expired@test.com',
          role: 'assistant',
          token: INVITE_EXPIRED_TOKEN,
          expires_at: expiredExpiresAt,
          accepted_at: null,
          resent_count: 1,
          last_resent_at: null,
        },
      ],
      { onConflict: 'id' }
    )
  if (resetInvitesError) {
    console.error('[integration global-setup] reset invitations:', resetInvitesError.message)
  }
}

async function resetContractFixtures(admin: ReturnType<typeof createClient>): Promise<void> {
  const now = new Date()
  const sentAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const reminderAt = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
  const signedAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  await (admin.from('contracts') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('contract_templates') as any).delete().eq('studio_id', STUDIO_A_ID)
  await (admin.from('booking_activity_feed') as any).delete().eq('studio_id', STUDIO_A_ID).in('event_type', ['contract_sent', 'contract_reminded', 'contract_signed'])
  await (admin.from('automation_log') as any).delete().eq('studio_id', STUDIO_A_ID).in('automation_type', ['custom', 'contract_reminder'])

  await (admin.from('contract_templates') as any).upsert(
    [
      {
        id: CONTRACT_TEMPLATE_WEDDING_ID,
        studio_id: STUDIO_A_ID,
        name: 'Wedding Photography Agreement',
        event_type: 'wedding',
        content_html: '<h1>Photography Agreement</h1><p><strong>{{client_name}}</strong> agrees to photography coverage on {{event_date}} at {{venue}} for &#8377;{{total_amount}}.</p>',
        version: 1,
        is_default: false,
        is_active: true,
      },
      {
        id: CONTRACT_TEMPLATE_GENERAL_ID,
        studio_id: STUDIO_A_ID,
        name: 'General Agreement',
        event_type: null,
        content_html: '<h1>General Photography Agreement</h1><p>{{studio_name}} will deliver coverage for {{event_type}} on {{event_date}}.</p>',
        version: 1,
        is_default: true,
        is_active: true,
      },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('bookings') as any).upsert(
    [
      {
        id: BOOKING_CONVERTED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_PRIYA_ID,
        title: 'Priya Sharma - Wedding',
        event_type: 'wedding',
        event_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        venue_name: 'Hotel Grand, Surat',
        total_amount: 85000,
        advance_amount: 25500,
        amount_paid: 25500,
        gst_type: 'cgst_sgst',
        status: 'proposal_sent',
      },
      {
        id: BOOKING_CONTRACT_SIGNED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Raj Kumar - Corporate Event',
        event_type: 'corporate',
        event_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        venue_name: 'Convention Centre, Ahmedabad',
        total_amount: 45000,
        advance_amount: 15000,
        amount_paid: 15000,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
      },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('contracts') as any).upsert(
    [
      {
        id: CONTRACT_DRAFT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        template_id: CONTRACT_TEMPLATE_WEDDING_ID,
        status: 'draft',
        content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>',
        access_token: CONTRACT_DRAFT_TOKEN,
      },
      {
        id: CONTRACT_SENT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        client_id: CLIENT_PRIYA_ID,
        template_id: CONTRACT_TEMPLATE_WEDDING_ID,
        status: 'sent',
        content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>',
        access_token: CONTRACT_SENT_TOKEN,
        sent_at: sentAt,
        reminder_sent_at: null,
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
        sent_at: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
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
        content_html: '<h1>Photography Agreement</h1><p>Client: Priya Sharma</p>',
        access_token: CONTRACT_REMINDER_TOKEN,
        sent_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        reminder_sent_at: reminderAt,
      },
    ],
    { onConflict: 'id' }
  )
}

async function resetLeadFixtures(admin: ReturnType<typeof createClient>): Promise<void> {
  const keep = new Set([LEAD_1_ID, LEAD_2_ID, LEAD_3_ID, LEAD_4_ID, LEAD_5_ID, LEAD_6_ID, LEAD_7_ID, LEAD_8_ID])
  const { data, error } = await (admin.from('leads') as any).select('id, studio_id')
  if (error || !data) return
  for (const row of data) {
    if (!keep.has(row.id)) {
      await (admin.from('leads') as any).delete().eq('id', row.id)
    }
  }
}

export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[integration global-setup] Skip: missing Supabase URL or service role key')
    return
  }

  await ensureStudioInvitationsUpdatedAtColumn()

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // @ts-expect-error: residual strict constraint
  await resetTeamInviteFixtures(admin)
  // @ts-expect-error: residual strict constraint
  await resetContractFixtures(admin)
  // @ts-expect-error: residual strict constraint
  await resetLeadFixtures(admin)

  const tiers: Array<{ tier: 'starter' | 'studio' | 'agency'; max_team_members: number }> = [
    { tier: 'starter', max_team_members: 1 },
    { tier: 'studio', max_team_members: 3 },
    { tier: 'agency', max_team_members: 10 },
  ]

  for (const row of tiers) {
    const { error } = await (admin.from('subscription_plans') as any)
      .update({ max_team_members: row.max_team_members })
      .eq('tier', row.tier)
    if (error) {
      console.error(`[integration global-setup] update ${row.tier}:`, error.message)
    }
  }

  const { error: studioErr } = await (admin.from('studios') as any)
    .update({ plan_tier: 'studio' })
    .eq('id', STUDIO_A_ID)
  if (studioErr) {
    console.error('[integration global-setup] studios plan_tier:', studioErr.message)
  }

  const { error: rlErr } = await (admin.from('rate_limits') as any).delete().like('key', 'team_accept:%')
  if (rlErr) {
    console.error('[integration global-setup] rate_limits cleanup:', rlErr.message)
  }

  const now = new Date().toISOString()
  const { error: onboardErr } = await (admin.from('studio_onboarding_events') as any).upsert(
    [
      {
        id: ONBOARDING_A_EVT_1,
        studio_id: STUDIO_A_ID,
        step_number: 1,
        step_name: 'basic_info',
        completed_at: now,
        time_spent_sec: 120,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_2,
        studio_id: STUDIO_A_ID,
        step_number: 2,
        step_name: 'business_details',
        completed_at: now,
        time_spent_sec: 90,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_3,
        studio_id: STUDIO_A_ID,
        step_number: 3,
        step_name: 'payment_setup',
        completed_at: now,
        time_spent_sec: 60,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_4,
        studio_id: STUDIO_A_ID,
        step_number: 4,
        step_name: 'inquiry_form',
        completed_at: now,
        time_spent_sec: 45,
        skipped: false,
      },
      {
        id: ONBOARDING_A_EVT_5,
        studio_id: STUDIO_A_ID,
        step_number: 5,
        step_name: 'first_package',
        completed_at: now,
        time_spent_sec: 180,
        skipped: false,
      },
    ],
    { onConflict: 'studio_id,step_number' }
  )
  if (onboardErr) {
    console.error('[integration global-setup] studio_onboarding_events:', onboardErr.message)
  }

  await (admin.from('studios') as any)
    .update({
      onboarding_completed: true,
      onboarding_step: 5,
      onboarding_completed_at: now,
    })
    .eq('id', STUDIO_A_ID)
}
