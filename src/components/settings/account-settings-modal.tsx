'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Loader2, 
  Check, 
  Trash2,
  ChevronRight,
  Fingerprint
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AccountSettingsModalProps {
  profile: Profile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountSettingsModal({ profile, open, onOpenChange }: AccountSettingsModalProps) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const supabase = createClient()

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success('Password Updated', {
        description: 'Your account security has been updated.'
      })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('ARE YOU SURE? This will permanently delete your account and all associated data. This action cannot be undone.')
    if (!confirmed) return

    setLoading(true)
    try {
      // In a real app, you'd call a server action or edge function to delete the user
      // and their data across all tables.
      toast.error('Feature restricted', {
        description: 'Account deletion must be requested via support for safety.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true} className="md:max-w-[800px] sm:max-w-[600px] w-[95vw] rounded-[3rem] border border-primary/20 bg-card/60 backdrop-blur-3xl shadow-2xl p-8 md:p-12 overflow-hidden blueprint-bg animate-reveal">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-destructive/5 rounded-full filter blur-[80px] -z-10" />

        <DialogHeader className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(76,215,246,0.3)]">
              <Settings className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em]">System Settings</p>
              <DialogTitle className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase font-heading">Account Settings</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground/60 font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] leading-relaxed">
            Manage your account security, authentication, and privacy preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="bg-secondary/20 border border-border/10 p-1 h-14 rounded-2xl mb-8 w-full sm:w-auto">
            <TabsTrigger value="security" className="rounded-xl px-8 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Security
            </TabsTrigger>
            <TabsTrigger value="general" className="rounded-xl px-8 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Update Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 ml-2">New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 ml-2">Confirm Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    disabled={loading || !newPassword}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Change Password</>}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Fingerprint className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Security Status</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Active Session</span>
                    </div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Verified</span>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-amber-500 mt-1" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Login Activity</p>
                      <p className="text-[9px] text-muted-foreground/60 font-medium leading-relaxed italic">You will be notified of any suspicious login attempts on your account.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Identity</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 ml-2">Registered Email</Label>
                    <div className="relative">
                      <Input
                        value={profile?.id ? "Authenticated via Supabase" : "Loading..."}
                        disabled
                        className="h-14 rounded-xl bg-secondary/5 border border-border/10 font-bold text-foreground/40 italic cursor-not-allowed"
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-destructive">Danger Zone</h3>
                </div>

                <div className="p-6 rounded-[2rem] border border-destructive/20 bg-destructive/5 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full filter blur-[40px] -z-10 group-hover:scale-150 transition-transform duration-700" />
                  <p className="text-[11px] font-bold text-foreground/80 leading-relaxed uppercase tracking-tighter">
                    Deleting your account will remove all your data, team associations, and historical reports.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-xl font-black text-[9px] uppercase tracking-widest gap-3 shadow-xl shadow-destructive/10"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-8 border-t border-border/10 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            Close Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
