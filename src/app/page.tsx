'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Zap, CheckCircle2, ArrowRight, GitBranch as Github, Users, Sparkles, Layout, Shield, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ModeToggle } from '@/components/mode-toggle'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <header className="px-6 h-20 flex items-center justify-between sticky top-0 z-50 glass">
        <Link className="flex items-center justify-center gap-2.5 group" href="/">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20"
          >
            <Zap className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="font-black text-2xl tracking-tighter">
            StandFlow
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <ModeToggle />
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="/login">
            Log in
          </Link>
          <Link 
            href="/signup"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-[#020101] dark:bg-white dark:text-black hover:opacity-90 transition-opacity text-white rounded-xl px-6 h-11 font-black shadow-lg"
            )}
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        <section className="relative w-full py-24 md:py-32 lg:py-40 px-6">
          {/* Large Soft Radial Gradients */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#F6823A] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.15] animate-blob" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#E6AA89] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.1] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-20 left-1/3 w-[700px] h-[700px] bg-[#7C686C] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.1] animate-blob animation-delay-4000" />

          <div className="container mx-auto max-w-6xl relative">
            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="space-y-10"
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Elevate Team Velocity
                </div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] text-[#020101] dark:text-white">
                  Sync your team <br />
                  <span className="text-gradient">without the noise.</span>
                </h1>
                <p className="max-w-[540px] text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed">
                  The minimalist standup tool for high-performance teams who value flow over meetings.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <Link 
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "bg-[#F6823A] hover:bg-[#F6823A]/90 text-white rounded-2xl h-18 px-12 text-xl font-black shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                    )}
                  >
                    Get Started Free <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative hidden lg:block"
              >
                <div className="glass-card rounded-[3rem] p-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
                  <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-10 space-y-8 aspect-[4/5] flex flex-col justify-between overflow-hidden">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#F6823A]/10 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-[#F6823A]" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 bg-secondary rounded-full" />
                          <div className="h-3 w-20 bg-secondary/50 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-px w-full bg-border/50" />
                        <p className="text-2xl font-black tracking-tight leading-tight">
                          "StandFlow saved us <span className="text-[#F6823A]">4 hours</span> of meetings every week."
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-secondary/20">
                          <div className="w-10 h-10 rounded-full bg-[#E6AA89]/20" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3 w-3/4 bg-muted rounded-full" />
                            <div className="h-2 w-1/2 bg-muted/50 rounded-full" />
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-[#F6823A]/40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-32 relative z-10">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-3">
              {[
                { icon: Zap, title: "Instant Reports", desc: "Submit your daily work in under 30 seconds with a focus-driven UI.", color: "bg-[#F6823A]" },
                { icon: Layout, title: "Team Pulse", desc: "Get a bird's eye view of blockers and progress without the noise.", color: "bg-[#E6AA89]" },
                { icon: Shield, title: "Deep Focus", desc: "Protect your team's flow state by eliminating unnecessary sync meetings.", color: "bg-[#7C686C]" }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-6 p-8"
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform", feature.color)}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 px-6">
          <div className="container mx-auto max-w-4xl text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-[#020101] dark:text-white leading-[0.95]">
              Ready to claim your <span className="text-[#F6823A]">time back?</span>
            </h2>
            <div className="pt-6">
              <Link 
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "bg-[#020101] dark:bg-white dark:text-black text-white h-20 px-16 text-2xl font-black rounded-3xl hover:opacity-90 shadow-2xl transition-all active:scale-95"
                )}
              >
                Join StandFlow Today
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-border/50 px-6 bg-[#FCE9E0] dark:bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex flex-col items-center md:items-start gap-6">
            <Link className="flex items-center justify-center gap-3" href="/">
              <div className="bg-[#F6823A] p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">StandFlow</span>
            </Link>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Built for the future of work.</p>
          </div>
          <div className="flex gap-12">
            {["Twitter", "GitHub", "Support"].map((item) => (
              <Link key={item} className="text-sm font-black text-muted-foreground hover:text-[#F6823A] transition-colors" href="#">{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
