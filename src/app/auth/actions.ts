'use server'

import { createClient } from '@/lib/supabase/server'
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

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error('Supabase Auth Error:', error.message)
      return { error: error.message }
    }

    // If we have a teamId and the user was created successfully
    if (data.user && teamId) {
      const { error: teamError } = await supabase.from('team_members').insert({
        team_id: teamId,
        user_id: data.user.id,
        role: 'member'
      })
      if (teamError) {
        console.error('Team Member Insert Error:', teamError.message)
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
