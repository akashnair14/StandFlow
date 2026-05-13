'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Camera, Loader2, Phone, User, Check, ShieldCheck, Globe, Hash } from 'lucide-react'
import { SlackIcon, LinkedinIcon, TwitterIcon, GithubIcon, WhatsAppIcon } from '@/components/ui/brand-icons'
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
  const [socialLinks, setSocialLinks] = useState({
    slack: profile?.social_links?.slack || '',
    linkedin: profile?.social_links?.linkedin || '',
    twitter: profile?.social_links?.twitter || '',
    github: profile?.social_links?.github || '',
    website: profile?.social_links?.website || '',
    whatsapp: profile?.social_links?.whatsapp || ''
  })

  // Sync state if profile prop changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setAvatarUrl(profile.avatar_url || '')
      setSocialLinks({
        slack: profile.social_links?.slack || '',
        linkedin: profile.social_links?.linkedin || '',
        twitter: profile.social_links?.twitter || '',
        github: profile.social_links?.github || '',
        website: profile.social_links?.website || '',
        whatsapp: profile.social_links?.whatsapp || ''
      })
    }
  }, [profile])
  const supabase = createClient()
  const router = useRouter()

  const phoneRegex = /^(\+?\d{1,3})?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/
  const isPhoneValid = !phone || phoneRegex.test(phone)

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id || !isPhoneValid) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
          social_links: socialLinks,
          role: profile?.role || 'team_member', // Preserve role
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Profile Saved', {
        description: 'Your profile settings have been updated.'
      })
      window.dispatchEvent(new Event('profile-updated'))
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
      <DialogContent showCloseButton={true} className="md:max-w-[900px] sm:max-w-[600px] w-[95vw] rounded-[3rem] border border-primary/20 bg-card/60 backdrop-blur-3xl shadow-2xl p-8 md:p-12 overflow-hidden blueprint-bg animate-reveal">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full filter blur-[80px] -z-10" />

        <DialogHeader className="space-y-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(76,215,246,0.3)]">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em]">User Profile</p>
              <DialogTitle className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase font-heading">Profile Settings</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground/60 font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] leading-relaxed">
            Manage your personal details and communication channels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-8 md:space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left Side: Identity & Basic Info */}
            <div className="md:col-span-5 space-y-10">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-6 bg-primary/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-[2.5rem] md:rounded-[3.5rem] ring-4 ring-background shadow-2xl transition-all duration-700 group-hover:scale-105 overflow-hidden relative z-10 border border-primary/10">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-4xl md:text-6xl">
                      {fullName?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-[2.5rem] md:rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-all z-20 flex flex-col items-center justify-center text-primary gap-2 md:gap-3 border border-primary/20"
                  >
                    {uploading ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" /> : <><Camera className="w-6 h-6 md:w-8 md:h-8" /><span className="font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em]">Update</span></>}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-10 h-10 md:w-12 md:h-12 bg-card rounded-xl md:rounded-2xl border border-primary/20 flex items-center justify-center shadow-2xl z-30 group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 ml-2">Full Name</Label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      className="h-14 md:h-16 pl-14 md:pl-16 rounded-2xl bg-background/50 border border-border/10 font-black text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-base md:text-lg tracking-tight"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <Label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Phone</Label>
                    {!isPhoneValid && <span className="text-[8px] font-black text-destructive uppercase tracking-[0.2em] animate-pulse">Invalid</span>}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                      <Phone className={cn("w-4 h-4 md:w-5 md:h-5", !isPhoneValid ? 'text-destructive' : '')} />
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={cn(
                        "h-14 md:h-16 pl-14 md:pl-16 rounded-2xl bg-background/50 border border-border/10 font-black text-foreground transition-all text-base md:text-lg tracking-tight",
                        !isPhoneValid ? 'border-destructive/40 focus:border-destructive/60 focus:ring-destructive/5' : 'focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Social & Communication */}
            <div className="md:col-span-7 space-y-8">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-primary">Social Connectivity</h3>
              </div>
              
              <div className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Slack */}
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Slack</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-[#4A154B] transition-colors">
                        <SlackIcon className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.slack || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, slack: e.target.value }))}
                        placeholder="ID or URL"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-[#4A154B]/40 focus:ring-4 focus:ring-[#4A154B]/5 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">LinkedIn</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-[#0077B5] transition-colors">
                        <LinkedinIcon className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.linkedin || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, linkedin: e.target.value }))}
                        placeholder="Profile URL"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-[#0077B5]/40 focus:ring-4 focus:ring-[#0077B5]/5 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Twitter */}
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Twitter / X</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors">
                        <TwitterIcon className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.twitter || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, twitter: e.target.value }))}
                        placeholder="@username"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">GitHub</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors">
                        <GithubIcon className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.github || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, github: e.target.value }))}
                        placeholder="username"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Personal Website</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                        <Globe className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.website || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, website: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-3">
                    <Label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">WhatsApp</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-[#25D366] transition-colors">
                        <WhatsAppIcon className="w-5 h-5" />
                      </div>
                      <Input
                        value={socialLinks?.whatsapp || ''}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev!, whatsapp: e.target.value }))}
                        placeholder="+1234567890"
                        className="h-14 pl-14 rounded-xl bg-background/50 border border-border/10 font-bold text-foreground focus:border-[#25D366]/40 focus:ring-4 focus:ring-[#25D366]/5 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Hint */}
              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-background/50">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Privacy Notice</p>
                  <p className="text-[9px] text-muted-foreground/60 font-medium leading-relaxed">Your social links will be visible to your team members to facilitate better communication and collaboration.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-6 border-t border-border/10 relative z-10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-foreground hover:bg-secondary/50 transition-all border border-border/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading || !isPhoneValid}
              className="flex-[1.5] h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-primary text-primary-foreground hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.4em] gap-4 shadow-[0_0_40px_-10px_rgba(76,215,246,0.5)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Profile</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
