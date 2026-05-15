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
      
      const teamId = user.user_metadata?.team_id
      const role = user.user_metadata?.role || 'team_member'

      if (teamId) {
        const { data: existing } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (!existing) {
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
      return { error: 'Network Connection Timeout: Unable to reach the server.' }
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
    const initialRole = role || (teamId ? 'team_member' : 'manager')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: initialRole,
          team_id: teamId,
        },
      },
    })

    if (error) {
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
      return { error: error.message }
    }

    if (data.user) {
      const adminSupabase = await createAdminClient()
      const finalTeamId = teamId || data.user.user_metadata?.team_id
      
      if (finalTeamId) {
        const { data: existingMember } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('team_id', finalTeamId)
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!existingMember) {
          await adminSupabase.from('team_members').insert({
            team_id: finalTeamId,
            user_id: data.user.id,
            role: data.user.user_metadata?.role || 'team_member'
          })
        }
      } else {
        const { data: existingAnyMember } = await adminSupabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!existingAnyMember) {
          const { data: newTeam } = await adminSupabase
            .from('teams')
            .insert({
              name: `${fullName.split(' ')[0]}'s Team`,
              owner_id: data.user.id
            })
            .select()
            .maybeSingle()

          if (newTeam) {
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
    return { error: err.message || 'An unexpected error occurred during signup.' }
  }

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
