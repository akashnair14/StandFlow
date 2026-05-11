'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Rss, 
  FileText, 
  Users, 
  Settings, 
  Zap,
  HelpCircle,
  LogOut,
  Plus,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@teispace/next-themes'
import { Profile } from '@/types'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Feed',
      icon: Rss,
      href: '/reports',
      active: pathname === '/reports',
    },
    {
      label: 'My Reports',
      icon: FileText,
      href: '/my-reports',
      active: pathname === '/my-reports',
    },
    {
      label: 'Team',
      icon: Users,
      href: '/team',
      active: pathname === '/team',
    },
  ]

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-[#020101] border-r border-border/40">
      <div className="p-10 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-[#F6823A] p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter block leading-none">StandFlow</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 block">Deep Work Mode</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-8">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-sm font-black transition-all",
              route.active 
                ? "bg-[#F6823A]/10 text-[#F6823A] shadow-sm" 
                : "text-muted-foreground hover:text-[#020101] dark:hover:text-white hover:bg-secondary/50"
            )}
          >
            <route.icon className={cn("w-5 h-5", route.active ? "text-[#F6823A]" : "text-muted-foreground/70")} />
            {route.label}
          </Link>
        ))}
      </nav>

      <div className="px-6 pb-4">
        <Button 
          className="w-full h-14 rounded-2xl bg-[#00695C] hover:bg-[#004D40] text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-teal-500/10"
          onClick={() => window.dispatchEvent(new CustomEvent('open-report-form'))}
        >
          <Plus className="w-4 h-4" /> Submit Report
        </Button>
      </div>

      <div className="p-8 pt-4 space-y-1">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-[#020101] dark:hover:text-white transition-colors group w-full text-left"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-muted-foreground/50 group-hover:text-[#F6823A]" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground/50 group-hover:text-[#F6823A]" />
          )}
          <span className="text-sm font-black">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <Link href="/help" className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-[#020101] dark:hover:text-white transition-colors group">
          <HelpCircle className="w-5 h-5 text-muted-foreground/50 group-hover:text-[#F6823A]" />
          <span className="text-sm font-black">Help</span>
        </Link>
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors group w-full text-left"
        >
          <LogOut className="w-5 h-5 text-muted-foreground/50 group-hover:text-destructive" />
          <span className="text-sm font-black">Logout</span>
        </button>
      </div>
    </aside>
  )
}
