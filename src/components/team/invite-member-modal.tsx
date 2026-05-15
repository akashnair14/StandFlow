'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, Mail, Copy, Check, Share2, Users, ShieldPlus, Target } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { inviteMember } from '@/lib/actions/teams'
import { cn } from '@/lib/utils'

export function InviteMemberModal({ teamId, role }: { teamId: string | null, role?: string | null }) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'team_leader' | 'team_member'>('team_member')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const canInviteLeader = role === 'manager'

  const inviteLink = teamId 
    ? `${window.location.origin}/signup?team_id=${teamId}&role=${selectedRole}`
    : `${window.location.origin}/signup`

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link Copied', {
      description: 'The invitation link has been saved to your clipboard.'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !teamId) return

    setLoading(true)
    try {
      const result = await inviteMember(email, teamId, selectedRole)
      if (result.error) throw new Error(result.error)

      toast.success('Invitation Sent', {
        description: `Invitation email sent to ${email}.`
      })
      
      setOpen(false)
      setEmail('')
    } catch (error: any) {
      toast.error('Invitation Failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.3em] gap-3 px-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:scale-95">
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      } />
      <DialogContent className="sm:max-w-[480px] rounded-[3rem] border border-primary/20 bg-card/60 backdrop-blur-3xl shadow-2xl p-12 overflow-hidden blueprint-bg animate-reveal">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full filter blur-[80px] -z-10 animate-pulse" />
        
        <DialogHeader className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 w-16 h-16 rounded-[1.5rem] border border-primary/20 flex items-center justify-center text-primary shadow-xl">
              <UserPlus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary">Team Growth</span>
              <DialogTitle className="text-3xl font-black tracking-tighter text-foreground uppercase font-heading">Invite Member</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground/60 font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed">
            Send an invitation to a new team member to join the workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-10 py-6">
          
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 ml-4">Role</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'team_member', label: 'MEMBER', icon: Users },
                { id: 'team_leader', label: 'TEAM LEAD', icon: ShieldPlus, disabled: !canInviteLeader }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  disabled={r.disabled}
                  onClick={() => setSelectedRole(r.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                    selectedRole === r.id 
                      ? "border-primary bg-primary/10 shadow-xl" 
                      : "border-border/10 bg-secondary/20 hover:border-primary/40",
                    r.disabled && "opacity-30 cursor-not-allowed grayscale"
                  )}
                >
                  {selectedRole === r.id && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  )}
                  <r.icon className={cn(
                    "w-6 h-6 transition-transform duration-500 group-hover:scale-110",
                    selectedRole === r.id ? "text-primary" : "text-muted-foreground/30"
                  )} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.3em]",
                    selectedRole === r.id ? "text-foreground" : "text-muted-foreground/40"
                  )}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-[2rem] bg-secondary/30 border border-primary/10 shadow-inner relative overflow-hidden blueprint-bg">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Invitation Link</Label>
              <Badge className="bg-primary text-primary-foreground font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg">Direct Link</Badge>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                </div>
                <Input 
                  readOnly 
                  value={inviteLink}
                  className="h-12 pl-12 rounded-xl bg-background/50 border-none text-[10px] font-mono font-bold truncate text-primary/80"
                />
              </div>
              <Button 
                type="button"
                onClick={copyLink}
                className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground shadow-lg transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="relative flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Email Invitation</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="space-y-4">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 ml-4">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 pl-16 rounded-2xl bg-background/50 border border-border/10 font-black text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm uppercase tracking-widest placeholder:text-muted-foreground/20"
                required
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={loading || !email}
              className="w-full h-18 rounded-[1.8rem] bg-foreground text-background hover:opacity-90 font-black text-[10px] uppercase tracking-[0.4em] gap-4 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> SENDING INVITATION...
                </>
              ) : (
                <>Send Invitation <Target className="w-5 h-5" /></>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
