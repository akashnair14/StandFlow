'use client'

import { useState } from 'react'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Zap, ArrowRight, ShieldCheck, GitBranch as Github, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    try {
      const result = await login(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-[#020101]">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-between p-20 bg-[#FCE9E0] dark:bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#F6823A] rounded-full filter blur-[140px] opacity-[0.15] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#7C686C] rounded-full filter blur-[140px] opacity-[0.15] animate-blob animation-delay-2000" />
        </div>

        <Link href="/" className="inline-flex items-center gap-3 relative z-10">
          <div className="bg-[#F6823A] p-3 rounded-2xl shadow-xl shadow-orange-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-3xl tracking-tighter text-[#020101] dark:text-white">StandFlow</span>
        </Link>

        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-7xl font-black tracking-tight text-[#020101] dark:text-white leading-[1.1]">
              Deep Work <br /> Starts <span className="text-gradient">Here.</span>
            </h2>
            <p className="text-xl font-medium text-muted-foreground max-w-md leading-relaxed">
              Join 5,000+ teams using StandFlow to cut meeting time by 70% and reclaim their focus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10">
            <div className="space-y-2">
              <p className="text-4xl font-black text-[#F6823A]">85%</p>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Team Participation</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-[#7C686C]">30s</p>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Average Submission</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10 text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Support</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-10 lg:p-20 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter text-[#020101] dark:text-white">Sign In</h1>
            <p className="text-lg font-medium text-muted-foreground">Enter your details to continue your work.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest ml-1 text-muted-foreground/70">Work Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  className="h-16 rounded-2xl bg-secondary/30 border-border/50 focus:ring-[#F6823A]/20 transition-all px-6 text-base font-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="Password" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/70">Password</Label>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-[#F6823A] hover:opacity-80 transition-opacity">Forgot Password?</Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-16 rounded-2xl bg-secondary/30 border-border/50 focus:ring-[#F6823A]/20 transition-all px-6 text-base font-medium"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#020101] dark:bg-white dark:text-[#020101] hover:opacity-90 text-white font-black h-18 rounded-2xl shadow-2xl transition-all active:scale-[0.98] text-lg gap-3" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>Sign In to StandFlow <ArrowRight className="w-5 h-5" /></>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="bg-white dark:bg-[#020101] px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2">
                <Github className="w-4 h-4" /> Github
              </Button>
              <Button variant="outline" type="button" className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-bold text-muted-foreground">
            New to StandFlow?{' '}
            <Link href="/signup" className="text-[#F6823A] hover:underline">
              Create an account for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
