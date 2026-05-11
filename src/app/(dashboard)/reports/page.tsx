'use client'

import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Rss, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: membership } = await supabase.from('team_members').select('team_id').eq('user_id', user.id).single()
      if (!membership) return

      const { data: teamReports } = await supabase.from('reports')
        .select('*, profiles(*)')
        .eq('team_id', membership.team_id)
        .order('created_at', { ascending: false })

      setReports(teamReports || [])
      setLoading(false)
    }
    fetchReports()
  }, [])

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-[#020101] dark:text-white">Daily Stream</h1>
            <Badge className="bg-[#F6823A]/10 text-[#F6823A] border-none rounded-lg font-black text-[10px] px-2.5 py-1 uppercase tracking-widest">Live Feed</Badge>
          </div>
          <p className="text-muted-foreground font-medium">Real-time updates from your team's focused work sessions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search updates..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-border/50 font-medium"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-xl border-border/50 p-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-secondary/20 rounded-[3rem]" />
            ))}
          </div>
        ) : (
          <ReportList reports={reports} />
        )}
      </div>
    </div>
  )
}
