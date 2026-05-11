'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ReportForm } from '@/components/reports/report-form'
import { ReportList } from '@/components/reports/report-list'
import { TeamOverview } from '@/components/dashboard/team-overview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Calendar, 
  Zap, 
  BarChart3, 
  FileText, 
  Send,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const { data: membership } = await supabase.from('team_members').select('team_id, teams(name)').eq('user_id', user.id).maybeSingle()
      const today = new Date().toISOString().split('T')[0]
      const teamId = membership?.team_id
      
      const { data: teamReports } = await supabase.from('reports').select('*, profiles(*)').eq('team_id', teamId).eq('date', today)
      const { data: teamMembers } = await supabase.from('team_members').select('*, profiles(*)').eq('team_id', teamId)
      const { data: todayReport } = await supabase.from('reports').select('*').eq('user_id', user.id).eq('date', today).maybeSingle()

      setData({
        profile,
        membership,
        todayReport,
        teamReports,
        teamMembers,
        teamId,
        today
      })
    }
    fetchData()

    const handleOpenForm = () => setIsFormOpen(true)
    const handleCloseForm = () => setIsFormOpen(false)
    window.addEventListener('open-report-form', handleOpenForm)
    window.addEventListener('close-report-form', handleCloseForm)
    return () => {
      window.removeEventListener('open-report-form', handleOpenForm)
      window.removeEventListener('close-report-form', handleCloseForm)
    }
  }, [])

  if (!data) return null

  const { profile, membership, todayReport, teamReports, teamMembers, teamId, today } = data
  const teamName = (membership?.teams as any)?.name
  const reportedCount = teamReports?.length || 0
  const totalCount = teamMembers?.length || 0
  const participationRate = totalCount > 0 ? Math.round((reportedCount / totalCount) * 100) : 0
  const blockerCount = teamReports?.reduce((acc: number, report: any) => acc + (report.content.blockers?.length || 0), 0) || 0
  
  const reportedUserIds = new Set(teamReports?.map((r: any) => r.user_id) || [])
  const missingMembers = teamMembers?.filter((m: any) => !reportedUserIds.has(m.user_id)) || []
  const reportsWithBlockers = teamReports?.filter((r: any) => (r.content.blockers?.length || 0) > 0) || []

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#020101] dark:text-white">Team Overview</h1>
          <p className="text-muted-foreground font-medium mt-1">Monitoring collaboration and blocker resolution for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm">
            <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Engineering Department</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 rotate-90" />
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm">
            <Calendar className="w-4 h-4 text-[#F6823A]" />
            <span className="text-sm font-black text-[#020101] dark:text-white">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card border-none rounded-[2.5rem] shadow-xl overflow-hidden relative group">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Participation Rate</p>
              <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black tracking-tighter text-[#020101] dark:text-white">{participationRate}%</span>
              <span className="text-sm font-black text-emerald-500 mb-2">+2.4% vs last week</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${participationRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[2.5rem] shadow-xl overflow-hidden relative group">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Total Reports</p>
              <div className="bg-[#F6823A]/10 p-2.5 rounded-xl">
                <FileText className="w-5 h-5 text-[#F6823A]" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-6xl font-black tracking-tighter text-[#020101] dark:text-white">{reportedCount}/{totalCount}</span>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{totalCount - reportedCount} submissions remaining for the daily cycle.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[2.5rem] shadow-xl overflow-hidden relative group">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Active Blockers</p>
              <div className="bg-rose-500/10 p-2.5 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="flex items-end gap-6">
              <span className="text-6xl font-black tracking-tighter text-[#020101] dark:text-white">{blockerCount.toString().padStart(2, '0')}</span>
              <div className="flex gap-2 mb-2">
                <Badge className="bg-rose-500/10 text-rose-500 border-none rounded-lg font-black text-[10px] uppercase px-2.5 py-1">Critical</Badge>
                <Badge className="bg-amber-500/10 text-amber-500 border-none rounded-lg font-black text-[10px] uppercase px-2.5 py-1">Resolving</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Missing Reports */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <h3 className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">Missing Reports</h3>
               <Badge className="bg-secondary text-muted-foreground border-none rounded-lg font-black text-[10px] px-2.5 py-1">{missingMembers.length} People</Badge>
            </div>
            <Button variant="ghost" asChild className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
              <Link href="/reports">View All History</Link>
            </Button>
          </div>
          <Card className="border-none bg-white dark:bg-[#020101] rounded-[2.5rem] shadow-lg overflow-hidden">
            <div className="divide-y divide-border/40">
              {missingMembers.length > 0 ? missingMembers.map((member: any) => (
                <div key={member.user_id} className="p-6 flex items-center justify-between group hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-2xl">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback className="rounded-2xl font-black bg-secondary">{member.profiles?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-black text-[#020101] dark:text-white">{member.profiles?.full_name}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last active: 4h ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-secondary/30 hover:bg-[#F6823A] hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              )) : (
                <div className="p-20 text-center space-y-4">
                  <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-muted-foreground font-bold">Everyone has checked in!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Blockers at a Glance */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">Blockers at a Glance</h3>
            <Button variant="ghost" asChild className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
              <Link href="/reports">View All History</Link>
            </Button>
          </div>
          <div className="space-y-6">
            {reportsWithBlockers.length > 0 ? reportsWithBlockers.map((report: any) => (
              <Card key={report.id} className="border-l-4 border-l-rose-500 border-y-0 border-r-0 bg-white dark:bg-[#020101] rounded-[2rem] shadow-lg overflow-hidden group">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl">
                        <AvatarImage src={report.profiles?.avatar_url} />
                        <AvatarFallback className="rounded-xl font-black bg-secondary">{report.profiles?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-black text-[#020101] dark:text-white">{report.profiles?.full_name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Engineering Team</p>
                      </div>
                    </div>
                    <Badge className="bg-rose-500/10 text-rose-500 border-none rounded-lg font-black text-[10px] px-2.5 py-1">Critical</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black tracking-tight text-[#020101] dark:text-white">{report.content.blockers[0]}</h4>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      This blocker is affecting the critical path. Please acknowledge or resolve to unblock the team.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border border-border/50">Acknowledge</Button>
                    <Button className="flex-1 h-12 rounded-xl bg-[#020101] dark:bg-white dark:text-[#020101] text-white font-black text-[10px] uppercase tracking-widest">Resolve Blocker</Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="bg-emerald-500/5 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-4" />
                <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl tracking-tight">Zero active blockers</p>
                <p className="text-emerald-600/60 dark:text-emerald-400/60 font-medium text-sm mt-1">The team is moving at full speed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">Daily Activity Timeline</h3>
        </div>
        <Card className="border-none bg-white dark:bg-[#020101] rounded-[3rem] shadow-lg p-10">
           <ReportList reports={teamReports || []} />
        </Card>
      </div>

      {/* Floating Form Toggle (from design) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020101]/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <ReportForm teamId={teamId} />
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed top-10 right-10 h-14 w-14 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setIsFormOpen(false)}
            >
              <Plus className="w-8 h-8 rotate-45" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
