'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // --- HEAL LOGIC: Auto-join team if in metadata but missing in DB ---
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const adminSupabase = await createAdminClient()
      
      // Check if they have a team in metadata
      const teamId = user.user_metadata?.team_id
      const role = user.user_metadata?.role || 'team_member'

      if (teamId) {
        // Check if already in this team
        const { data: existing } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (!existing) {
          // Join the team automatically
          await adminSupabase.from('team_members').insert({
            team_id: teamId,
            user_id: user.id,
            role: role
          })
        }
      }
    }
  } catch (err: any) {
    console.error('Critical Login Error:', err)
    if (err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('fetch failed')) {
      return { error: 'Network Connection Timeout: Unable to reach the server. Please check your internet connection or try again later.' }
    }
    return { error: err.message || 'An unexpected error occurred during login.' }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const teamId = formData.get('team_id') as string

    if (!email || !password || !fullName) {
      return { error: 'All fields are required' }
    }

    const role = formData.get('role') as string
    
    // Determine initial role: 
    // 1. If role is explicitly provided (via invite), use it.
    // 2. If teamId is provided (joining a team), default to team_member.
    // 3. If neither (new signup), default to manager.
    const initialRole = role || (teamId ? 'team_member' : 'manager')

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: initialRole,
          team_id: teamId, // Store team_id in metadata as well for the trigger or backup
        },
      },
    })

    if (error) {
      // If user already exists, we might still want to try joining them to the team
      if (error.message.toLowerCase().includes('already registered') && teamId) {
        const adminSupabase = await createAdminClient()
        const { data: { users } } = await adminSupabase.auth.admin.listUsers()
        const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        
        if (existing) {
          await adminSupabase.from('team_members').upsert({
            team_id: teamId,
            user_id: existing.id,
            role: role || 'team_member'
          })
          return { error: 'You are already registered. Please login to access your team.' }
        }
      }
      console.error('Supabase Auth Error:', error.message)
      return { error: error.message }
    }

    // If we have a user, handle team association
    if (data.user) {
      const adminSupabase = await createAdminClient()
      
      // Prioritize teamId from form, fallback to metadata (for invited users)
      const finalTeamId = teamId || data.user.user_metadata?.team_id
      
      if (finalTeamId) {
        // Check if already in this team to avoid unique constraint errors
        const { data: existingMember } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('team_id', finalTeamId)
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!existingMember) {
          const { error: teamError } = await adminSupabase
            .from('team_members')
            .insert({
              team_id: finalTeamId,
              user_id: data.user.id,
              role: data.user.user_metadata?.role || 'team_member'
            })
          if (teamError) console.error('Join Team Error:', teamError.message)
        }
      } else {
        // Only create a new team if they aren't joining one and aren't already in one
        const { data: existingAnyMember } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!existingAnyMember) {
          const { data: newTeam, error: createTeamError } = await adminSupabase
            .from('teams')
            .insert({
              name: `${fullName.split(' ')[0]}'s Team`,
              owner_id: data.user.id
            })
            .select()
            .maybeSingle()

          if (createTeamError) {
            console.error('Create Team Error:', createTeamError.message)
          } else if (newTeam) {
            await adminSupabase.from('team_members').insert({
              team_id: newTeam.id,
              user_id: data.user.id,
              role: 'manager'
            })
          }
        }
      }
    }

    if (data.user && !data.session) {
      return { error: 'Success! Please check your email to confirm your account.' }
    }
  } catch (err: any) {
    console.error('Critical Signup Error:', err)
    
    // Check for specific environment errors
    if (err.message?.includes('env')) {
      return { error: 'Server configuration error: Missing environment variables.' }
    }
    
    return { error: err.message || 'An unexpected error occurred during signup.' }
  }

  // Redirect must happen OUTSIDE the try/catch block
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
      return { error: 'Email is required' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: 'Check your email for the password reset link.' }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password) {
      return { error: 'Password is required' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return { error: error.message }
    }

    return redirect('/login?message=Password updated successfully')
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') throw err
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

/**
 * Robustly fetches the active team ID for a user.
 * Bypasses RLS to ensure new users (invited) can find their team immediately.
 */
export async function getUserActiveTeam() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()

    // 1. Check memberships (most common for invited users)
    const { data: memberships } = await adminSupabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)

    if (memberships && memberships.length > 0) {
      return { teamId: memberships[0].team_id }
    }

    // 2. Check teams owned (for managers who just created a team)
    const { data: ownedTeams } = await adminSupabase
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)

    if (ownedTeams && ownedTeams.length > 0) {
      return { teamId: ownedTeams[0].id }
    }

    return { teamId: null }
  } catch (err: any) {
    console.error('Error in getUserActiveTeam:', err)
    return { error: err.message }
  }
}

export async function getMyReportsAction() {
  try {
    const { createClient, createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()
    
    // Fetch reports
    const { data: reports, error: reportsError } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reportsError) throw reportsError

    // Fetch profiles for these reports manually to avoid join errors
    const userIds = Array.from(new Set(reports.map(r => r.user_id)))
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.id] = p
      return acc
    }, {})
    
    const enrichedReports = reports.map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || null
    }))

    return { reports: enrichedReports }
  } catch (err: any) {
    console.error('Error in getMyReportsAction:', err)
    return { error: err.message }
  }
}

/**
 * Robustly fetches reports for a team, bypassing potentially broken RLS.
 */
export async function getTeamReportsAction(teamId: string) {
  try {
    const { createClient, createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify user belongs to the team (even with admin client, we check for security)
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

    // Fetch reports
    const { data: reports, error: reportsError } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('team_id', teamId)
      .gte('date', dateLimit)
      .order('created_at', { ascending: false })

    if (reportsError) throw reportsError

    // Fetch profiles for these reports manually
    const userIds = Array.from(new Set(reports.map(r => r.user_id)))
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.id] = p
      return acc
    }, {})
    
    const enrichedReports = reports.map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || null
    }))

    return { reports: enrichedReports }
  } catch (err: any) {
    console.error('Error in getTeamReportsAction:', err)
    return { error: err.message }
  }
}

/**
 * Acknowledges a report by adding the user's ID to the acknowledgments list in the content JSONB.
 */
export async function acknowledgeReportAction(reportId: string) {
  try {
    const { createClient, createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminSupabase = await createAdminClient()
    
    // Get current content
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
