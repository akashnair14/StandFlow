'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2, Zap, ArrowRight, ShieldCheck, Globe, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    try {
      const result = await resetPassword(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
        setIsSent(true)
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
              Reclaim <br /> Your <span className="text-gradient">Focus.</span>
            </h2>
            <p className="text-xl font-medium text-muted-foreground max-w-md leading-relaxed">
              Don't let a lost password stop your deep work cycle. We'll get you back in seconds.
            </p>
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
            <h1 className="text-5xl font-black tracking-tighter text-[#020101] dark:text-white">Reset Password</h1>
            <p className="text-lg font-medium text-muted-foreground">Enter your email and we'll send you a reset link.</p>
          </div>

          {!isSent ? (
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
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#020101] dark:bg-white dark:text-[#020101] hover:opacity-90 text-white font-black h-18 rounded-2xl shadow-2xl transition-all active:scale-[0.98] text-lg gap-3" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2rem] bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Mail className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-orange-950 dark:text-orange-50">Check Your Email</h3>
                <p className="text-orange-900/70 dark:text-orange-400/70 font-medium">
                  We've sent a recovery link to your inbox. Please follow the instructions to reset your password.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-950 dark:text-orange-50 font-black uppercase text-xs tracking-widest"
                onClick={() => setIsSent(false)}
              >
                Try Another Email
              </Button>
            </motion.div>
          )}

          <p className="text-center text-sm font-bold text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/login" className="text-[#F6823A] hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
