'use client'

import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { FileText, Calendar, Download, Activity, Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportForm } from '@/components/reports/report-form'

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [teamId, setTeamId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchMyReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
      
      let userTeamId = memberships?.[0]?.team_id || ''

      if (!userTeamId) {
        const { data: ownedTeam } = await supabase.from('teams').select('id').eq('owner_id', user.id).maybeSingle()
        userTeamId = ownedTeam?.id || ''
      }

      setTeamId(userTeamId)

      const { data: myReports } = await supabase.from('reports')
        .select('*, profiles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setReports(myReports || [])
      setLoading(false)
    }
    fetchMyReports()

    const handleOpenForm = () => setIsFormOpen(true)
    const handleCloseForm = () => setIsFormOpen(false)
    window.addEventListener('open-report-form', handleOpenForm)
    window.addEventListener('close-report-form', handleCloseForm)

    return () => {
      window.removeEventListener('open-report-form', handleOpenForm)
      window.removeEventListener('close-report-form', handleCloseForm)
    }
  }, [supabase])

  return (
    <div className="flex flex-col flex-1 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-border/10 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Personal Reports</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase font-heading">My Reports</h1>
          <p className="text-muted-foreground/60 font-medium text-lg max-w-xl">Centralized repository of your personal updates and metrics.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="h-14 rounded-2xl border-border/10 bg-secondary/20 font-black text-[10px] uppercase tracking-[0.3em] gap-3 px-8 hover:bg-primary/10 hover:text-primary transition-all shadow-xl">
            <Calendar className="w-4 h-4" /> Date Filter
          </Button>
          <Button className="h-14 rounded-2xl bg-foreground text-background hover:opacity-90 font-black text-[10px] uppercase tracking-[0.3em] gap-3 px-8 shadow-2xl transition-all">
            <Download className="w-4 h-4" /> Export (CSV)
          </Button>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="space-y-12 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-primary/5 rounded-[3rem] border border-primary/10 blueprint-bg flex items-center justify-center">
                <Activity className="w-12 h-12 text-primary/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {reports.length > 0 ? (
              <ReportList reports={reports} />
            ) : (
              <div className="py-40 text-center space-y-8 bg-card/40 backdrop-blur-xl rounded-[4rem] border border-dashed border-primary/20 blueprint-bg">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <FileText className="w-12 h-12 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">No Reports Yet</h2>
                  <p className="text-muted-foreground/40 font-bold text-xs uppercase tracking-[0.4em]">Submit your first daily update to see it here.</p>
                </div>
                <Button 
                  className="bg-primary text-primary-foreground h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-report-form'))}
                >
                  Post Update
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Form Toggle */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-card/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-border/50">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">Submit Update</h2>
                  <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mt-1">Daily Standup</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-[1.5rem] bg-secondary/40 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all hover:rotate-90"
                  onClick={() => setIsFormOpen(false)}
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </Button>
              </div>
              <ReportForm teamId={teamId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
