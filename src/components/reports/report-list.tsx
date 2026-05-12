'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Target, ShieldCheck, ShieldAlert, Shield, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportListProps {
  reports: any[]
}

export function ReportList({ reports }: ReportListProps) {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-32 text-center border border-dashed border-primary/20 rounded-[3rem] bg-primary/5 flex flex-col items-center gap-8 blueprint-bg">
        <div className="p-5 bg-primary/10 rounded-[1.5rem] shadow-[0_0_20px_rgba(76,215,246,0.2)]">
          <Target className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-3">
          <span className="font-black text-3xl tracking-tighter text-foreground uppercase block">No Updates Found</span>
          <span className="font-bold text-xs uppercase tracking-[0.4em] opacity-40">No daily updates have been posted yet.</span>
        </div>
      </div>
    )
  }

  const moodConfig: Record<string, any> = {
    'on-track': { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'ON TRACK' },
    'stuck': { icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'STUCK' },
    'blocked': { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'BLOCKED' },
  }

  return (
    <div className="space-y-12">
      {reports.map((report) => {
        const mood = moodConfig[report.content.mood] || moodConfig['on-track']
        const hasBlockers = report.content.blockers?.length > 0 && report.content.blockers[0] !== 'None'

        return (
          <Card key={report.id} className="border-none bg-card/60 backdrop-blur-xl overflow-hidden group transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-border/10 hover:border-primary/20">
            <CardContent className="p-6 md:p-12 space-y-8 md:space-y-12 relative">
              {/* Tactical Blueprint Corner Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="absolute top-8 right-8 w-px h-8 bg-primary" />
                <div className="absolute top-8 right-8 h-px w-8 bg-primary" />
              </div>

              {/* Header: User & Mood */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative">
                    <Avatar className="h-14 w-14 md:h-20 md:w-20 rounded-xl md:rounded-[1.75rem] shadow-2xl ring-4 ring-background transition-transform group-hover:scale-105">
                      <AvatarImage src={(report.profiles as any)?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-xl md:text-2xl">
                        {(report.profiles as any)?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-card rounded-lg md:rounded-xl border border-border flex items-center justify-center shadow-lg">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-3xl font-black tracking-tighter text-foreground font-heading uppercase">{(report.profiles as any)?.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 md:mt-2">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-border/20" />
                      <Badge variant="outline" className="hidden sm:inline-flex text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border-border/10 px-3 py-1 rounded-full bg-secondary/30">MEMBER</Badge>
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-center self-start md:self-auto gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border transition-all shadow-sm", mood.bg, mood.border)}>
                  <mood.icon className={cn("w-4 h-4 md:w-5 md:h-5", mood.color)} />
                  <span className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em]", mood.color)}>{mood.label}</span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 md:gap-16 border-y border-border/10 py-8 md:py-12 relative blueprint-bg">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">Accomplished</span>
                  </div>
                  <div className="text-sm md:text-base font-bold text-foreground/70 leading-relaxed pl-10 md:pl-12 relative">
                    <div className="absolute left-3 md:left-4 top-2 bottom-2 w-px bg-emerald-500/10" />
                    {Array.isArray(report.content.completed) ? (
                      <ul className="space-y-4">
                        {report.content.completed.map((item: string, i: number) => (
                          <li key={i} className="flex gap-4 group/item">
                            <span className="text-emerald-500/30 font-black transition-transform group-hover/item:translate-x-1">»</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap">{report.content.completed}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Planned</span>
                  </div>
                  <div className="text-base font-bold text-foreground/70 leading-relaxed pl-12 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-primary/10" />
                    {Array.isArray(report.content.planned) ? (
                      <ul className="space-y-4">
                        {report.content.planned.map((item: string, i: number) => (
                          <li key={i} className="flex gap-4 group/item">
                            <span className="text-primary/30 font-black transition-transform group-hover/item:translate-x-1">»</span> {item}
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
                <div className="bg-destructive/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-destructive/20 relative overflow-hidden group/blocker">
                  <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-destructive/40" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 relative">
                    <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black text-destructive uppercase tracking-[0.3em] md:tracking-[0.4em]">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 animate-pulse" /> 
                      Blockers / Issues
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground border-none rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 self-start sm:self-auto">Action Required</Badge>
                  </div>
                  <div className="text-base md:text-lg font-black text-destructive/80 leading-relaxed relative pl-2 md:pl-4">
                    {Array.isArray(report.content.blockers) ? (
                       <ul className="space-y-4">
                        {report.content.blockers.map((item: string, i: number) => (
                          <li key={i} className="bg-destructive/5 px-8 py-5 rounded-2xl border border-destructive/10 hover:bg-destructive/10 transition-colors">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-destructive/5 px-8 py-5 rounded-2xl border border-destructive/10 hover:bg-destructive/10 transition-colors">
                        {report.content.blockers}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions / Interactions */}
              <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex -space-x-3 md:-space-x-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border-2 border-background bg-secondary flex items-center justify-center text-[8px] md:text-[10px] font-black group-hover:translate-y-[-2px] transition-transform shadow-lg" style={{ transitionDelay: `${i * 100}ms` }}>
                        +
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] md:tracking-[0.3em]">Team Feedback: 8 Reactions</p>
                </div>
                <Button variant="ghost" size="sm" className="h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] gap-2 md:gap-3 bg-secondary/40 border border-border/10 hover:bg-primary/10 hover:text-primary transition-all">
                  Acknowledge Update <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
