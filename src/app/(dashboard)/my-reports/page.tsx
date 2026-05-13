'use client'

import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { useEffect, useState } from 'react'
import { FileText, Calendar, Download, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchMyReports() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { getUserActiveTeam, getMyReportsAction } = await import('@/app/auth/actions')
        const teamResult = await getUserActiveTeam()
        setTeamId(teamResult.teamId || '')

        const reportsResult = await getMyReportsAction()
        if (reportsResult.reports) {
          setReports(reportsResult.reports)
        }
      } catch (err) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyReports()

    // Add realtime listener for own reports
    const channel = supabase
      .channel('my-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          if (payload.eventType === 'INSERT' && payload.new.user_id === user.id) {
            const { data } = await supabase
              .from('reports')
              .select('*, profiles(*)')
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              setReports((prev) => [data as any, ...prev])
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="flex flex-col flex-1 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Personal Reports</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase font-heading">My Reports</h1>
          <p className="text-muted-foreground/50 font-medium text-sm max-w-xl">Archive of your daily progress and metrics.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-11 rounded-xl border-border/5 bg-secondary/10 font-black text-[9px] uppercase tracking-[0.2em] gap-2.5 px-6 hover:bg-primary/10 hover:text-primary transition-all">
            <Calendar className="w-3.5 h-3.5" /> Filter
          </Button>
          <Button className="h-11 rounded-xl bg-foreground text-background hover:opacity-90 font-black text-[9px] uppercase tracking-[0.2em] gap-2.5 px-6 transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-primary/5 rounded-[2rem] border border-primary/10 blueprint-bg flex items-center justify-center">
                <Activity className="w-10 h-10 text-primary/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {reports.length > 0 ? (
              <ReportList reports={reports} />
            ) : (
              <div className="py-32 text-center space-y-6 bg-card/20 backdrop-blur-xl rounded-[3rem] border border-dashed border-primary/10 blueprint-bg">
                <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl">
                  <FileText className="w-8 h-8 text-primary/30" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase">No Reports Yet</h2>
                  <p className="text-muted-foreground/30 font-bold text-[9px] uppercase tracking-[0.3em]">Submit your first daily update to see it here.</p>
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
    </div>
  )
}
