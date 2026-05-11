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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { inviteMember } from '@/app/(dashboard)/team/actions'

export function InviteMemberModal({ teamId }: { teamId: string | null }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

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
        <form onSubmit={handleInvite} className="space-y-8 py-6">
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
