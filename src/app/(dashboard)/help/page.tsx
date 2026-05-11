'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { HelpCircle, Book, MessageSquare, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HelpPage() {
  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of StandFlow and how to set up your first team.',
      icon: Zap,
      color: 'text-[#F6823A]',
      bg: 'bg-[#F6823A]/10'
    },
    {
      title: 'Knowledge Base',
      description: 'Detailed documentation on all features and configurations.',
      icon: Book,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Contact Support',
      description: 'Need help? Our team is available 24/7 for technical assistance.',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    }
  ]

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-[#020101] dark:text-white">Support Hub</h1>
            <Badge className="bg-[#F6823A]/10 text-[#F6823A] border-none rounded-lg font-black text-[10px] px-2.5 py-1 uppercase tracking-widest">Self Service</Badge>
          </div>
          <p className="text-muted-foreground font-medium">Find answers, learn workflows, and get the most out of StandFlow.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.title} className="border-none bg-white dark:bg-[#020101] rounded-[2.5rem] shadow-xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-border/10">
            <CardContent className="p-10 space-y-8">
              <div className={`${cat.bg} w-16 h-16 rounded-2xl flex items-center justify-center`}>
                <cat.icon className={`w-8 h-8 ${cat.color}`} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-[#020101] dark:text-white">{cat.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{cat.description}</p>
              </div>
              <Button variant="ghost" className="w-full h-14 rounded-xl border border-border/50 font-black text-[10px] uppercase tracking-[0.2em] gap-3">
                Explore <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Placeholder */}
      <div className="bg-[#020101] dark:bg-white rounded-[3rem] p-12 text-white dark:text-[#020101] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight">Still have questions?</h2>
          <p className="text-white/60 dark:text-[#020101]/60 font-medium text-lg max-w-md">Our community and support team are here to help you unblock your team's potential.</p>
        </div>
        <Button className="h-16 px-10 rounded-2xl bg-white dark:bg-[#020101] text-[#020101] dark:text-white font-black text-xs uppercase tracking-widest hover:bg-white/90">
          Chat with an Expert
        </Button>
      </div>
    </div>
  )
}
