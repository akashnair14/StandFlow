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
import { UserPlus, Loader2, Mail, Copy, Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { inviteMember } from '@/app/(dashboard)/team/actions'

export function InviteMemberModal({ teamId }: { teamId: string | null }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const inviteLink = teamId 
    ? `${window.location.origin}/signup?team_id=${teamId}`
    : `${window.location.origin}/signup`

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Invite link copied!', {
      description: 'You can now share this link with your team.'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !teamId) return

    setLoading(true)
    try {
      const result = await inviteMember(email, teamId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Invitation processed', {
        description: result.message || `An invite has been sent to ${email}.`
      })
      
      setOpen(false)
      setEmail('')
    } catch (error: any) {
      toast.error('Invitation failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="h-12 rounded-xl bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs uppercase tracking-widest gap-2 px-6 shadow-lg shadow-teal-500/20">
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none bg-white dark:bg-[#020101] shadow-2xl p-8">
        <DialogHeader className="space-y-4">
          <div className="bg-[#00695C]/10 w-16 h-16 rounded-2xl flex items-center justify-center text-[#00695C] mb-2">
            <UserPlus className="w-8 h-8" />
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight text-[#020101] dark:text-white">Expand your team</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-base">
            Send an invitation to a colleague to join your focused work cycles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-8 py-4">
          {/* Share Link Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-secondary/20 border border-border/40">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Shareable Invite Link</Label>
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-teal-500/20 text-teal-600 bg-teal-500/5">Instant Access</Badge>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-teal-500 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <Input 
                  readOnly 
                  value={inviteLink}
                  className="h-11 pl-10 rounded-xl bg-background/50 border-none text-[11px] font-mono font-medium truncate"
                />
              </div>
              <Button 
                type="button"
                onClick={copyLink}
                variant="secondary"
                className="h-11 w-11 rounded-xl bg-white dark:bg-zinc-900 shadow-sm shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-muted-foreground/40">
              <span className="bg-white dark:bg-[#020101] px-4">Or send via email</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 rounded-xl bg-secondary/30 border-none font-medium placeholder:text-muted-foreground/40"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading || !email}
              className="w-full h-14 rounded-xl bg-[#020101] dark:bg-white dark:text-[#020101] font-black text-xs uppercase tracking-widest gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>Send Invitation</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
