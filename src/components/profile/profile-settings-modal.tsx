'use client'

import { useState, useRef } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, Phone, User, Check, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProfileSettingsModalProps {
  profile: Profile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsModal({ profile, open, onOpenChange }: ProfileSettingsModalProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const supabase = createClient()
  const router = useRouter()

  const phoneRegex = /^(\+?\d{1,3})?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/
  const isPhoneValid = !phone || phoneRegex.test(phone)

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id || !isPhoneValid) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile Saved', {
        description: 'Your profile settings have been updated.'
      })
      router.refresh()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      toast.success('Profile Picture Updated')
    } catch (error: any) {
      toast.error('Upload Failure', {
        description: error.message
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true} className="sm:max-w-[500px] rounded-[3rem] border border-primary/20 bg-card/60 backdrop-blur-3xl shadow-2xl p-12 overflow-hidden blueprint-bg animate-reveal">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full filter blur-[80px] -z-10" />

        <DialogHeader className="space-y-6 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(76,215,246,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">User Profile</p>
              <DialogTitle className="text-4xl font-black tracking-tighter text-foreground uppercase font-heading">Profile Settings</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground/60 font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed">
            Manage your personal details and profile picture.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-8 bg-primary/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Avatar className="h-44 w-44 rounded-[3.5rem] ring-4 ring-background shadow-2xl transition-all duration-700 group-hover:scale-105 overflow-hidden relative z-10 border border-primary/10">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-6xl">
                  {fullName?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-all z-20 flex flex-col items-center justify-center text-primary gap-3 border border-primary/20"
              >
                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Camera className="w-8 h-8" /><span className="font-black text-[10px] uppercase tracking-[0.4em]">Update Photo</span></>}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-card rounded-2xl border border-primary/20 flex items-center justify-center shadow-2xl z-30 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 ml-4">Full Name</Label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name..."
                  className="h-20 pl-16 rounded-[2rem] bg-background/50 border border-border/10 font-black text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-lg tracking-tight"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Phone Number</Label>
                {!isPhoneValid && <span className="text-[9px] font-black text-destructive uppercase tracking-[0.2em] animate-pulse">Invalid Format</span>}
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                  <Phone className={cn("w-5 h-5", !isPhoneValid ? 'text-destructive' : '')} />
                </div>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={cn(
                    "h-20 pl-16 rounded-[2rem] bg-background/50 border border-border/10 font-black text-foreground transition-all text-lg tracking-tight",
                    !isPhoneValid ? 'border-destructive/40 focus:border-destructive/60 focus:ring-destructive/5' : 'focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-6 relative z-10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-16 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-foreground hover:bg-secondary/50 transition-all border border-border/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading || !isPhoneValid}
              className="flex-1 h-16 rounded-[1.5rem] bg-primary text-primary-foreground hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.4em] gap-4 shadow-[0_0_40px_-10px_rgba(76,215,246,0.5)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
