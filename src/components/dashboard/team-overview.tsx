'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TeamOverviewProps {
  teamId?: string
}

export function TeamOverview({ teamId }: TeamOverviewProps) {
  const [data, setData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!teamId) return
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]
      const { data: members } = await supabase.from('team_members').select('user_id, profiles(*)').eq('team_id', teamId)
      const { data: reports } = await supabase.from('reports').select('user_id').eq('team_id', teamId).eq('date', today)
      setData({ members, reports })
    }
    fetchData()
  }, [teamId])

  if (!teamId || !data) return null

  const { members, reports } = data
  const reportedUserIds = new Set(reports?.map((r: any) => r.user_id) || [])

  return (
    <Card className="glass-card border-none overflow-hidden rounded-[3rem] shadow-xl">
      <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">Pulse</CardTitle>
        <Badge className="rounded-[1rem] bg-[#F6823A]/10 text-[#F6823A] border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
          {reportedUserIds.size}/{members?.length || 0} Ready
        </Badge>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-10">
        <div className="space-y-6">
          {members?.map((member: any) => {
            const hasReported = reportedUserIds.has(member.user_id)
            return (
              <div key={member.user_id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 rounded-2xl shadow-xl border-2 border-background transition-transform group-hover:scale-105">
                      <AvatarImage src={(member.profiles as any)?.avatar_url} />
                      <AvatarFallback className="rounded-2xl bg-secondary text-muted-foreground font-black text-lg">
                        {(member.profiles as any)?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${hasReported ? 'bg-[#F6823A] shadow-[0_0_12px_rgba(246,130,58,0.5)]' : 'bg-muted-foreground/30'}`} />
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight text-[#020101] dark:text-white">{(member.profiles as any)?.full_name}</p>
                    <p className={`text-[10px] uppercase tracking-widest font-black ${hasReported ? 'text-[#F6823A]/80' : 'text-muted-foreground/60'}`}>
                      {hasReported ? 'Done for today' : 'Still grinding'}
                    </p>
                  </div>
                </div>
                {!hasReported && (
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-secondary/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#F6823A] hover:text-white">
                    <Bell className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-8 border-t border-border/50 space-y-4">
          <Button variant="outline" className="w-full h-16 rounded-2xl border-border/50 font-black text-xs uppercase tracking-widest hover:bg-[#F6823A]/5 hover:border-[#F6823A]/30 transition-all group">
            Team Analytics <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="ghost" className="w-full h-12 rounded-2xl text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-[#7C686C] transition-colors">
            Manage Squad
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
