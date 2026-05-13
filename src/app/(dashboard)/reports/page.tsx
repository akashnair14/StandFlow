'use client'

import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState, useMemo } from 'react'
import { Filter, Search, Target, Activity, Zap, Radio, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRealtimeReports } from '@/lib/supabase/hooks'

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [teamIds, setTeamIds] = useState<string[]>([])
  const supabase = createClient()

  const { reports, loading } = useRealtimeReports(teamIds.length > 0 ? teamIds : null)

  useEffect(() => {
    async function fetchContext() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(profileData)

      let { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
      
      let ids = memberships?.map(m => m.team_id) || []

      if (ids.length === 0) {
        const { data: ownedTeams } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', user.id)
        
        ids = ownedTeams?.map(t => t.id) || []
      }

      setTeamIds(ids)
    }

    fetchContext()
  }, [supabase])

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports
    const query = searchQuery.toLowerCase()
    return reports.filter(report => {
      const userName = report.profiles?.full_name?.toLowerCase() || ''
      const completed = Array.isArray(report.content?.completed) 
        ? report.content.completed.join(' ').toLowerCase() 
        : (report.content?.completed?.toLowerCase() || '')
      const planned = Array.isArray(report.content?.planned) 
        ? report.content.planned.join(' ').toLowerCase() 
        : (report.content?.planned?.toLowerCase() || '')
      
      return userName.includes(query) || completed.includes(query) || planned.includes(query)
    })
  }, [reports, searchQuery])

  return (
    <div className="flex flex-col flex-1 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-border/10 pb-6 relative overflow-hidden shrink-0">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Live Team Updates</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">Real-time Sync</span>
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase font-heading">Daily Standups</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-xl">{reports.length} UPDATES</Badge>
          </div>
          <p className="text-muted-foreground/60 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
            Real-time aggregation of daily updates across all teams.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto relative z-10">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute -inset-1 bg-primary/20 blur-[15px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors z-20" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Updates..." 
              className="relative z-10 pl-11 h-12 rounded-xl bg-card/60 backdrop-blur-xl border-border/50 font-bold focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm uppercase tracking-widest placeholder:text-muted-foreground/20 blueprint-bg"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-12 px-6 rounded-xl border-border/10 bg-secondary/20 hover:bg-primary/10 hover:text-primary transition-all shadow-xl font-black text-[10px] uppercase tracking-[0.3em] gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button className="flex-1 sm:flex-none h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-[0_0_30px_-5px_rgba(76,215,246,0.4)]">
              <Zap className="w-5 h-5 fill-current" />
            </Button>
          </div>
        </div>

        {/* Tactical Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      </div>

      {/* Main Feed Container */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col relative overflow-hidden">
        {loading ? (
          <div className="space-y-6 animate-pulse flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[200px] bg-primary/5 rounded-[2rem] border border-primary/10 blueprint-bg flex flex-col items-center justify-center gap-4">
                <Activity className="w-10 h-10 text-primary/5" />
                <div className="w-32 h-3 bg-primary/5 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ReportList reports={filteredReports} />
            <div className="pt-10 pb-10 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-secondary/30 rounded-2xl border border-border/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">End of Updates / All Teams Synced</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-dashed border-primary/20 blueprint-bg relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-primary/20 transition-transform group-hover:scale-110 duration-700">
                <Target className="w-10 h-10 text-primary/40" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase font-heading">
                  {profile?.role === 'manager' ? 'Awaiting Updates' : 'No Updates Yet'}
                </h2>
                <p className="text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                  {profile?.role === 'manager' 
                    ? 'Your team hasn\'t posted any daily updates today. Check back later.'
                    : 'No daily updates have been posted today. Be the first to share your status.'}
                </p>
                {profile?.role !== 'manager' && (
                  <Button 
                    className="bg-primary text-primary-foreground h-12 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_30px_-10px_rgba(76,215,246,0.5)] hover:scale-105 transition-all mt-6"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-report-form'))}
                  >
                    Post Update
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
