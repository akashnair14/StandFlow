'use client'

import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState, useRef } from 'react'
import { Users, Mail, MessageSquare, MoreHorizontal, ShieldPlus, Loader2, Zap, Activity, LayoutGrid, GitGraph, Target, ShieldCheck, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InviteMemberModal } from '@/components/team/invite-member-modal'
import { createTeamAction } from '@/app/(dashboard)/team/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { getTeamDataBypass } from './bypass-actions'

const supabase = createClient()

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [role, setRole] = useState<'manager' | 'team_leader' | 'team_member' | null>(null)
  const [allTeams, setAllTeams] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'flow'>('grid')
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  async function fetchTeam(selectedTeamId?: string) {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      
      const userRole = profile?.role || user.user_metadata?.role || 'team_member'
      setRole(userRole as any)

      const result = await getTeamDataBypass(user.id, userRole, selectedTeamId)
      
      if (result.error) throw new Error(result.error)

      setAllTeams(result.teams || [])
      setMembers(result.members || [])
      setTeamName(result.currentTeam?.name || 'My Team')
      setNewTeamName(result.currentTeam?.name || 'My Team')

    } catch (error) {
      console.error('Critical Fetch Error:', error)
      toast.error('Failed to load team data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTeam() {
    setCreatingTeam(true)
    try {
      const result = await createTeamAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.teamId && result.data) {
        const memberData = result.data
        setTeamId(result.teamId)
        setMembers([memberData])
        setTeamName(memberData.teams?.name || 'My Team')
        setNewTeamName(memberData.teams?.name || 'My Team')
        toast.success('Team Created!')
      }
    } catch (error) {
      toast.error('Failed to create team')
    } finally {
      setCreatingTeam(false)
    }
  }

  async function handleUpdateName() {
    if (!teamId || !newTeamName.trim()) return
    try {
      const { error } = await supabase.from('teams').update({ name: newTeamName }).eq('id', teamId)
      if (error) throw error
      setTeamName(newTeamName)
      setIsEditingName(false)
      toast.success('Team Renamed!')
    } catch (error) {
      toast.error('Failed to update team name')
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])


  return (
    <div className="flex flex-col flex-1 space-y-10 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-b border-border/10 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Team Management</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-4 bg-card/60 backdrop-blur-xl p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-primary/20 blueprint-bg">
                  <input 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="bg-secondary/30 border-none rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-xl md:text-3xl font-black focus:ring-4 ring-primary/5 outline-none w-60 md:w-80 text-foreground uppercase tracking-tighter"
                    autoFocus
                  />
                  <Button onClick={handleUpdateName} className="bg-primary text-primary-foreground rounded-xl md:rounded-2xl h-10 md:h-14 px-4 md:px-8 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] shadow-xl">Secure</Button>
                  <Button variant="ghost" onClick={() => setIsEditingName(false)} className="text-muted-foreground/40 hover:text-foreground rounded-xl md:rounded-2xl h-10 md:h-14 px-4 md:px-8 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Abort</Button>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground uppercase font-heading leading-none">
                    {teamId ? teamName : 'Team Overview'}
                  </h1>
                  {teamId && role === 'manager' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsEditingName(true)}
                      className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/5 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all border border-primary/10"
                    >
                      <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>
                  )}
                </>
              )}
            </div>
            <p className="text-muted-foreground/60 font-medium text-base md:text-xl max-w-2xl leading-relaxed">
              {teamId ? 'Manage your team members and maintain real-time synchronization.' : 'Create your team and invite members.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {role === 'manager' && allTeams.length > 1 && (
              <div className="flex items-center gap-4 bg-card/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl border border-border/10 blueprint-bg">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 pl-4">Switch Team</span>
                <select 
                  value={teamId || ''} 
                  onChange={(e) => fetchTeam(e.target.value)}
                  className="bg-secondary/50 border border-primary/10 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-4 ring-primary/5 outline-none cursor-pointer text-foreground min-w-[200px]"
                >
                  {allTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
            {teamId && role !== 'team_member' && <InviteMemberModal teamId={teamId} role={role} />}
          </div>
        </div>

        {teamId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: 'Team Members', value: members.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Team Health', value: '100%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
              { label: 'Team Leads', value: members.filter(m => m.role === 'team_leader').length, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/5' },
              { label: 'Sync Cycle', value: 'DAILY', icon: Cpu, color: 'text-primary', bg: 'bg-primary/5' },
            ].map((stat, i) => (
              <Card key={i} className="border-none bg-card/40 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-border/10 relative overflow-hidden group blueprint-bg">
                <div className={cn("absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-10 transition-opacity", stat.color)}>
                  <stat.icon className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div className="space-y-2 md:space-y-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-1 rounded-full animate-pulse", stat.color.replace('text', 'bg'))} />
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">{stat.label}</p>
                  </div>
                  <h4 className={cn("text-3xl md:text-5xl font-black tracking-tighter uppercase font-heading", stat.color)}>{stat.value}</h4>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View Switcher: Tactical Toggle */}
        {teamId && (
          <div className="flex justify-center py-8">
            <div className="relative p-1 bg-card/60 backdrop-blur-3xl rounded-full border border-primary/10 shadow-2xl flex items-center blueprint-bg">
              <div 
                className={cn(
                  "absolute h-[40px] md:h-[52px] rounded-full bg-primary shadow-[0_0_30px_rgba(76,215,246,0.4)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  view === 'grid' ? 'w-24 md:w-44 translate-x-0' : 'w-32 md:w-52 translate-x-24 md:translate-x-44'
                )}
              />
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "relative z-10 w-24 md:w-44 h-10 md:h-12 flex items-center justify-center gap-2 md:gap-3 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-colors duration-500",
                  view === 'grid' ? 'text-primary-foreground' : 'text-muted-foreground/40 hover:text-foreground'
                )}
              >
                <LayoutGrid className="w-3 h-3 md:w-4 md:h-4" />
                Directory
              </button>
              <button 
                onClick={() => setView('flow')}
                className={cn(
                  "relative z-10 w-32 md:w-52 h-10 md:h-12 flex items-center justify-center gap-2 md:gap-3 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-colors duration-500",
                  view === 'flow' ? 'text-primary-foreground' : 'text-muted-foreground/40 hover:text-foreground'
                )}
              >
                <GitGraph className="w-3 h-3 md:w-4 md:h-4" />
                Flow
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Switcher */}
      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-primary/5 rounded-[3rem] border border-primary/10 animate-pulse blueprint-bg" />
            ))
          ) : members.length > 0 ? (
            members.map((member) => (
              <Card key={member.user_id} className={cn(
                "group relative border-none bg-card/40 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-700 hover:-translate-y-3 border-2 tactical-glow blueprint-bg",
                member.user_id === currentUserId ? 'border-primary/40 ring-4 ring-primary/5' : 'border-border/10'
              )}>
                {/* Tactical Status Strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2 shadow-lg",
                  member.role === 'manager' ? 'bg-primary' :
                  member.role === 'team_leader' ? 'bg-blue-500' :
                  'bg-emerald-500'
                )} />

                <CardContent className="p-8 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-primary/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Avatar className="h-24 w-24 rounded-[2rem] shadow-2xl ring-2 ring-primary/10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className={cn(
                          "text-white font-black text-3xl",
                          member.role === 'manager' ? 'bg-primary' :
                          member.role === 'team_leader' ? 'bg-blue-600' :
                          'bg-emerald-600'
                        )}>
                          {member.profiles?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-4 border-card shadow-2xl",
                         member.user_id === currentUserId ? 'bg-primary animate-pulse' : 'bg-emerald-500'
                      )} />
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <Badge className={cn(
                        "px-4 py-1.5 rounded-xl font-black text-[8px] uppercase tracking-[0.3em] shadow-lg border-none",
                        member.role === 'manager' ? 'bg-primary/10 text-primary' :
                        member.role === 'team_leader' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      )}>
                        {member.role?.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all border border-border/10 shadow-xl">
                        <MoreHorizontal className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors uppercase font-heading leading-tight truncate">
                        {member.profiles?.full_name || 'ANONYMOUS MEMBER'}
                      </h3>
                      {member.user_id === currentUserId && (
                        <p className="text-primary/40 text-[9px] font-black uppercase tracking-[0.5em]">You</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/10 shadow-inner group/email">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/email:text-primary transition-colors" />
                      <p className="text-[10px] font-bold text-muted-foreground/60 truncate tracking-tight">{member.profiles?.email}</p>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border border-primary/5 shadow-lg",
                      member.role === 'manager' ? 'bg-primary/5' :
                      member.role === 'team_leader' ? 'bg-blue-500/5' :
                      'bg-emerald-500/5'
                    )}>
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        member.role === 'manager' ? 'text-primary' :
                        member.role === 'team_leader' ? 'text-blue-500' :
                        'text-emerald-500'
                      )}>
                        {member.role === 'manager' ? <ShieldPlus className="w-4 h-4" /> : 
                         member.role === 'team_leader' ? <Target className="w-4 h-4" /> : 
                         <Zap className="w-4 h-4" />}
                      </div>
                      <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
                        {member.role === 'team_leader' ? 'Team Lead' : member.role === 'manager' ? 'Workspace Admin' : 'Team Member'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/10 grid grid-cols-2 gap-4">
                    <Button variant="outline" className="rounded-2xl h-12 font-black text-[9px] uppercase tracking-[0.3em] gap-2 border-border/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 shadow-xl">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-12 font-black text-[9px] uppercase tracking-[0.3em] gap-2 border-border/10 hover:bg-secondary transition-all shadow-xl">
                      <Activity className="w-4 h-4 text-primary" /> Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <div className="col-span-full py-40 text-center space-y-12 bg-card/40 backdrop-blur-xl rounded-[4rem] border border-dashed border-primary/20 px-10 blueprint-bg shadow-2xl">
                <div className="relative w-40 h-40 mx-auto">
                  <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
                  <div className="relative bg-card/80 w-40 h-40 rounded-[3rem] flex items-center justify-center text-primary shadow-2xl border border-primary/20">
                     <Users className="w-20 h-20" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase font-heading">No Members Yet</h2>
                  <p className="text-muted-foreground/60 text-xl max-w-xl mx-auto font-medium leading-relaxed tracking-tight">Your team is empty. Invite members to get started.</p>
                </div>
                <div className="flex flex-col items-center gap-8">
                  {teamId ? (
                    role !== 'team_member' && <InviteMemberModal teamId={teamId} role={role} />
                  ) : (
                    role === 'manager' && (
                      <Button onClick={handleCreateTeam} disabled={creatingTeam} className="h-20 px-16 rounded-[2.5rem] bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-[0.4em] gap-4 shadow-[0_0_50px_-10px_rgba(76,215,246,0.6)] transition-all hover:scale-105 active:scale-95">
                         {creatingTeam ? <Loader2 className="w-8 h-8 animate-spin" /> : <><ShieldPlus className="w-8 h-8" /> Create Team</>}
                      </Button>
                    )
                  )}
                </div>
             </div>
          )}
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative min-h-[600px] w-full overflow-x-auto overflow-y-hidden py-20 bg-card/10 backdrop-blur-3xl rounded-[2rem] md:rounded-[4rem] border border-primary/5 shadow-2xl blueprint-bg animate-reveal"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#4cd7f607_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div 
            ref={contentRef}
            className="relative flex flex-col xl:flex-row items-center justify-center gap-16 md:gap-32 transition-all duration-700 ease-out min-w-max px-10 xl:px-20 mx-auto"
          >
            
            {/* Tier 1: Workspace Admin */}
            <div className="flex flex-col items-center">
              <div className="mb-8 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.5em] relative z-10">Workspace Admin</p>
              </div>
              {members.filter(m => m.role === 'manager').map(manager => (
                <div key={manager.user_id} className="relative z-20 group">
                  <div className="absolute -inset-6 bg-primary/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-card/90 backdrop-blur-xl border-2 md:border-4 border-primary/30 p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] flex items-center gap-4 md:gap-8 shadow-2xl group-hover:shadow-primary/20 transition-all duration-700 hover:scale-105 blueprint-bg">
                    <Avatar className="h-20 w-20 md:h-28 md:w-28 rounded-[1.5rem] md:rounded-[2rem] ring-4 ring-primary/10 shadow-2xl transition-transform duration-700 group-hover:rotate-3">
                      <AvatarFallback className="bg-primary text-primary-foreground font-black text-3xl md:text-5xl">
                        {manager.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="pr-8 md:pr-16">
                      <p className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase font-heading leading-tight">{manager.profiles?.full_name}</p>
                      <p className="text-[8px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] mt-1 md:mt-2">Admin</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier 2: Team Leads */}
            <div className="flex flex-col gap-10 md:gap-16 py-10 relative">
               {members.filter(m => m.role === 'team_leader').length > 1 && (
                  <div className="hidden xl:block absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 w-1 bg-primary/10 rounded-full h-[70%] shadow-[0_0_15px_rgba(76,215,246,0.1)]" />
               )}
               
               <div className="flex flex-col gap-10 md:gap-16">
                <div className="flex justify-center">
                  <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 font-black text-[8px] md:text-[9px] uppercase tracking-[0.5em] px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-lg">Team Leads</Badge>
                </div>
                {members.filter(m => m.role === 'team_leader').map((leader) => (
                  <div key={leader.user_id} className="relative z-20 group flex items-center">
                    <svg className="hidden xl:block absolute -left-10 md:-left-20 w-10 md:w-20 h-10 text-primary/20 transition-all duration-700 group-hover:text-primary group-hover:scale-x-110" fill="none">
                      <path d="M0 20 H75" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="75" cy="20" r="3" fill="currentColor" />
                    </svg>
                    
                    <div className="bg-card/70 backdrop-blur-xl border border-primary/10 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 shadow-2xl transition-all duration-700 hover:border-blue-500/50 hover:translate-x-4 group-hover:shadow-blue-500/10 blueprint-bg w-full">
                      <Avatar className="h-14 w-14 md:h-20 md:w-20 rounded-xl md:rounded-[1.5rem] ring-4 ring-blue-500/10 shadow-2xl">
                        <AvatarFallback className="bg-blue-600 text-white font-black text-2xl md:text-3xl">
                          {leader.profiles?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="pr-8 md:pr-16">
                        <p className="text-lg md:text-2xl font-black tracking-tighter text-foreground uppercase font-heading leading-tight">{leader.profiles?.full_name}</p>
                        <p className="text-[8px] md:text-[9px] font-black text-blue-500/60 uppercase tracking-[0.4em] mt-1">Lead</p>
                      </div>
                    </div>

                    <svg className="hidden xl:block absolute -right-10 md:-right-20 w-10 md:w-20 h-10 text-primary/20 transition-all duration-700 group-hover:text-primary group-hover:scale-x-110" fill="none">
                      <path d="M0 20 H75" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M70 14 L78 20 L70 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier 3: Team Grid */}
            <div className="flex flex-col gap-10 md:gap-16 relative w-full xl:w-auto">
              {members.filter(m => m.role === 'team_member').length > 1 && (
                <div className="hidden xl:block absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 w-1 bg-primary/10 rounded-full h-[80%] shadow-[0_0_15px_rgba(76,215,246,0.1)]" />
              )}
              
              <div className="flex justify-center">
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[8px] md:text-[9px] uppercase tracking-[0.5em] px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-lg">Team Members</Badge>
              </div>
              <div className={cn(
                "grid gap-4 md:gap-6 mx-auto",
                members.filter(m => m.role === 'team_member').length > 8 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : 
                members.filter(m => m.role === 'team_member').length > 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : 
                "grid-cols-1 sm:grid-cols-2"
              )}>
                {members.filter(m => m.role === 'team_member').map(member => (
                  <div key={member.user_id} className="relative group flex items-center bg-card/50 backdrop-blur-xl border border-primary/5 p-4 md:p-6 rounded-[2rem] md:rounded-[2.8rem] transition-all duration-700 hover:border-emerald-500/50 hover:translate-x-2 xl:hover:translate-x-6 shadow-2xl hover:shadow-emerald-500/10 blueprint-bg w-full">
                    <svg className="hidden xl:block absolute -left-10 md:-left-20 w-10 md:w-20 h-10 text-primary/10 pointer-events-none group-hover:text-primary transition-colors duration-700" fill="none">
                      <path d="M0 20 H20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                    <Avatar className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-[1.2rem] ring-4 ring-emerald-500/10 shadow-xl transition-all duration-700 group-hover:rotate-6">
                      <AvatarFallback className="bg-emerald-700 text-white font-black text-xl md:text-2xl">
                        {member.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 md:ml-6 pr-12 md:pr-20">
                      <p className="text-lg md:text-xl font-black text-foreground uppercase font-heading leading-tight tracking-tight">{member.profiles?.full_name || 'MEMBER'}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.4em] mt-1">Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
