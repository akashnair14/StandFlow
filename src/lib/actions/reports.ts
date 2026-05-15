'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Report } from '@/types'

export async function getMyReportsAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()
    
    const { data: reports, error: reportsError } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reportsError) throw reportsError

    const userIds = Array.from(new Set(reports.map(r => r.user_id)))
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    const profilesMap = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
      acc[p.id] = p
      return acc
    }, {})
    
    const enrichedReports = reports.map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || null
    }))

    return { reports: enrichedReports as Report[] }
  } catch (err: any) {
    console.error('Error in getMyReportsAction:', err)
    return { error: err.message }
  }
}

export async function getTeamReportsAction(teamId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()
    const { data: membership } = await adminSupabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .maybeSingle()
    
    const { data: ownedTeam } = await adminSupabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!membership && !ownedTeam) {
      return { error: 'Unauthorized' }
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const dateLimit = sevenDaysAgo.toISOString().split('T')[0]

    const { data: reports, error: reportsError } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('team_id', teamId)
      .gte('date', dateLimit)
      .order('created_at', { ascending: false })

    if (reportsError) throw reportsError

    const userIds = Array.from(new Set(reports.map(r => r.user_id)))
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    const profilesMap = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
      acc[p.id] = p
      return acc
    }, {})
    
    const enrichedReports = reports.map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || null
    }))

    return { reports: enrichedReports as Report[] }
  } catch (err: any) {
    console.error('Error in getTeamReportsAction:', err)
    return { error: err.message }
  }
}

export async function acknowledgeReportAction(reportId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()
    
    const { data: report, error: fetchError } = await adminSupabase
      .from('reports')
      .select('content')
      .eq('id', reportId)
      .single()

    if (fetchError || !report) throw fetchError || new Error('Report not found')

    const content = { ...(report.content as any) }
    const acknowledgments = content.acknowledgments || []
    
    if (acknowledgments.includes(user.id)) {
      return { success: true, alreadyAcknowledged: true }
    }

    const updatedContent = {
      ...content,
      acknowledgments: [...acknowledgments, user.id]
    }

    const { error: updateError } = await adminSupabase
      .from('reports')
      .update({ content: updatedContent })
      .eq('id', reportId)

    if (updateError) throw updateError

    return { success: true }
  } catch (err: any) {
    console.error('Error in acknowledgeReportAction:', err)
    return { error: err.message }
  }
}

export async function postReportAction(values: Record<string, any>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Import teams action dynamically to avoid circular dependency if any
    const { getUserActiveTeam } = await import('./teams')
    const teamResult = await getUserActiveTeam()
    const teamId = teamResult.teamId

    if (!teamId) {
      return { error: 'You are not currently assigned to any team. Please join or create a team to post updates.' }
    }

    const content = {
      ...values,
      completed: typeof values.completed === 'string' 
        ? values.completed.split('\n').filter((i: string) => i.trim()) 
        : (Array.isArray(values.completed) ? values.completed : []),
      planned: typeof values.planned === 'string' 
        ? values.planned.split('\n').filter((i: string) => i.trim()) 
        : (Array.isArray(values.planned) ? values.planned : []),
      blockers: typeof values.blockers === 'string' 
        ? values.blockers.split('\n').filter((i: string) => i.trim()) 
        : (Array.isArray(values.blockers) ? values.blockers : []),
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        team_id: teamId,
        content: content,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, report: data }
  } catch (err: any) {
    console.error('Error in postReportAction:', err)
    return { error: err.message }
  }
}
