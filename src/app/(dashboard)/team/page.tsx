'use client'

import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Users, Mail, MessageSquare, MoreHorizontal, UserPlus, ShieldPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InviteMemberModal } from '@/components/team/invite-member-modal'
import { createTeamAction } from '@/app/(dashboard)/team/actions'
import { toast } from 'sonner'

const supabase = createClient()

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)

  async function fetchTeam() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use maybeSingle to avoid throwing when no team exists
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, teams(name)')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (memberError) {
        console.error('Fetch Membership Error:', memberError.message)
      }

      if (membership) {
        const { data: teamMembers } = await supabase.from('team_members')
          .select('*, profiles(*)')
          .eq('team_id', membership.team_id)

        setMembers(teamMembers || [])
        setTeamId(membership.team_id)
        setTeamName((membership.teams as any)?.name || 'My Team')
        setNewTeamName((membership.teams as any)?.name || 'My Team')
      } else {
        setMembers([])
        setTeamId(null)
      }
    } catch (error) {
      console.error('Critical Fetch Error:', error)
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
        // Update state INSTANTLY with the data returned from server
        const memberData = result.data
        setTeamId(result.teamId)
        setMembers([memberData])
        setTeamName(memberData.teams?.name || 'My Team')
        setNewTeamName(memberData.teams?.name || 'My Team')
        
        toast.success('Team initialized!', {
          description: 'Your hub is now live.'
        })
      }
    } catch (error) {
      toast.error('Failed to initialize team')
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
      toast.success('Team renamed!')
    } catch (error) {
      toast.error('Failed to update team name')
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-secondary/30 border-none rounded-lg px-3 py-1 text-2xl font-black focus:ring-2 ring-teal-500/20 outline-none"
                  autoFocus
                />
                <Button size="sm" onClick={handleUpdateName} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1 text-[10px] font-black uppercase">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} className="text-muted-foreground rounded-lg px-3 py-1 text-[10px] font-black uppercase">Cancel</Button>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-black tracking-tight text-[#020101] dark:text-white">
                  {teamId ? teamName : 'Team Directory'}
                </h1>
                {teamId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditingName(true)}
                    className="h-8 w-8 rounded-lg hover:bg-secondary/50 text-muted-foreground/40"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
            {teamId && <Badge className="bg-[#00695C]/10 text-[#00695C] border-none rounded-lg font-black text-[10px] px-2.5 py-1 uppercase tracking-widest">{members.length} Members</Badge>}
          </div>
          <p className="text-muted-foreground font-medium">
            {teamId ? 'Managing collaboration and roles for your high-velocity team.' : 'Connect your team to start collaborating and unlock deep work cycles.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {teamId && <InviteMemberModal teamId={teamId} />}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-secondary/20 rounded-[2.5rem] animate-pulse" />
          ))
        ) : members.length > 0 ? (
          members.map((member) => (
            <Card key={member.id} className="border-none bg-white dark:bg-[#020101] rounded-[2.5rem] shadow-xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-border/10">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <Avatar className="h-20 w-20 rounded-[1.5rem] shadow-lg ring-4 ring-background">
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback className="bg-[#F6823A] text-white font-black text-2xl">
                      {member.profiles?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-secondary/30">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-[#020101] dark:text-white">{member.profiles?.full_name}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Team Contributor</p>
                </div>

                <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-secondary/50">
                      <Mail className="w-4 h-4 text-muted-foreground/60" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-secondary/50">
                      <MessageSquare className="w-4 h-4 text-muted-foreground/60" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-8 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50 px-6">
            <div className="bg-[#00695C]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-[#00695C]">
               <Users className="w-10 h-10" />
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-3xl font-black tracking-tight text-[#020101] dark:text-white">Solo Mission?</p>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">It looks like you're the only one here. Invite your team to start collaborating and unlock high-velocity cycles.</p>
            </div>
            <div className="pt-4 flex flex-col items-center gap-4">
              {teamId ? (
                <InviteMemberModal teamId={teamId} />
              ) : (
                <Button 
                  onClick={handleCreateTeam}
                  disabled={creatingTeam}
                  className="h-14 rounded-2xl bg-[#00695C] hover:bg-[#004D40] text-white font-black text-sm uppercase tracking-widest gap-3 px-10 shadow-xl shadow-teal-500/20"
                >
                  {creatingTeam ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldPlus className="w-5 h-5" />
                      Create Team Hub
                    </>
                  )}
                </Button>
              )}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">It only takes a second to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
