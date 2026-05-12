import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function freshStart() {
  console.log('🚀 Starting Fresh Start cleanup for:', supabaseUrl)

  // 1. Delete data from public tables
  console.log('--- Cleaning Public Tables ---')
  // Order matters for foreign keys
  const tables = ['standups', 'team_members', 'teams', 'profiles']
  
  for (const table of tables) {
    console.log(`Clearing ${table}...`)
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      console.warn(`Warning: Could not clear ${table}:`, error.message)
    }
  }

  // 2. Delete all Auth Users
  console.log('\n--- Cleaning Auth Users ---')
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  console.log(`Found ${users.length} users to delete.`)

  for (const user of users) {
    console.log(`Deleting user: ${user.email} (${user.id})...`)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error(`Failed to delete user ${user.id}:`, deleteError.message)
    }
  }

  console.log('\n✅ Cleanup complete. You have a fresh project state.')
}

freshStart()
