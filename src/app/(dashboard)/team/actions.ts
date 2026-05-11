'use server'

import { createClient } from '@/lib/supabase/server'

export async function inviteMember(email: string, teamId: string) {
  const supabase = await createClient()
  
  // 1. Check if the user is authorized to invite
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 2. We need the Service Role Key to invite users via Auth
  // If the user hasn't provided it, we can't send a real auth email.
  // We will check for it in the environment.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    // If no service key, we fallback to creating an invitation record if a table exists
    // But since we can't be sure of the schema, we'll try a common one
    try {
       // Mocking the check for the table
       const { error: inviteError } = await supabase.from('team_invitations').insert({
         email,
         team_id: teamId,
         invited_by: user.id,
         status: 'pending'
       })

       if (inviteError) {
         if (inviteError.code === '42P01') { // Table doesn't exist
            return { error: 'Invitation system requires configuration. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local to send actual invitation emails.' }
         }
         return { error: inviteError.message }
       }

       return { success: true, message: 'Invitation record created. (Email service pending setup)' }
    } catch (e) {
      return { error: 'Service Role Key missing. Please configure it in your environment to send invitation emails.' }
    }
  }

  // 3. If we have the key, we can try to send a real invitation
  // Note: We need a SEPARATE client for admin actions
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      team_id: teamId,
      invited_by: user.id
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signup`
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: `Real invitation sent to ${email} via Supabase Auth!` }
}

export async function createTeamAction() {
  const { createClient, createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Get profile name
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const name = profile?.full_name?.split(' ')[0] || 'My'

  // 2. Create the team
  const { data: newTeam, error: createTeamError } = await adminSupabase
    .from('teams')
    .insert({
      name: `${name}'s Team`,
      owner_id: user.id
    })
    .select()
    .single()

  if (createTeamError) return { error: createTeamError.message }

  // 3. Add user as manager
  const { error: memberError } = await adminSupabase.from('team_members').insert({
    team_id: newTeam.id,
    user_id: user.id,
    role: 'manager'
  })

  if (memberError) return { error: memberError.message }

  return { success: true, teamId: newTeam.id }
}
