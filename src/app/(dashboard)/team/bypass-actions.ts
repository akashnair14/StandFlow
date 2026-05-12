'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function getTeamDataBypass(userId: string, userRole: string, selectedTeamId?: string) {
  try {
    // 1. If Manager, find teams owned
    if (userRole === 'manager') {
      const { data: teams } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('owner_id', userId)
      
      const teamToFetch = selectedTeamId || teams?.[0]?.id
      
      if (teamToFetch) {
        const { data: members } = await supabaseAdmin
          .from('team_members')
          .select('*, profiles(*)')
          .eq('team_id', teamToFetch)
        
        return {
          teams: teams || [],
          members: members || [],
          currentTeamId: teamToFetch,
          currentTeam: teams?.find(t => t.id === teamToFetch)
        }
      }
      return { teams: teams || [], members: [] }
    }

    // 2. If Leader/Member, find their membership
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (membership) {
      const { data: members } = await supabaseAdmin
        .from('team_members')
        .select('*, profiles(*)')
        .eq('team_id', membership.team_id)
      
      return {
        teams: [membership.teams],
        members: members || [],
        currentTeamId: membership.team_id,
        currentTeam: membership.teams
      }
    }

    return { teams: [], members: [] }
  } catch (error: any) {
    return { error: error.message }
  }
}
