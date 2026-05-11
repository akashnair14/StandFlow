import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNav } from '@/components/dashboard/top-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background Orbs for Dashboard */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F6823A] rounded-full filter blur-[150px] opacity-[0.03] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7C686C] rounded-full filter blur-[150px] opacity-[0.03] -z-10" />
      
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}
