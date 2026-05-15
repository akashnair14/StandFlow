'use client'

import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState, useRef } from 'react'
import { Users, Mail, MessageSquare, MoreHorizontal, ShieldPlus, Loader2, Zap, Activity, LayoutGrid, GitGraph, Target, ShieldCheck, Cpu, Globe, Search } from 'lucide-react'
import { SlackIcon, LinkedinIcon, TwitterIcon, GithubIcon, WhatsAppIcon } from '@/components/ui/brand-icons'
import { Button } from '@/components/ui/button'
import { InviteMemberModal } from '@/components/team/invite-member-modal'
import { createTeamAction } from '@/lib/actions/teams'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewProfileModal } from '@/components/team/view-profile-modal'


import { getTeamDataBypass } from './bypass-actions'

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

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
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [activeRoleFilter, setActiveRoleFilter] = useState<'all' | 'manager' | 'team_leader' | 'team_member'>('all')
  const [searchQuery, setSearchQuery] = useState('')
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
      setTeamId(result.currentTeamId || null)
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

    const handleUpdate = () => fetchTeam()
    window.addEventListener('profile-updated', handleUpdate)
    return () => window.removeEventListener('profile-updated', handleUpdate)
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
          
          <div className="flex flex-wrap items-center gap-4">
            {role === 'manager' && allTeams.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex items-center gap-3 w-full">
                {allTeams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => fetchTeam(t.id)}
                    className={cn(
                      "flex-1 lg:flex-none px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border text-center whitespace-nowrap",
                      teamId === t.id 
                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(76,215,246,0.15)]" 
                        : "bg-card/40 border-border/10 text-muted-foreground/40 hover:text-foreground hover:border-primary/50"
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {role === 'manager' && (
              <Button 
                onClick={handleCreateTeam} 
                disabled={creatingTeam} 
                className="h-10 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] gap-2 border border-primary/20 shadow-xl transition-all active:scale-95"
              >
                {creatingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldPlus className="w-4 h-4" /> Create Team</>}
              </Button>
            )}
            {teamId && role !== 'team_member' && <InviteMemberModal teamId={teamId} role={role} />}
          </div>
        </div>

        {teamId && (
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 py-6 border-y border-primary/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
              {[
                { id: 'all', label: 'All Unit', icon: Users },
                { id: 'manager', label: 'Managers', icon: ShieldPlus },
                { id: 'team_leader', label: 'Leads', icon: Target },
                { id: 'team_member', label: 'Members', icon: Zap }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveRoleFilter(filter.id as any)}
                  className={cn(
                    "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 border",
                    activeRoleFilter === filter.id 
                      ? "bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(76,215,246,0.15)]" 
                      : "bg-card/40 border-border/10 text-muted-foreground/40 hover:text-foreground hover:border-primary/50"
                  )}
                >
                  <filter.icon className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex-1 max-w-md w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Identify team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/20 backdrop-blur-3xl border border-primary/5 rounded-full pl-12 pr-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-4 ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/10"
              />
            </div>

            <div className="flex items-center gap-2 bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-border/10 shadow-xl">
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2",
                  view === 'grid' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground/40 hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Directory
              </button>
              <button 
                onClick={() => setView('flow')}
                className={cn(
                  "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2",
                  view === 'flow' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground/40 hover:text-foreground"
                )}
              >
                <GitGraph className="w-3.5 h-3.5" />
                Tactical Flow
              </button>
            </div>
          </div>
        )}

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

      </div>

      {/* Content Switcher */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-primary/5 rounded-[3rem] border border-primary/10 animate-pulse blueprint-bg" />
            ))
          ) : members.length > 0 ? (
            members
              .filter(m => activeRoleFilter === 'all' || m.role === activeRoleFilter)
              .filter(m => !searchQuery || m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((member) => (
              <Card key={member.user_id} className={cn(
                "group relative border-none bg-card/40 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-700 hover:-translate-y-3 border-2 tactical-glow blueprint-bg",
                member.user_id === currentUserId ? 'border-primary/40 ring-4 ring-primary/5' : 'border-border/10'
              )}>
                {/* Tactical Status Strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2 shadow-lg",
                  "absolute top-0 left-0 w-full h-1.5 shadow-lg",
                  member.role === 'manager' ? 'bg-primary' :
                  member.role === 'team_leader' ? 'bg-blue-500' :
                  'bg-emerald-500'
                )} />

                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Left: Avatar & Status */}
                    <div className="relative shrink-0 flex justify-center md:block">
                      <div className="absolute -inset-4 bg-primary/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Avatar className="h-20 w-20 md:h-24 md:w-24 rounded-3xl shadow-2xl ring-2 ring-primary/10 transition-all duration-700 group-hover:scale-105">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className={cn(
                          "text-white font-black text-2xl md:text-3xl",
                          member.role === 'manager' ? 'bg-primary' :
                          member.role === 'team_leader' ? 'bg-blue-500' :
                          'bg-emerald-500'
                        )}>
                          {member.profiles?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute bottom-0 right-0 md:-bottom-1 md:-right-1 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center shadow-xl",
                        member.profiles?.status === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                      )} />
                    </div>

                    {/* Middle: Name, Role & Email Stack */}
                    <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase group-hover:text-primary transition-colors break-words">
                        {member.profiles?.full_name || 'ANONYMOUS'}
                      </h3>
                      
                      <div className="flex justify-center md:justify-start">
                        <Badge variant="outline" className={cn(
                          "rounded-lg px-3 py-1 font-black text-[8px] uppercase tracking-[0.2em] border-none shadow-sm",
                          member.role === 'manager' ? 'bg-primary/10 text-primary' :
                          member.role === 'team_leader' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        )}>
                          {member.role === 'manager' ? 'Manager' : member.role === 'team_leader' ? 'Team Lead' : 'Member'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground/40 font-bold text-[9px] uppercase tracking-widest break-all">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span>{member.profiles?.email}</span>
                      </div>

                      {/* Social Links */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2">
                        {member.profiles?.social_links?.linkedin && (
                          <button onClick={() => window.open(ensureAbsoluteUrl(member.profiles.social_links.linkedin), '_blank')} className="p-2 rounded-lg bg-card/60 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all border border-border/10">
                            <LinkedinIcon className="w-3 h-3" />
                          </button>
                        )}
                        {member.profiles?.social_links?.github && (
                          <button onClick={() => window.open(ensureAbsoluteUrl(member.profiles.social_links.github), '_blank')} className="p-2 rounded-lg bg-card/60 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all border border-border/10">
                            <GithubIcon className="w-3 h-3" />
                          </button>
                        )}
                        {member.profiles?.social_links?.slack && (
                          <button onClick={() => window.open(ensureAbsoluteUrl(member.profiles.social_links.slack), '_blank')} className="p-2 rounded-lg bg-card/60 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all border border-border/10">
                            <SlackIcon className="w-3 h-3" />
                          </button>
                        )}
                        {member.profiles?.social_links?.whatsapp && (
                          <button onClick={() => window.open(`https://wa.me/${member.profiles.social_links.whatsapp.replace(/\D/g, '')}`, '_blank')} className="p-2 rounded-lg bg-card/60 text-primary/40 hover:text-primary hover:bg-primary/10 transition-all border border-border/10">
                            <WhatsAppIcon className="w-3 h-3" />
                          </button>
                        )}
                        {member.user_id === currentUserId && (
                          <span className="text-[8px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full uppercase tracking-[0.3em]">You</span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      {member.user_id !== currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:w-28 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 border-border/10 hover:bg-primary hover:text-primary-foreground transition-all shadow-xl">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-2xl border-primary/20 bg-card/80 backdrop-blur-xl p-2 min-w-[160px] shadow-2xl blueprint-bg">
                            {member.profiles?.social_links?.slack && (
                              <DropdownMenuItem className="rounded-xl focus:bg-primary focus:text-primary-foreground font-black text-[10px] uppercase tracking-widest gap-3 p-3 cursor-pointer" onClick={() => window.open(ensureAbsoluteUrl(member.profiles.social_links.slack), '_blank')}>
                                <SlackIcon className="w-4 h-4" /> Slack
                              </DropdownMenuItem>
                            )}
                            {member.profiles?.social_links?.whatsapp && (
                              <DropdownMenuItem className="rounded-xl focus:bg-[#25D366] focus:text-white font-black text-[10px] uppercase tracking-widest gap-3 p-3 cursor-pointer" onClick={() => window.open(`https://wa.me/${member.profiles.social_links.whatsapp.replace(/\D/g, '')}`, '_blank')}>
                                <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                              </DropdownMenuItem>
                            )}
                            {(!member.profiles?.social_links || !Object.values(member.profiles.social_links).some(l => !!l)) && (
                              <div className="p-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                No Channels
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedProfile(member.profiles)
                          setProfileModalOpen(true)
                        }}
                        className="flex-1 md:w-28 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 border-border/10 hover:bg-secondary transition-all shadow-xl"
                      >
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span>Profile</span>
                      </Button>
                    </div>
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
                      
                      {/* Admin Social Links */}
                      {manager.profiles?.social_links && Object.values(manager.profiles.social_links).some(link => !!link) && (
                        <div className="flex items-center gap-2 mt-4">
                          {manager.profiles.social_links.slack && (
                            <a href={manager.profiles.social_links.slack} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#4A154B]/10 text-[#4A154B] hover:bg-[#4A154B] hover:text-white transition-all">
                              <SlackIcon className="w-3 h-3" />
                            </a>
                          )}
                          {manager.profiles.social_links.linkedin && (
                            <a href={manager.profiles.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all">
                              <LinkedinIcon className="w-3 h-3" />
                            </a>
                          )}
                          {manager.profiles.social_links.twitter && (
                            <a href={manager.profiles.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                              <TwitterIcon className="w-3 h-3" />
                            </a>
                          )}
                          {manager.profiles.social_links.github && (
                            <a href={manager.profiles.social_links.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                              <GithubIcon className="w-3 h-3" />
                            </a>
                          )}
                          {manager.profiles.social_links.website && (
                            <a href={manager.profiles.social_links.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                              <Globe className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
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
                        
                        {/* Lead Social Links */}
                        {leader.profiles?.social_links && Object.values(leader.profiles.social_links).some(link => !!link) && (
                          <div className="flex items-center gap-2 mt-3">
                            {leader.profiles.social_links.slack && (
                              <a href={leader.profiles.social_links.slack} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#4A154B]/10 text-[#4A154B] hover:bg-[#4A154B] hover:text-white transition-all">
                                <SlackIcon className="w-3 h-3" />
                              </a>
                            )}
                            {leader.profiles.social_links.linkedin && (
                              <a href={leader.profiles.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all">
                                <LinkedinIcon className="w-3 h-3" />
                              </a>
                            )}
                            {leader.profiles.social_links.twitter && (
                              <a href={leader.profiles.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                                <TwitterIcon className="w-3 h-3" />
                              </a>
                            )}
                            {leader.profiles.social_links.github && (
                              <a href={leader.profiles.social_links.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                                <GithubIcon className="w-3 h-3" />
                              </a>
                            )}
                            {leader.profiles.social_links.website && (
                              <a href={leader.profiles.social_links.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                                <Globe className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
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
                      
                      {/* Member Social Links */}
                      {member.profiles?.social_links && Object.values(member.profiles.social_links).some(link => !!link) && (
                        <div className="flex items-center gap-2 mt-2">
                          {member.profiles.social_links.slack && (
                            <a href={member.profiles.social_links.slack} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-[#4A154B]/10 text-[#4A154B] hover:bg-[#4A154B] hover:text-white transition-all">
                              <SlackIcon className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {member.profiles.social_links.linkedin && (
                            <a href={member.profiles.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all">
                              <LinkedinIcon className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {member.profiles.social_links.twitter && (
                            <a href={member.profiles.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                              <TwitterIcon className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {member.profiles.social_links.github && (
                            <a href={member.profiles.social_links.github} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all">
                              <GithubIcon className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {member.profiles.social_links.website && (
                            <a href={member.profiles.social_links.website} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                              <Globe className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ViewProfileModal 
        profile={selectedProfile} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  )
}
