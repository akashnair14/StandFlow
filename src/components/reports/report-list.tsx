'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Zap, Smile, Meh, Frown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportListProps {
  reports: any[]
}

export function ReportList({ reports }: ReportListProps) {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-24 text-center border-2 border-dashed border-border/50 rounded-[3rem] bg-secondary/10 flex flex-col items-center gap-6">
        <div className="p-4 bg-[#F6823A]/10 rounded-2xl">
          <Zap className="w-10 h-10 text-[#F6823A]" />
        </div>
        <div className="space-y-1">
          <span className="font-black text-2xl tracking-tighter text-[#020101] dark:text-white block">Silence is golden?</span>
          <span className="font-bold text-base opacity-60">Be the first to break the silence with an update.</span>
        </div>
      </div>
    )
  }

  const moodConfig: Record<string, any> = {
    'on-track': { icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'On Track' },
    'stuck': { icon: Meh, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Feeling Stuck' },
    'blocked': { icon: Frown, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Blocked' },
  }

  return (
    <div className="space-y-10">
      {reports.map((report) => {
        const mood = moodConfig[report.content.mood] || moodConfig['on-track']
        const hasBlockers = report.content.blockers?.length > 0 && report.content.blockers[0] !== 'None'

        return (
          <Card key={report.id} className="border-none bg-white dark:bg-[#020101] overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 rounded-[3rem] shadow-xl border border-border/10">
            <CardContent className="p-10 space-y-10">
              {/* Header: User & Mood */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Avatar className="h-16 w-16 rounded-2xl shadow-lg ring-4 ring-background">
                    <AvatarImage src={(report.profiles as any)?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-black text-xl">
                      {(report.profiles as any)?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">{(report.profiles as any)?.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engineering</p>
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-colors", mood.bg, "border-transparent")}>
                  <mood.icon className={cn("w-5 h-5", mood.color)} />
                  <span className={cn("text-xs font-black uppercase tracking-widest", mood.color)}>{mood.label}</span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Accomplishments
                  </div>
                  <div className="text-base font-bold text-foreground/80 leading-relaxed space-y-4">
                    {Array.isArray(report.content.completed) ? (
                      <ul className="space-y-3">
                        {report.content.completed.map((item: string, i: number) => (
                          <li key={i} className="flex gap-4">
                            <span className="text-emerald-500/30 mt-1 font-black">/</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap">{report.content.completed}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Daily Focus
                  </div>
                  <div className="text-base font-bold text-foreground/80 leading-relaxed space-y-4">
                    {Array.isArray(report.content.planned) ? (
                      <ul className="space-y-3">
                        {report.content.planned.map((item: string, i: number) => (
                          <li key={i} className="flex gap-4">
                            <span className="text-amber-500/30 mt-1 font-black">/</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap">{report.content.planned}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Blockers Section */}
              {hasBlockers && (
                <div className="bg-rose-500/5 rounded-[2.5rem] p-8 border border-rose-500/10 shadow-sm-rose">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">
                      <AlertCircle className="w-4 h-4" /> 
                      Active Blockers
                    </div>
                    <Badge className="bg-rose-500 text-white border-none rounded-lg font-black text-[10px] uppercase px-2.5 py-1">Needs Action</Badge>
                  </div>
                  <div className="text-base font-black text-rose-500/80 leading-relaxed">
                    {Array.isArray(report.content.blockers) ? (
                       <ul className="space-y-2">
                        {report.content.blockers.map((item: string, i: number) => (
                          <li key={i} className="bg-rose-500/5 px-5 py-3 rounded-2xl border border-rose-500/10">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-rose-500/5 px-5 py-3 rounded-2xl border border-rose-500/10">
                        {report.content.blockers}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions / Interactions */}
              <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-black">
                        +
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">3 Reactions</p>
                </div>
                <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2">
                  Acknowledge <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
