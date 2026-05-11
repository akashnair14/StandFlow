import { useEffect, useState } from 'react'
import { createClient } from './client'
import { Report } from '@/types'

export function useRealtimeReports(teamId: string | null) {
  const [reports, setReports] = useState<Report[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!teamId) return

    // Initial fetch
    const fetchInitial = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('reports')
        .select('*, profiles(*)')
        .eq('team_id', teamId)
        .eq('date', today)
      
      if (data) setReports(data as any)
    }

    fetchInitial()

    // Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          // Fetch the full report with profile for the UI
          const { data } = await supabase
            .from('reports')
            .select('*, profiles(*)')
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            setReports((prev) => [data as any, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  return reports
}
