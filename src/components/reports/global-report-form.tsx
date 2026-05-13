'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportForm } from '@/components/reports/report-form'
import { createClient } from '@/lib/supabase/client'

export function GlobalReportForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [teamId, setTeamId] = useState<string>('')
  const supabase = createClient()

  const fetchTeamId = async () => {
    try {
      const { getUserActiveTeam } = await import('@/app/auth/actions')
      const result = await getUserActiveTeam()
      
      if (result.teamId) {
        setTeamId(result.teamId)
        return result.teamId
      }
      return ''
    } catch (err) {
      console.error('Error fetching teamId:', err)
      return ''
    }
  }

  useEffect(() => {
    fetchTeamId()

    const handleOpen = async () => {
      await fetchTeamId()
      setIsOpen(true)
    }
    const handleClose = () => setIsOpen(false)

    window.addEventListener('open-report-form', handleOpen)
    window.addEventListener('close-report-form', handleClose)

    return () => {
      window.removeEventListener('open-report-form', handleOpen)
      window.removeEventListener('close-report-form', handleClose)
    }
  }, [supabase])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-card/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-border/50 relative">
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
              onClick={() => setIsOpen(false)}
            >
              <Plus className="w-8 h-8 rotate-45" />
            </Button>
          </div>
          <ReportForm teamId={teamId} />
        </div>
      </div>
    </div>
  )
}
