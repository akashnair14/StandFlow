import { useEffect, useState } from 'react'
import { createClient } from './client'
import { Report } from '@/types'

export function useRealtimeReports(teamId: string | string[] | null) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!teamId || (Array.isArray(teamId) && teamId.length === 0)) {
      setLoading(false)
      return
    }

    const teamIds = Array.isArray(teamId) ? teamId : [teamId]

    // Initial fetch
    const fetchInitial = async () => {
      try {
        const { getTeamReportsAction } = await import('@/app/auth/actions')
        // We handle the first teamId for now, or could expand to all
        const firstTeamId = teamIds[0]
        const result = await getTeamReportsAction(firstTeamId)
        
        if (result.reports) setReports(result.reports as any)
      } catch (error) {
        console.error('Error fetching initial reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitial()

    // Realtime subscription
    // Note: Supabase doesn't support 'in' filters for postgres_changes directly in the filter string easily for complex cases
    // But we can subscribe to all changes and filter on the client, or create multiple channels.
    // For simplicity and performance with small teams, we'll subscribe to all report changes for these teams.
    
    const channels = teamIds.map(id => {
      return supabase
        .channel(`reports-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reports',
            filter: `team_id=eq.${id}`,
          },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              const { data } = await supabase
                .from('reports')
                .select('*, profiles(*)')
                .eq('id', payload.new.id)
                .single()
              
              if (data) {
                setReports((prev) => [data as any, ...prev.filter(r => r.id !== data.id)])
              }
            } else if (payload.eventType === 'UPDATE') {
              const { data } = await supabase
                .from('reports')
                .select('*, profiles(*)')
                .eq('id', payload.new.id)
                .single()
              
              if (data) {
                setReports((prev) => prev.map(r => r.id === data.id ? (data as any) : r))
              }
            } else if (payload.eventType === 'DELETE') {
              setReports((prev) => prev.filter(r => r.id !== payload.old.id))
            }
          }
        )
        .subscribe()
    })

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [teamId, supabase])

  return { reports, loading }
}
