/**
 * Rollback test users seed.
 * Deletes studio_members records and auth users.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register --project supabase/tsconfig.seed.json supabase/rollback-test-users.ts
 *
 * WARNING: This permanently deletes auth users. Their data cannot be recovered.
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

const MEMBER_IDS = [
  'c0000001-0001-4000-8000-000000000001',
  'c0000001-0001-4000-8000-000000000002',
  'c0000001-0001-4000-8000-000000000003',
  'c0000001-0001-4000-8000-000000000004',
]

const TEST_USER_EMAILS = [
  'owner@test.com',
  'photographer@test.com',
  'editor@test.com',
  'outsider@test.com',
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

async function rollback(): Promise<void> {
  console.log('Rolling back test users...\n')

  // Step 1: Delete studio_members
  console.log('1/2 Deleting studio_members records...')
  const { data: deletedMembers, error: memberErr } = await supabase
    .from('studio_members')
    .delete()
    .in('id', MEMBER_IDS)
    .select('id, display_name')

  if (memberErr) {
    console.error(`   ✗ Failed to delete studio_members: ${memberErr.message}`)
    process.exit(1)
  }

  console.log(`   ✓ Deleted ${deletedMembers?.length ?? 0} studio_member records`)

  // Step 2: Delete auth users
  console.log('\n2/2 Deleting auth users...')
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (listErr) {
    console.error(`   ✗ Failed to list users: ${listErr.message}`)
    process.exit(1)
  }

  let deletedCount = 0
  for (const email of TEST_USER_EMAILS) {
    const user = listData.users?.find((u) => u.email === email)
    if (user) {
      const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteErr) {
        console.error(`   ✗ Failed to delete ${email}: ${deleteErr.message}`)
      } else {
        console.log(`   ✓ Deleted auth user: ${email}`)
        deletedCount++
      }
    } else {
      console.log(`   - ${email} not found (already deleted or never created)`)
    }
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`✓ Rollback complete.`)
  console.log(`  Deleted ${deletedMembers?.length ?? 0} studio_member records`)
  console.log(`  Deleted ${deletedCount} auth users`)
}

rollback().catch((err) => {
  console.error('Rollback failed:', err)
  process.exit(1)
})
