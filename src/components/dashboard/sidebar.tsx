'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Rss, 
  FileText, 
  Users, 
  Zap,
  HelpCircle,
  LogOut,
  Plus,
  Sun,
  Moon,
  Command
} from 'lucide-react'
import { useTheme } from '@teispace/next-themes'
import { Profile } from '@/types'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  profile: Profile | null
  className?: string
}

export function Sidebar({ profile, className }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      label: 'Workspace',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Daily Standups',
      icon: Rss,
      href: '/reports',
      active: pathname === '/reports',
    },
    ...(profile?.role !== 'manager' ? [{
      label: 'My Reports',
      icon: FileText,
      href: '/my-reports',
      active: pathname === '/my-reports',
    }] : []),
    {
      label: 'My Team',
      icon: Users,
      href: '/team',
      active: pathname === '/team',
    },
  ]

  return (
    <aside className={cn("flex flex-col w-64 bg-card border-r border-border/40 blueprint-bg h-full", className)}>
      <div className="p-8 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-primary p-2 rounded-2xl group-hover:rotate-12 transition-all shadow-[0_0_20px_-5px_rgba(76,215,246,0.4)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter block leading-none text-foreground">StandFlow</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mt-1 block">Workspace</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        <div className="px-4 mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Main Menu</span>
        </div>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-black transition-all group relative overflow-hidden",
              route.active 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            )}
          >
            {route.active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(76,215,246,0.5)]" />
            )}
            <route.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", route.active ? "text-primary" : "text-muted-foreground/40")} />
            <span className="font-heading tracking-tight">{route.label}</span>
          </Link>
        ))}
      </nav>

      {profile?.role !== 'manager' && (
        <div className="px-4 pb-6">
          <Button 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[9px] uppercase tracking-[0.2em] gap-3 shadow-[0_0_40px_-10px_rgba(76,215,246,0.4)] transition-all hover:scale-[1.02]"
            onClick={() => window.dispatchEvent(new CustomEvent('open-report-form'))}
          >
            <Plus className="w-4 h-4" /> Submit Update
          </Button>
        </div>
      )}

      <div className="p-6 pt-4 space-y-0.5 bg-secondary/10 border-t border-border/10">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors group w-full text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary" />
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <Link href="/help" className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors group">
          <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
        </Link>

        <button 
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors group w-full text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
            <LogOut className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-destructive" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
