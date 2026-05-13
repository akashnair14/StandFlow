'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, ShieldCheck, Globe, Hash } from 'lucide-react'
import { SlackIcon, LinkedinIcon, TwitterIcon, GithubIcon, WhatsAppIcon } from '@/components/ui/brand-icons'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface ViewProfileModalProps {
  profile: Profile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ensureAbsoluteUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export function ViewProfileModal({ profile, open, onOpenChange }: ViewProfileModalProps) {
  if (!profile) return null

  const socialLinks = profile.social_links || {}
  const hasSocials = Object.values(socialLinks).some(link => !!link)
  const hasPhone = !!profile.phone

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[3.5rem] border border-primary/20 bg-card/40 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(76,215,246,0.15)] p-0 overflow-hidden blueprint-bg animate-reveal border-t-primary/30">
        {/* Dynamic Background */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-[60px] animate-pulse -z-10" />

        <div className="relative p-10 md:p-14">
          <DialogHeader className="sr-only">
            <DialogTitle>Team Member Profile - {profile.full_name}</DialogTitle>
            <DialogDescription>Detailed contact and social information for {profile.full_name}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] border-4 border-background shadow-2xl relative z-20 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
                <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground font-black text-4xl md:text-5xl">
                  {profile.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-card rounded-xl border border-primary/20 flex items-center justify-center shadow-2xl z-30">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Name & Role */}
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full mb-2">
                  {profile.role.replace('_', ' ')}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase font-heading leading-none">
                  {profile.full_name}
                </h2>
              </div>
              <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.5em]">
                Active since {new Date(profile.updated_at).toLocaleDateString()}
              </p>
            </div>

            {/* Content Sections */}
            <div className="w-full grid grid-cols-1 gap-8 pt-8">
              {(hasPhone || hasSocials) ? (
                <div className="space-y-8">
                  {hasPhone && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Direct Contact</p>
                      <div className="p-6 rounded-[2rem] bg-background/40 border border-primary/5 flex items-center justify-center gap-4 hover:border-primary/20 transition-all shadow-xl group">
                        <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-black tracking-tight">{profile.phone}</span>
                      </div>
                    </div>
                  )}

                  {hasSocials && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Digital Presence</p>
                      <div className="flex flex-wrap justify-center gap-4">
                        {socialLinks.slack && (
                          <a href={ensureAbsoluteUrl(socialLinks.slack)} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#4A154B]/5 border border-[#4A154B]/10 text-[#4A154B] hover:bg-[#4A154B] hover:text-white transition-all shadow-lg group">
                            <SlackIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {socialLinks.whatsapp && (
                          <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-lg group">
                            <WhatsAppIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {socialLinks.linkedin && (
                          <a href={ensureAbsoluteUrl(socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#0077B5]/5 border border-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all shadow-lg group">
                            <LinkedinIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {socialLinks.twitter && (
                          <a href={ensureAbsoluteUrl(socialLinks.twitter)} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all shadow-lg group">
                            <TwitterIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {socialLinks.github && (
                          <a href={ensureAbsoluteUrl(socialLinks.github)} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground hover:text-background transition-all shadow-lg group">
                            <GithubIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                        {socialLinks.website && (
                          <a href={ensureAbsoluteUrl(socialLinks.website)} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg group">
                            <Globe className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 p-8 rounded-[2.5rem] bg-primary/5 border border-dashed border-primary/20 flex flex-col items-center gap-4">
                  <Hash className="w-8 h-8 text-primary/20" />
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-center px-8"> No additional contact info shared yet. </p>
                </div>
              )}

              {/* Verified Badge Section */}
              <div className="pt-6 border-t border-border/10">
                <div className="flex items-center gap-4 px-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Verified Workspace Member</p>
                    <p className="text-[9px] text-muted-foreground/40 font-medium">Part of your secure StandFlow team network.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
