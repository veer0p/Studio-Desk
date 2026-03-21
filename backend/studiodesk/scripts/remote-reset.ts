import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function reset() {
  console.log('Resetting remote database...')
  
  const tables = [
    'payments', 'invoices', 'contracts', 'galleries', 
    'booking_activity_feed', 'bookings', 'leads', 'clients', 
    'service_packages', 'package_addons', 'studio_members', 
    'studio_invitations', 'automation_settings', 'revenue_snapshots',
    'studio_onboarding_events', 'studios'
  ]

  for (const table of tables) {
    console.log(`Truncating ${table}...`)
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000') // Truncate via delete all
    if (error) console.error(`Error truncating ${table}:`, error.message)
  }

  // Also clear Auth users (this requires admin API)
  console.log('Clearing Auth users...')
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error('Error listing users:', listError.message)
  } else {
    for (const user of users.users) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  }

  console.log('Remote reset complete.')
}

reset()
