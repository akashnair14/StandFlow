'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, ChevronRight, Activity, Target, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

import { useRealtimeReports } from '@/lib/supabase/hooks'

interface TeamOverviewProps {
  teamId?: string
}

export function TeamOverview({ teamId }: TeamOverviewProps) {
  const [members, setMembers] = useState<any[]>([])
  const { reports, loading } = useRealtimeReports(teamId || null)
  const supabase = createClient()

  useEffect(() => {
    if (!teamId) return
    async function fetchMembers() {
      const { data } = await supabase.from('team_members').select('user_id, profiles(*)').eq('team_id', teamId)
      setMembers(data || [])
    }
    fetchMembers()
  }, [teamId, supabase])

  if (!teamId || !members) return null

  const reportedUserIds = new Set(reports?.map((r: any) => r.user_id) || [])

  return (
    <Card className="glass-card border-none overflow-hidden rounded-[2.5rem] shadow-2xl relative group tactical-glow">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity className="w-16 h-16 text-primary" />
      </div>
      <CardHeader className="p-10 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Team Activity</span>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-black tracking-tighter text-foreground uppercase">Team Overview</CardTitle>
          <Badge className="rounded-[0.75rem] bg-primary/10 text-primary border border-primary/20 px-4 py-2 font-black text-[10px] uppercase tracking-widest shadow-lg">
            {reportedUserIds.size}/{members?.length || 0} SUBMITTED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-12 relative">
        <div className="space-y-8">
          {members?.map((member: any) => {
            const hasReported = reportedUserIds.has(member.user_id)
            return (
              <div key={member.user_id} className="flex items-center justify-between group/member">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-16 w-16 rounded-2xl shadow-xl border-2 border-background transition-all group-hover/member:scale-110 group-hover/member:rotate-3">
                      <AvatarImage src={member.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="rounded-2xl bg-secondary text-muted-foreground font-black text-lg">
                        {member.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -top-1.5 -right-1.5 w-6 h-6 rounded-xl border-4 border-background flex items-center justify-center transition-all",
                      hasReported ? 'bg-primary shadow-[0_0_15px_rgba(76,215,246,0.6)] scale-110' : 'bg-muted-foreground/20'
                    )}>
                      {hasReported && <ShieldCheck className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tighter text-foreground">{member.profiles?.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={cn(
                        "text-[9px] uppercase tracking-[0.2em] font-black",
                        hasReported ? 'text-primary/80' : 'text-muted-foreground/40'
                      )}>
                        {hasReported ? 'ONLINE' : 'PENDING'}
                      </p>
                      {hasReported && <div className="w-1 h-1 rounded-full bg-primary/40" />}
                    </div>
                  </div>
                </div>
                {!hasReported && (
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-primary/5 text-primary opacity-0 group-hover/member:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(76,215,246,0.2)]">
                    <Bell className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-10 border-t border-border/10 space-y-4">
          <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-primary/10 bg-primary/5 font-black text-[10px] uppercase tracking-[0.3em] text-primary hover:bg-primary/10 hover:border-primary/30 transition-all group shadow-xl">
            TEAM ANALYTICS <Target className="w-4 h-4 ml-3 group-hover:scale-125 transition-transform" />
          </Button>
          <Button variant="ghost" className="w-full h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-foreground transition-all">
            Team Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
