'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
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
