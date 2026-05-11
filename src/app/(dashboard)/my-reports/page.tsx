'use client'

import { createClient } from '@/lib/supabase/client'
import { ReportList } from '@/components/reports/report-list'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { FileText, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMyReports() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: myReports } = await supabase.from('reports')
        .select('*, profiles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setReports(myReports || [])
      setLoading(false)
    }
    fetchMyReports()
  }, [])

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-[#020101] dark:text-white">My History</h1>
            <Badge className="bg-[#7C686C]/10 text-[#7C686C] border-none rounded-lg font-black text-[10px] px-2.5 py-1 uppercase tracking-widest">Personal Archive</Badge>
          </div>
          <p className="text-muted-foreground font-medium">Tracking your contribution and progress over time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-border/50 font-black text-xs uppercase tracking-widest gap-2 px-6">
            <Calendar className="w-4 h-4" /> Filter by Date
          </Button>
          <Button className="h-12 rounded-xl bg-[#020101] dark:bg-white dark:text-[#020101] font-black text-xs uppercase tracking-widest gap-2 px-6">
            <Download className="w-4 h-4" /> Export CSV
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
          <div className="space-y-6">
            {reports.length > 0 ? (
              <ReportList reports={reports} />
            ) : (
              <div className="py-40 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50">
                <div className="bg-[#7C686C]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-[#7C686C]">
                   <FileText className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">No reports yet</p>
                  <p className="text-muted-foreground font-medium">Your daily updates will appear here once you start submitting.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
