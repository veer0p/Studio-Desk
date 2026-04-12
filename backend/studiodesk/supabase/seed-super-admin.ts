/**
 * StudioDesk Super Admin Seed
 * ============================
 * Creates the first super_admin user in Supabase Auth + platform_admins table.
 *
 * User:
 *   - admin@studiodesk.in → SUPER_ADMIN role
 *
 * Password: Admin@1234
 *
 * Idempotency:
 *   - Auth users: checked via listUsers before creation (no duplicates)
 *   - Platform admin: checked by email before creation
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register --project supabase/tsconfig.seed.json supabase/seed-super-admin.ts
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY (set in .env.local)
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Deterministic UUID for the admin user
const ADMIN_USER_ID = 'd0000001-0001-4000-8000-000000000001'

interface AdminConfig {
  email: string
  password: string
  name: string
  userId: string
  role: 'super_admin' | 'support_agent' | 'billing_admin' | 'readonly_analyst'
}

const SUPER_ADMIN: AdminConfig = {
  email: 'admin@studiodesk.in',
  password: 'Admin@1234',
  name: 'Platform Administrator',
  userId: ADMIN_USER_ID,
  role: 'super_admin',
}

async function ensureAuthUser(config: AdminConfig): Promise<string> {
  // Check if user already exists
  const { data: { users } } = await admin.auth.admin.listUsers()
  const existing = users?.find((u) => u.email === config.email)

  if (existing) {
    console.log(`  ✓ Auth user exists: ${config.email} (${existing.id})`)
    return existing.id
  }

  // Create user
  console.log(`  → Creating auth user: ${config.email}`)
  const { data, error } = await admin.auth.admin.createUser({
    email: config.email,
    password: config.password,
    email_confirm: true,
    user_metadata: {
      full_name: config.name,
    },
  })

  if (error) {
    console.error(`  ✗ Failed to create auth user: ${error.message}`)
    throw error
  }

  console.log(`  ✓ Auth user created: ${config.email} (${data.user.id})`)
  return data.user.id
}

async function ensurePlatformAdmin(userId: string, config: AdminConfig): Promise<void> {
  // Check if admin record already exists
  const { data: existing } = await admin
    .from('platform_admins')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    console.log(`  ✓ Platform admin record exists`)
    // Update role to super_admin if not already
    await admin
      .from('platform_admins')
      .update({ role: config.role })
      .eq('user_id', userId)
    console.log(`  ✓ Role updated to: ${config.role}`)
    return
  }

  // Create admin record
  console.log(`  → Creating platform_admins record`)
  const { data, error } = await admin
    .from('platform_admins')
    .insert({
      user_id: userId,
      name: config.name,
      email: config.email,
      role: config.role,
      is_active: true,
      is_2fa_enabled: false,
      login_count: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error(`  ✗ Failed to create platform_admins: ${error.message}`)
    throw error
  }

  console.log(`  ✓ Platform admin created: ${config.email} (id: ${data.id})`)
}

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  Seeding Super Admin User                ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('')

  const userId = await ensureAuthUser(SUPER_ADMIN)
  await ensurePlatformAdmin(userId, SUPER_ADMIN)

  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  Super Admin Ready                       ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Email:    ${SUPER_ADMIN.email.padEnd(28)}║`)
  console.log(`║  Password: ${SUPER_ADMIN.password.padEnd(28)}║`)
  console.log(`║  Role:     ${SUPER_ADMIN.role.padEnd(28)}║`)
  console.log('╚══════════════════════════════════════════╝')
  console.log('')
  console.log('Login at: http://localhost:3000/admin/login')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
