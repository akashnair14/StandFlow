'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function inviteMember(email: string, teamId: string, role: 'manager' | 'team_leader' | 'team_member' = 'team_member') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) return { error: 'Profile not found' }

  if (profile.role === 'team_member') {
    return { error: 'Team members cannot invite new users.' }
  }

  if (profile.role === 'team_leader' && role !== 'team_member') {
    return { error: 'Team leaders can only invite team members.' }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Service Role Key missing. Please configure it in your environment.' }
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    const { error: joinError } = await adminClient
      .from('team_members')
      .insert({ team_id: teamId, user_id: existingUser.id, role: role })

    if (joinError) {
      if (joinError.code === '23505') return { error: 'User is already a member.' }
      return { error: joinError.message }
    }

    return { success: true, message: `${email} added to team.` }
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { team_id: teamId, invited_by: user.id, role: role },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signup?team_id=${teamId}`
  })

  if (error) return { error: error.message }

  if (data.user) {
    await adminClient.from('team_members').insert({ team_id: teamId, user_id: data.user.id, role: role })
  }

  return { success: true, message: `Invitation sent to ${email}!` }
}

export async function createTeamAction() {
  const adminSupabase = await createAdminClient()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()
    
  if (profile?.role !== 'manager') {
    return { error: 'Only Managers can create new teams.' }
  }

  const name = profile?.full_name?.split(' ')[0] || 'My'

  const { data: newTeam, error: createTeamError } = await adminSupabase
    .from('teams')
    .insert({ name: `${name}'s Team`, owner_id: user.id })
    .select()
    .maybeSingle()

  if (createTeamError || !newTeam) {
    return { error: `Failed to create team: ${createTeamError?.message || 'Unknown error'}` }
  }

  await adminSupabase.from('team_members').insert({
    team_id: newTeam.id,
    user_id: user.id,
    role: 'manager'
  })

  const { data: fullMemberData } = await adminSupabase
    .from('team_members')
    .select('*, profiles(*), teams(*)')
    .eq('team_id', newTeam.id)
    .eq('user_id', user.id)
    .maybeSingle()

  return { success: true, teamId: newTeam.id, data: fullMemberData }
}

export async function getUserActiveTeam() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()

    const { data: memberships } = await adminSupabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)

    if (memberships && memberships.length > 0) {
      return { teamId: memberships[0].team_id }
    }

    const { data: ownedTeams } = await adminSupabase
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)

    return { teamId: ownedTeams?.[0]?.id || null }
  } catch (err: any) {
    return { error: err.message }
  }
}
