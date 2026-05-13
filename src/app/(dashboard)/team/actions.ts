'use server'

import { createClient } from '@/lib/supabase/server'

export async function inviteMember(email: string, teamId: string, role: 'manager' | 'team_leader' | 'team_member' = 'team_member') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // 1. Check if the user is authorized to invite
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  // 2. Authorization Rules
  if (profile.role === 'team_member') {
    return { error: 'Team members cannot invite new users.' }
  }

  if (profile.role === 'team_leader' && role !== 'team_member') {
    return { error: 'Team leaders can only invite team members.' }
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

  // 4. First, check if the user already exists in the system
  // We use the admin API to check by email
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    // User already exists! Just add them to the team_members table directly.
    const { error: joinError } = await adminClient
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: existingUser.id,
        role: role
      })

    if (joinError) {
      if (joinError.code === '23505') { // Unique constraint violation
        return { error: 'This user is already a member of your team.' }
      }
      return { error: joinError.message }
    }

    return { 
      success: true, 
      message: `${email} is already on StandFlow! They have been added to your team and can access it immediately.` 
    }
  }

  // 5. If user doesn't exist, send a real invitation
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      team_id: teamId,
      invited_by: user.id,
      role: role
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signup?team_id=${teamId}`
  })

  if (error) {
    return { error: error.message }
  }

  // 6. Automatically add to team_members table so they are "assigned" even before they confirm email
  if (data.user) {
    const { error: joinError } = await adminClient
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: data.user.id,
        role: role
      })
    
    if (joinError) {
      console.error('Join Error after invite:', joinError.message)
      // We don't return error here because the invitation was still sent successfully
    }
  }

  return { success: true, message: `Invitation sent to ${email}! They will be automatically assigned to your team upon joining.` }
}

export async function createTeamAction() {
  const { createClient, createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Check if the user is a Manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()
    
  if (profile?.role !== 'manager') {
    return { error: 'Only Managers can create new teams.' }
  }

  const name = profile?.full_name?.split(' ')[0] || 'My'

  // 2. Create the team
  const { data: newTeam, error: createTeamError } = await adminSupabase
    .from('teams')
    .insert({
      name: `${name}'s Team`,
      owner_id: user.id
    })
    .select()
    .maybeSingle()

  if (createTeamError) {
    if (createTeamError.code === '42P01') {
      return { error: 'Database tables are missing. Please run the provided SQL in your Supabase Dashboard.' }
    }
    return { error: `Failed to create team: ${createTeamError.message}` }
  }
  
  if (!newTeam) return { error: 'Team creation failed silently. Please check your database permissions.' }

  // 3. Add user as manager
  const { error: memberError } = await adminSupabase.from('team_members').insert({
    team_id: newTeam.id,
    user_id: user.id,
    role: 'manager'
  })

  if (memberError) {
    return { error: `Failed to join team: ${memberError.message}` }
  }

  // 4. Return the full data to avoid a re-fetch delay
  const { data: fullMemberData } = await adminSupabase
    .from('team_members')
    .select('*, profiles(*), teams(*)')
    .eq('team_id', newTeam.id)
    .eq('user_id', user.id)
    .maybeSingle()

  return { success: true, teamId: newTeam.id, data: fullMemberData }
}
