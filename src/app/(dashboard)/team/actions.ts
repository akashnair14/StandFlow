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
