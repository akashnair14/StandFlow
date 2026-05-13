'use client'

import { Profile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/auth/actions'
import { Bell, Search, User, LogOut, Settings, Menu, ShieldCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ProfileSettingsModal } from '@/components/profile/profile-settings-modal'
import { AccountSettingsModal } from '@/components/settings/account-settings-modal'

interface TopNavProps {
  profile: Profile | null
}

export function TopNav({ profile }: TopNavProps) {
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  return (
    <>
      <header className="h-20 border-b bg-background/80 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 border-border/40">
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none">
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile Sidebar Navigation</SheetTitle>
              </SheetHeader>
              <Sidebar profile={profile} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 flex items-center justify-start md:px-4">
          <div className="relative max-w-md w-full hidden sm:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/20 border border-border/10 focus:border-primary/20 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Connected</span>
          </div>

          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary h-11 w-11 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </Button>
          
          <div className="h-8 w-px bg-border/40 mx-2 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-2 rounded-2xl hover:bg-secondary/50 transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black tracking-tight leading-none mb-1">{profile?.full_name?.split(' ')[0]}</p>
                  <p className="text-[9px] uppercase tracking-widest font-black text-primary leading-none">
                    {profile?.role === 'manager' ? 'Manager' : profile?.role === 'team_leader' ? 'Team Lead' : 'Employee'}
                  </p>
                </div>
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-xl ring-2 ring-border/20 shadow-md">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-black">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-lg border border-border flex items-center justify-center">
                    <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-3 rounded-[1.5rem] p-2 border-border/40 shadow-2xl blueprint-bg" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-4 py-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black tracking-tight">{profile?.full_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {profile?.role === 'manager' ? 'Manager' : profile?.role === 'team_leader' ? 'Team Lead' : 'Employee'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-50" />
              <div className="p-1 space-y-1">
                <DropdownMenuItem 
                  className="rounded-xl py-3 px-4 font-bold text-xs gap-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 focus:text-primary transition-colors"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <User className="w-4 h-4 text-muted-foreground group-focus:text-primary" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-xl py-3 px-4 font-bold text-xs gap-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 focus:text-primary transition-colors"
                  onClick={() => setAccountModalOpen(true)}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" /> Account Settings
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="opacity-50" />
              <div className="p-1">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl py-3 px-4 font-black text-xs gap-3 cursor-pointer" 
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileSettingsModal 
        profile={profile} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />

      <AccountSettingsModal
        profile={profile}
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </>
  )
}
