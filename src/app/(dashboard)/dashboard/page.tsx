'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BarChart3, 
  FileText, 
  Send,
  ChevronRight,
  Target,
  ShieldAlert,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRealtimeReports } from '@/lib/supabase/hooks'

export default function DashboardPage() {
  const [context, setContext] = useState<any>(null)
  const supabase = createClient()

  const teamId = context?.teamId
  const { reports: teamReports, loading } = useRealtimeReports(teamId || null)

  useEffect(() => {
    async function fetchContext() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { getUserActiveTeam } = await import('@/lib/actions/teams')
      const teamResult = await getUserActiveTeam()
      const tId = teamResult.teamId

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      
      let membership = null
      if (tId) {
        const { data: mData } = await supabase
          .from('team_members')
          .select('team_id, teams(*)')
          .eq('user_id', user.id)
          .eq('team_id', tId)
          .maybeSingle()
        membership = mData
      }
      
      const { data: teamMembers } = tId 
        ? await supabase.from('team_members').select('*, profiles(*)').eq('team_id', tId)
        : { data: [] }

      setContext({
        profile,
        membership,
        teamMembers: teamMembers || [],
        teamId: tId,
      })
    }
    fetchContext()
  }, [supabase])

  if (!context || loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Zap className="w-12 h-12 text-primary animate-pulse" />
    </div>
  )

  const { teamMembers, profile } = context
  const reportedCount = teamReports?.length || 0
  const totalCount = teamMembers?.length || 0
  const participationRate = totalCount > 0 ? Math.round((reportedCount / totalCount) * 100) : 0
  const blockerCount = teamReports?.reduce((acc: number, report: any) => acc + (report.content.blockers?.length || 0), 0) || 0
  
  const reportedUserIds = new Set(teamReports?.map((r: any) => r.user_id) || [])
  const missingMembers = teamMembers?.filter((m: any) => !reportedUserIds.has(m.user_id)) || []
  const reportsWithBlockers = teamReports?.filter((r: any) => (r.content.blockers?.length || 0) > 0) || []

  return (
    <div className="flex flex-col flex-1 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/10 pb-8 md:pb-10">
        <div>
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary">Live Team Updates</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">Workspace</h1>
          <p className="text-muted-foreground/60 font-medium mt-1 md:mt-2 max-w-xl text-sm md:text-base leading-relaxed">Real-time monitoring of team updates, progress, and blockers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary/40 backdrop-blur-md border border-border/10 rounded-[1.25rem] px-5 py-3 flex items-center gap-3 group hover:border-primary/20 transition-colors">
            <Target className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-foreground uppercase tracking-widest">All Teams</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
          </div>
          <div className="bg-primary/5 backdrop-blur-md border border-primary/20 rounded-[1.25rem] px-5 py-3 flex items-center gap-3 shadow-sm group hover:bg-primary/10 transition-all">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="glass-card border-none rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative group tactical-glow">
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 className="w-16 h-16 md:w-24 md:h-24 text-primary" />
          </div>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8 relative">
            <div className="flex items-center justify-between">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">Participation Rate</span>
              <Badge className="bg-primary/10 text-primary border-none rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-1">Good</Badge>
            </div>
            <div>
              <div className="flex items-end gap-2 md:gap-3 mb-2">
                <span className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">{participationRate}%</span>
                <span className="text-[10px] font-black text-primary mb-1 md:mb-2 tracking-widest">+2.4% WOW</span>
              </div>
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(76,215,246,0.5)]" style={{ width: `${participationRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-16 h-16 md:w-24 md:h-24 text-primary" />
          </div>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8 relative">
            <div className="flex items-center justify-between">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Daily Standups</span>
              <FileText className="w-5 h-5 text-primary/40" />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">{reportedCount}</span>
                <span className="text-xl md:text-2xl font-black text-muted-foreground/40 tracking-tighter">/ {totalCount}</span>
              </div>
              <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">{totalCount - reportedCount} missing updates.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative group border-t-2 border-t-destructive/20 md:col-span-2 xl:col-span-1">
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-16 h-16 md:w-24 md:h-24 text-destructive" />
          </div>
          <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8 relative">
            <div className="flex items-center justify-between">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-destructive">Active Blockers</span>
              <AlertCircle className="w-5 h-5 text-destructive/40" />
            </div>
            <div className="flex items-end gap-4 md:gap-6">
              <span className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">{blockerCount.toString().padStart(2, '0')}</span>
              <div className="flex flex-col gap-1 md:gap-1.5 mb-1 md:mb-2">
                <Badge className="bg-destructive/10 text-destructive border-none rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-0.5 md:py-1">Needs Attention</Badge>
                <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-destructive animate-ping" /> Alert Active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
        {/* Missing Reports */}
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3 md:gap-4">
               <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Missing Updates</h3>
               <div className="bg-secondary/40 px-2.5 py-1 rounded-lg border border-border/10">
                 <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{missingMembers.length} Pending</span>
               </div>
            </div>
            <Button variant="ghost" asChild className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-all group px-0 sm:px-4">
              <Link href="/reports" className="flex items-center gap-2">
                Archive <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <Card className="border-none bg-card/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl overflow-hidden blueprint-bg">
            <div className="divide-y divide-border/10">
              {missingMembers.length > 0 ? missingMembers.map((member: any) => (
                <div key={member.user_id} className="p-6 md:p-8 flex items-center justify-between group hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative">
                      <Avatar className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl ring-2 ring-border/10 transition-all group-hover:ring-primary/20">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="rounded-xl md:rounded-2xl font-black bg-secondary/80 text-muted-foreground">{member.profiles?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-background rounded-lg border border-border flex items-center justify-center">
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-muted-foreground/40" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-black text-foreground tracking-tight">{member.profiles?.full_name}</p>
                      <p className="text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-0.5 md:mt-1">Status: Pending Update</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(76,215,246,0.3)]"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              )) : (
                <div className="p-24 text-center space-y-6">
                  <div className="bg-primary/10 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(76,215,246,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-black text-xl tracking-tight uppercase">All Good</p>
                    <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest">All team members have submitted their updates today.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Blockers at a Glance */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">Critical Blockers</h3>
            <Button variant="ghost" asChild className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-all group">
              <Link href="/reports" className="flex items-center gap-2">
                History <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="space-y-6">
            {reportsWithBlockers.length > 0 ? reportsWithBlockers.map((report: any) => (
              <Card key={report.id} className="border-l-4 border-l-destructive border-y-0 border-r-0 bg-card/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden group hover:bg-card/80 transition-all">
                <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl ring-1 ring-border/10">
                        <AvatarImage src={report.profiles?.avatar_url} />
                        <AvatarFallback className="rounded-lg md:rounded-xl font-black bg-secondary text-primary">{report.profiles?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs md:text-sm font-black text-foreground tracking-tight">{report.profiles?.full_name}</p>
                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Team Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-destructive animate-pulse" />
                      <Badge className="bg-destructive/10 text-destructive border-none rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-0.5 md:px-2.5">Blocked</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h4 className="text-lg md:text-xl font-black tracking-tighter text-foreground leading-tight uppercase">{report.content.blockers[0]}</h4>
                    <p className="text-[10px] md:text-xs font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-wide">
                      A team member is blocked. Help them resolve the issue to maintain progress.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                    <Button variant="secondary" className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] bg-background hover:bg-secondary/60 border border-border/10 transition-all">Acknowledge</Button>
                    <Button className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-foreground text-background hover:opacity-90 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl">Resolve</Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="bg-primary/5 rounded-[3rem] p-24 text-center border border-dashed border-primary/20 blueprint-bg">
                <Target className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                <p className="text-primary font-black text-2xl tracking-tighter uppercase mb-2">No Active Blockers</p>
                <p className="text-muted-foreground/40 font-bold text-xs uppercase tracking-[0.3em]">No team members are currently blocked.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black tracking-tight text-foreground">Recent Updates</h3>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/40 rounded-full border border-border/10">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Live Feed</span>
           </div>
        </div>
        <Card className="border-none bg-card/30 backdrop-blur-md rounded-[3rem] shadow-2xl p-12 blueprint-bg">
           <ReportList reports={teamReports || []} />
        </Card>
      </div>
    </div>
  )
}
