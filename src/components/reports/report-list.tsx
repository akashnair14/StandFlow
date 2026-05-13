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

  const handleAcknowledge = async (reportId: string) => {
    try {
      const { acknowledgeReportAction } = await import('@/app/auth/actions')
      const result = await acknowledgeReportAction(reportId)
      
      if (result.success) {
        const { toast } = await import('sonner')
        toast.success(result.alreadyAcknowledged ? "Already acknowledged" : "Update acknowledged")
      }
    } catch (error) {
      console.error('Error acknowledging report:', error)
    }
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => {
        const mood = moodConfig[report.content.mood] || moodConfig['on-track']
        const hasBlockers = report.content.blockers?.length > 0 && report.content.blockers[0] !== 'None'
        const ackCount = report.content.acknowledgments?.length || 0

        return (
          <Card key={report.id} className="border-none bg-card/40 backdrop-blur-xl overflow-hidden group transition-all duration-500 rounded-[1.25rem] md:rounded-[2rem] shadow-xl border border-border/5 hover:border-primary/10">
            <CardContent className="p-4 md:p-7 space-y-5 md:space-y-7 relative">
              {/* Tactical Blueprint Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="absolute top-6 right-6 w-px h-6 bg-primary" />
                <div className="absolute top-6 right-6 h-px w-6 bg-primary" />
              </div>

              {/* Header: User & Mood */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl shadow-xl ring-2 ring-background transition-transform group-hover:scale-105">
                      <AvatarImage src={report.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-sm md:text-base">
                        {report.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-card rounded-md border border-border flex items-center justify-center shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black tracking-tighter text-foreground font-heading uppercase leading-none">{report.profiles?.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-border/10 px-2 py-0 h-4 rounded-full bg-secondary/30 scale-90 origin-left">MEMBER</Badge>
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-center self-start sm:self-auto gap-2.5 px-3.5 py-1.5 rounded-lg md:rounded-xl border transition-all shadow-sm", mood.bg, mood.border)}>
                  <mood.icon className={cn("w-3.5 h-3.5", mood.color)} />
                  <span className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]", mood.color)}>{mood.label}</span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid md:grid-cols-2 gap-5 md:gap-8 border-y border-border/5 py-5 md:py-7 relative blueprint-bg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Accomplished</span>
                  </div>
                  <div className="text-xs md:text-sm font-bold text-foreground/70 leading-relaxed pl-8 relative">
                    <div className="absolute left-3 top-1 bottom-1 w-px bg-emerald-500/10" />
                    {Array.isArray(report.content.completed) ? (
                      <ul className="space-y-2">
                        {report.content.completed.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2.5 group/item">
                            <span className="text-emerald-500/30 font-black transition-transform group-hover/item:translate-x-1">»</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap">{report.content.completed}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">Planned</span>
                  </div>
                  <div className="text-xs md:text-sm font-bold text-foreground/70 leading-relaxed pl-8 relative">
                    <div className="absolute left-3 top-1 bottom-1 w-px bg-primary/10" />
                    {Array.isArray(report.content.planned) ? (
                      <ul className="space-y-2">
                        {report.content.planned.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2.5 group/item">
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
                <div className="bg-destructive/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-destructive/10 relative overflow-hidden group/blocker">
                  <div className="absolute top-0 left-0 w-1 h-full bg-destructive/30" />
                  <div className="flex items-center justify-between gap-4 mb-3 relative">
                    <div className="flex items-center gap-2.5 text-[8px] md:text-[9px] font-black text-destructive uppercase tracking-[0.2em]">
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> 
                      Blockers / Issues
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground border-none rounded-md font-black text-[7px] uppercase tracking-wider px-2 py-0.5">Action Required</Badge>
                  </div>
                  <div className="text-sm font-bold text-destructive/80 leading-relaxed relative pl-2">
                    {Array.isArray(report.content.blockers) ? (
                       <ul className="space-y-2">
                        {report.content.blockers.map((item: string, i: number) => (
                          <li key={i} className="bg-destructive/5 px-4 py-2.5 rounded-xl border border-destructive/5 hover:bg-destructive/10 transition-colors">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-destructive/5 px-4 py-2.5 rounded-xl border border-destructive/5 hover:bg-destructive/10 transition-colors">
                        {report.content.blockers}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions / Interactions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-lg border border-background bg-secondary flex items-center justify-center text-[8px] font-black group-hover:translate-y-[-2px] transition-transform shadow-md" style={{ transitionDelay: `${i * 50}ms` }}>
                        +
                      </div>
                    ))}
                  </div>
                  <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{ackCount} Reactions</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-5 rounded-lg md:rounded-xl font-black text-[8px] uppercase tracking-[0.2em] gap-2 bg-secondary/20 border border-border/5 hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => handleAcknowledge(report.id)}
                >
                  Acknowledge <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
