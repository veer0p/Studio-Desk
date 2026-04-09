/**
 * StudioDesk Test Users Seed
 * ==========================
 * Creates 4 deterministic test users in Supabase Auth + studio_members.
 *
 * Users:
 *   - owner@test.com        → OWNER role,        Studio A (XYZ Photography)
 *   - photographer@test.com → PHOTOGRAPHER role, Studio A (XYZ Photography)
 *   - editor@test.com       → EDITOR role,       Studio A (XYZ Photography)
 *   - outsider@test.com     → OWNER role,        Studio B (ABC Clicks)
 *
 * Password for all users: Test@1234
 * (hashed by Supabase GoTrue using bcrypt internally)
 *
 * Idempotency:
 *   - Auth users: checked via listUsers before creation (no duplicates)
 *   - Studio members: upsert ON CONFLICT (id)
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register --project supabase/tsconfig.seed.json supabase/seed-test-users.ts
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (set in .env.local or .env)
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

// ── Deterministic UUIDs (shared with seed-ids.ts) ──────────────────────────
const OWNER_USER_ID = 'b0000001-0001-4000-8000-000000000001'
const PHOTOGRAPHER_USER_ID = 'b0000001-0001-4000-8000-000000000002'
const EDITOR_USER_ID = 'b0000001-0001-4000-8000-000000000003'
const OUTSIDER_USER_ID = 'b0000001-0001-4000-8000-000000000004'

const STUDIO_A_ID = 'a0000001-0001-4000-8000-000000000001'
const STUDIO_B_ID = 'a0000001-0001-4000-8000-000000000002'

const OWNER_MEMBER_ID = 'c0000001-0001-4000-8000-000000000001'
const PHOTOGRAPHER_MEMBER_ID = 'c0000001-0001-4000-8000-000000000002'
const EDITOR_MEMBER_ID = 'c0000001-0001-4000-8000-000000000003'
const OUTSIDER_MEMBER_ID = 'c0000001-0001-4000-8000-000000000004'

// ── Test user definitions ──────────────────────────────────────────────────
interface TestUserConfig {
  email: string
  password: string
  preferredAuthId: string
  memberRecord: {
    id: string
    studioId: string
    role: 'owner' | 'photographer' | 'videographer' | 'editor' | 'assistant'
    displayName: string
    phone?: string
    whatsapp?: string
    specialization?: string[]
  }
}

const TEST_USERS: TestUserConfig[] = [
  {
    email: 'owner@test.com',
    password: 'Test@1234',
    preferredAuthId: OWNER_USER_ID,
    memberRecord: {
      id: OWNER_MEMBER_ID,
      studioId: STUDIO_A_ID,
      role: 'owner',
      displayName: 'Studio Owner',
    },
  },
  {
    email: 'photographer@test.com',
    password: 'Test@1234',
    preferredAuthId: PHOTOGRAPHER_USER_ID,
    memberRecord: {
      id: PHOTOGRAPHER_MEMBER_ID,
      studioId: STUDIO_A_ID,
      role: 'photographer',
      displayName: 'Test Photographer',
      phone: '9876500001',
      whatsapp: '9876500001',
      specialization: ['wedding', 'portrait'],
    },
  },
  {
    email: 'editor@test.com',
    password: 'Test@1234',
    preferredAuthId: EDITOR_USER_ID,
    memberRecord: {
      id: EDITOR_MEMBER_ID,
      studioId: STUDIO_A_ID,
      role: 'editor',
      displayName: 'Test Editor',
      phone: '9876500002',
      whatsapp: '9876500002',
      specialization: ['corporate', 'video'],
    },
  },
  {
    email: 'outsider@test.com',
    password: 'Test@1234',
    preferredAuthId: OUTSIDER_USER_ID,
    memberRecord: {
      id: OUTSIDER_MEMBER_ID,
      studioId: STUDIO_B_ID,
      role: 'owner',
      displayName: 'Outside Owner',
    },
  },
]

// ── Supabase client setup ─────────────────────────────────────────────────
const DEFAULT_LOCAL_SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? DEFAULT_LOCAL_SERVICE_ROLE

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Auth user creation (idempotent) ───────────────────────────────────────
/**
 * Ensures an auth user exists with the given email.
 * If not found, creates the user with the provided password.
 * Password is hashed by Supabase GoTrue internally using bcrypt.
 *
 * Returns the user's auth UUID.
 */
async function ensureAuthUser(
  email: string,
  password: string,
  preferredId: string
): Promise<string> {
  // Check if user already exists
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (listErr) throw listErr

  const existingUser = list?.users?.find((u) => u.email === email)
  if (existingUser) {
    console.log(`  ✓ Auth user already exists: ${email} (id: ${existingUser.id})`)
    return existingUser.id
  }

  // Create user with preferred ID (works on local Supabase)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    id: preferredId,
  } as { email: string; password: string; email_confirm: boolean; id?: string })

  // Handle duplicate email edge case (race condition)
  if (error && /already|registered|duplicate/i.test(error.message)) {
    const { data: list2, error: e2 } = await supabase.auth.admin.listUsers({ perPage: 200 })
    if (e2) throw e2
    const u = list2?.users?.find((x) => x.email === email)
    if (u) {
      console.log(`  ✓ Auth user already exists (race): ${email} (id: ${u.id})`)
      return u.id
    }
    throw error
  }

  // Handle GoTrue ignoring the `id` field (may happen on some versions)
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

  console.log(`  ✓ Created auth user: ${email} (id: ${data.user!.id})`)
  return data.user!.id
}

// ── Main seed function ─────────────────────────────────────────────────────
async function seedTestUsers(): Promise<void> {
  console.log('Seeding StudioDesk test users...')
  const now = new Date()

  // Step 1: Ensure studios exist (required FK for studio_members)
  console.log('\n1/3 Ensuring studios exist...')
  const { error: studioCheckErr } = await supabase
    .from('studios')
    .select('id')
    .in('id', [STUDIO_A_ID, STUDIO_B_ID])

  if (studioCheckErr) {
    console.error('Error checking studios:', studioCheckErr.message)
    console.error('Run the main seed.ts first to create studios.')
    process.exit(1)
  }

  // Step 2: Create/authenticate users in Supabase Auth
  console.log('\n2/3 Creating/authenticating users in Supabase Auth...')
  const authUserIds = new Map<string, string>()

  for (const userConfig of TEST_USERS) {
    const authId = await ensureAuthUser(
      userConfig.email,
      userConfig.password,
      userConfig.preferredAuthId
    )
    authUserIds.set(userConfig.email, authId)
  }

  // Step 3: Upsert studio_members records
  console.log('\n3/3 Upserting studio_members records...')
  const memberRecords = TEST_USERS.map((userConfig) => {
    const authId = authUserIds.get(userConfig.email)!
    return {
      id: userConfig.memberRecord.id,
      studio_id: userConfig.memberRecord.studioId,
      user_id: authId,
      role: userConfig.memberRecord.role,
      display_name: userConfig.memberRecord.displayName,
      phone: userConfig.memberRecord.phone ?? null,
      whatsapp: userConfig.memberRecord.whatsapp ?? null,
      specialization: userConfig.memberRecord.specialization ?? null,
      is_active: true,
      accepted_at: now.toISOString(),
    }
  })

  const { data: upserted, error: upsertErr } = await supabase
    .from('studio_members')
    .upsert(memberRecords, { onConflict: 'id' })
    .select('id, user_id, studio_id, role, display_name')

  if (upsertErr) {
    console.error('Error upserting studio_members:', upsertErr)
    process.exit(1)
  }

  console.log(`  ✓ Upserted ${upserted?.length ?? memberRecords.length} studio_member records`)

  // ── Verification ─────────────────────────────────────────────────────────
  console.log('\n── Verification ──')
  const { data: members, error: queryErr } = await supabase
    .from('studio_members')
    .select(
      `
      id,
      role,
      display_name,
      is_active,
      studio_id,
      user_id,
      studios ( name )
    `
    )
    .in('user_id', Array.from(authUserIds.values()))

  if (queryErr) {
    console.error('Verification query failed:', queryErr)
    process.exit(1)
  }

  if (!members || members.length === 0) {
    console.error('WARNING: No studio_members found after upsert!')
    process.exit(1)
  }

  console.log('\nTest users successfully seeded:')
  console.log('─'.repeat(70))
  console.log(
    `${'Email'.padEnd(28)} | ${'Role'.padEnd(14)} | ${'Studio'.padEnd(20)} | Active`
  )
  console.log('─'.repeat(70))

  for (const member of members) {
    const email =
      TEST_USERS.find((u) => u.memberRecord.id === member.id)?.email ?? 'unknown'
    console.log(
      `${email.padEnd(28)} | ${member.role.padEnd(14)} | ${(member.studios as any)?.name?.padEnd(20) ?? 'N/A'.padEnd(20)} | ${member.is_active}`
    )
  }

  console.log('─'.repeat(70))
  console.log(`\n✓ All ${members.length} test users seeded successfully.`)
  console.log('  Password for all users: Test@1234')
  console.log('  (Hashed by Supabase GoTrue using bcrypt)')
}

// ── Execute ────────────────────────────────────────────────────────────────
seedTestUsers().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
