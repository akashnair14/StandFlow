'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Zap, ArrowRight, ShieldCheck, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const result = await updatePassword(formData)
      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
      }
    } catch (error) {
      if ((error as any)?.message !== 'NEXT_REDIRECT') {
        toast.error('An unexpected error occurred. Please try again.')
        setIsLoading(false)
      }
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
              Secure <br /> Your <span className="text-gradient">Account.</span>
            </h2>
            <p className="text-xl font-medium text-muted-foreground max-w-md leading-relaxed">
              Create a strong new password to protect your team's focus and reclaim your deep work cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-10 lg:p-20 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter text-[#020101] dark:text-white">New Password</h1>
            <p className="text-lg font-medium text-muted-foreground">Set a secure password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" title="Password" className="font-black text-[10px] uppercase tracking-widest ml-1 text-muted-foreground/70">New Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-16 rounded-2xl bg-secondary/30 border-border/50 focus:ring-[#F6823A]/20 transition-all px-6 text-base font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" title="Confirm Password" className="font-black text-[10px] uppercase tracking-widest ml-1 text-muted-foreground/70">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
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
                <>Update Password <ArrowRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
