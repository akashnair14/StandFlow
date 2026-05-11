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
import { Bell, Search, Plus, User, LogOut, Settings, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

interface TopNavProps {
  profile: Profile | null
}

export function TopNav({ profile }: TopNavProps) {
  return (
    <header className="h-20 border-b bg-white/40 dark:bg-[#020101]/40 backdrop-blur-2xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 border-border/40">
      <div className="flex items-center gap-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none">
            <Sidebar profile={profile} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex items-center gap-6">
        <div className="relative max-w-lg w-full hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-[#F6823A]" />
          <input 
            type="text" 
            placeholder="Search reports or squad members..." 
            className="w-full pl-12 pr-6 py-3.5 bg-secondary/30 dark:bg-zinc-900/50 border border-transparent focus:border-[#F6823A]/20 rounded-[1.25rem] text-sm font-bold focus:ring-4 focus:ring-[#F6823A]/5 outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-[#F6823A]/10 hover:text-[#F6823A] h-11 w-11 transition-all">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-border/40 mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-2 rounded-2xl hover:bg-secondary/50 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black tracking-tight leading-none text-[#020101] dark:text-white mb-1">{profile?.full_name?.split(' ')[0]}</p>
                <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/60 leading-none">
                  {profile?.role === 'manager' ? 'Lead' : 'Member'}
                </p>
              </div>
              <Avatar className="h-10 w-10 rounded-xl ring-2 ring-white dark:ring-zinc-900 shadow-md">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="rounded-xl bg-[#F6823A]/10 text-[#F6823A] font-black">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mt-3 rounded-[1.5rem] p-2 border-border/40 shadow-2xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-3 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black tracking-tight">{profile?.full_name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {profile?.role === 'manager' ? 'Organization Lead' : 'Team Contributor'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="p-1 space-y-1">
              <DropdownMenuItem className="rounded-xl py-3 px-3 font-bold text-xs gap-3 cursor-pointer">
                <User className="w-4 h-4 text-muted-foreground" /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-3 px-3 font-bold text-xs gap-3 cursor-pointer">
                <Settings className="w-4 h-4 text-muted-foreground" /> Team Preferences
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="p-1">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl py-3 px-3 font-black text-xs gap-3 cursor-pointer" 
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" /> Sign Out Session
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
