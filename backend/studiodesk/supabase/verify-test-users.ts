/**
 * Verify that test users were seeded correctly.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register --project supabase/tsconfig.seed.json supabase/verify-test-users.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

const TEST_USER_EMAILS = [
  'owner@test.com',
  'photographer@test.com',
  'editor@test.com',
  'outsider@test.com',
]

const EXPECTED_MEMBERS = [
  {
    id: 'c0000001-0001-4000-8000-000000000001',
    email: 'owner@test.com',
    role: 'owner',
    displayName: 'Studio Owner',
    studioId: 'a0000001-0001-4000-8000-000000000001',
  },
  {
    id: 'c0000001-0001-4000-8000-000000000002',
    email: 'photographer@test.com',
    role: 'photographer',
    displayName: 'Test Photographer',
    studioId: 'a0000001-0001-4000-8000-000000000001',
  },
  {
    id: 'c0000001-0001-4000-8000-000000000003',
    email: 'editor@test.com',
    role: 'editor',
    displayName: 'Test Editor',
    studioId: 'a0000001-0001-4000-8000-000000000001',
  },
  {
    id: 'c0000001-0001-4000-8000-000000000004',
    email: 'outsider@test.com',
    role: 'owner',
    displayName: 'Outside Owner',
    studioId: 'a0000001-0001-4000-8000-000000000002',
  },
]

const DEFAULT_LOCAL_SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? DEFAULT_LOCAL_SERVICE_ROLE

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function verify(): Promise<boolean> {
  let allPassed = true

  console.log('Verifying test users...\n')

  // 1. Check auth users
  console.log('1/3 Checking auth.users...')
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (authErr) {
    console.error(`   ✗ Failed to list users: ${authErr.message}`)
    return false
  }

  for (const email of TEST_USER_EMAILS) {
    const found = authUsers.users?.find((u) => u.email === email)
    if (found) {
      console.log(`   ✓ ${email} (id: ${found.id}, confirmed: ${!!found.email_confirmed_at})`)
    } else {
      console.log(`   ✗ ${email} — NOT FOUND`)
      allPassed = false
    }
  }

  // 2. Check studio_members
  console.log('\n2/3 Checking studio_members...')
  const { data: members, error: memberErr } = await supabase
    .from('studio_members')
    .select(
      `
      id,
      role,
      display_name,
      is_active,
      accepted_at,
      studio_id,
      user_id,
      studios ( name )
    `
    )
    .in('id', EXPECTED_MEMBERS.map((m) => m.id))

  if (memberErr) {
    console.error(`   ✗ Failed to query studio_members: ${memberErr.message}`)
    return false
  }

  for (const expected of EXPECTED_MEMBERS) {
    const member = members?.find((m) => m.id === expected.id)
    if (!member) {
      console.log(`   ✗ Member ${expected.id} (${expected.email}) — NOT FOUND`)
      allPassed = false
      continue
    }

    const checks = [
      { name: 'role', pass: member.role === expected.role },
      { name: 'display_name', pass: member.display_name === expected.displayName },
      { name: 'studio_id', pass: member.studio_id === expected.studioId },
      { name: 'is_active', pass: member.is_active === true },
      { name: 'accepted_at', pass: !!member.accepted_at },
    ]

    const failed = checks.filter((c) => !c.pass)
    if (failed.length === 0) {
      console.log(`   ✓ ${expected.email} — all checks passed`)
    } else {
      console.log(
        `   ✗ ${expected.email} — failed: ${failed.map((c) => c.name).join(', ')}`
      )
      allPassed = false
    }
  }

  // 3. Test login
  console.log('\n3/3 Testing login (owner@test.com)...')
  const { data: session, error: loginErr } = await supabase.auth.signInWithPassword({
    email: 'owner@test.com',
    password: 'Test@1234',
  })

  if (loginErr) {
    console.log(`   ✗ Login failed: ${loginErr.message}`)
    allPassed = false
  } else if (session?.session?.access_token) {
    console.log(`   ✓ Login successful (token expires: ${session.session.expires_at})`)
  } else {
    console.log('   ✗ Login returned no session')
    allPassed = false
  }

  // Summary
  console.log('\n' + '─'.repeat(50))
  if (allPassed) {
    console.log('✓ All verification checks passed!')
    return true
  } else {
    console.log('✗ Some checks failed. Review output above.')
    return false
  }
}

verify().then((ok) => {
  process.exit(ok ? 0 : 1)
}).catch((err) => {
  console.error('Verification crashed:', err)
  process.exit(1)
})
