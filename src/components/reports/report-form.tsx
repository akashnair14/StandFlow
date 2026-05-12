'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, Lightbulb, ShieldCheck, ShieldAlert, Shield, Target, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  mood: z.enum(['on-track', 'stuck', 'blocked']),
  completed: z.string().min(10, 'Please provide more details on your completed tasks.'),
  planned: z.string().min(10, 'Please provide more details on your planned tasks.'),
  blockers: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ReportForm({ teamId }: { teamId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: 'on-track',
      completed: '',
      planned: '',
      blockers: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication Failure')

      if (!teamId || teamId.trim() === '') {
        throw new Error('You are not currently assigned to any team. Please join or create a team to post updates.')
      }

      const { error } = await supabase.from('reports').insert({
        user_id: user.id,
        team_id: teamId,
        content: {
          ...values,
          completed: values.completed.split('\n').filter(i => i.trim()),
          planned: values.planned.split('\n').filter(i => i.trim()),
          blockers: values.blockers?.split('\n').filter(i => i.trim()) || [],
        },
        date: new Date().toISOString().split('T')[0],
      })

      if (error) throw error

      toast.success('Update Submitted', {
        description: 'Your daily update has been successfully submitted.'
      })
      router.refresh()
      window.dispatchEvent(new CustomEvent('close-report-form'))
    } catch (error: any) {
      toast.error('Submission Failed', {
        description: error.message || 'Failed to submit your daily update.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const moods = [
    { value: 'on-track', label: 'ON TRACK', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { value: 'stuck', label: 'STUCK', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { value: 'blocked', label: 'BLOCKED', icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  ]

  return (
    <div className="mx-auto space-y-8">
      {/* Top Banner: Status & Tip */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Status Selection */}
        <div className="flex-1 bg-secondary/20 rounded-2xl p-4 border border-border/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Status</span>
            <span className="text-[10px] font-bold text-foreground/40 italic">How's it going?</span>
          </div>
          <div className="flex gap-2">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => form.setValue('mood', m.value as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group",
                  form.watch('mood') === m.value 
                    ? cn(m.bg, m.border, "shadow-sm")
                    : "border-border/5 bg-background/40 hover:bg-background/60"
                )}
              >
                <m.icon className={cn("w-4 h-4 transition-all", form.watch('mood') === m.value ? m.color : "text-muted-foreground/30")} />
                <span className={cn("font-black text-[9px] tracking-wider uppercase", form.watch('mood') === m.value ? "text-foreground" : "text-muted-foreground/40")}>
                  {m.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Tip */}
        <div className="lg:w-1/3 bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[11px] font-medium text-foreground/70 italic leading-snug">
            "Focus on what matters. Clear communication leads to better team alignment."
          </p>
        </div>
      </div>

      {/* Main Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                    <FormLabel className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Completed</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="What did you finish?..."
                      className="min-h-[140px] rounded-xl bg-secondary/10 border-border/10 focus:border-primary/40 focus:bg-background/40 transition-all p-4 text-sm font-bold resize-none placeholder:text-muted-foreground/20"
                    />
                  </FormControl>
                  <FormMessage className="text-[8px] font-black uppercase tracking-tighter text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planned"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-3 h-3 text-primary" />
                    </div>
                    <FormLabel className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Planned</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="What's next on your list?..."
                      className="min-h-[140px] rounded-xl bg-secondary/10 border-border/10 focus:border-primary/40 focus:bg-background/40 transition-all p-4 text-sm font-bold resize-none placeholder:text-muted-foreground/20"
                    />
                  </FormControl>
                  <FormMessage className="text-[8px] font-black uppercase tracking-tighter text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blockers"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-destructive" />
                    </div>
                    <FormLabel className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Blockers</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Any hurdles in your way?..."
                      className="min-h-[140px] rounded-xl bg-secondary/10 border-border/10 focus:border-destructive/40 focus:bg-background/40 transition-all p-4 text-sm font-bold resize-none placeholder:text-muted-foreground/20"
                    />
                  </FormControl>
                  <FormMessage className="text-[8px] font-black uppercase tracking-tighter text-destructive" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Your update will be visible to your team members</p>
            </div>
            <Button 
              type="submit" 
              className="w-full sm:w-64 h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Send Update <Send className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
