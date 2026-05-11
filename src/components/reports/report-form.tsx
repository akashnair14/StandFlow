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
import { Loader2, Send, Lightbulb, Smile, Meh, Frown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  mood: z.enum(['on-track', 'stuck', 'blocked']),
  completed: z.string().min(10, 'Please describe your achievements in more detail'),
  planned: z.string().min(10, 'Please describe your focus for today'),
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
      if (!user) throw new Error('Not authenticated')

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

      toast.success('Daily report submitted!')
      router.refresh()
      // Dispatch event to close form if it's in a modal
      window.dispatchEvent(new CustomEvent('close-report-form'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report')
    } finally {
      setIsLoading(false)
    }
  }

  const moods = [
    { value: 'on-track', label: 'On Track', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { value: 'stuck', label: 'Feeling Stuck', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { value: 'blocked', label: 'Blocked', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black tracking-tighter text-[#020101] dark:text-white">Daily Standup</h1>
        <p className="text-muted-foreground font-medium text-lg">Update your team in under 30 seconds.</p>
      </div>

      <div className="bg-[#1A2332] rounded-3xl p-8 flex items-start gap-6 shadow-2xl relative overflow-hidden group">
        <div className="bg-white/10 p-3 rounded-2xl">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Deep Work Tip</p>
          <p className="text-white/90 font-bold text-lg italic leading-relaxed">
            "Single-tasking is the secret of deep work. Close your Slack for the next 60 minutes."
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-[#020101]">
        <CardContent className="p-16 space-y-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Mood Selection */}
              <div className="space-y-8">
                <FormLabel className="text-xl font-black tracking-tight text-center block">How are you feeling today?</FormLabel>
                <div className="grid grid-cols-3 gap-6">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => form.setValue('mood', m.value as any)}
                      className={cn(
                        "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 group",
                        form.watch('mood') === m.value 
                          ? cn(m.bg, m.border, "scale-105")
                          : "border-secondary bg-secondary/20 hover:bg-secondary/40 hover:border-border"
                      )}
                    >
                      <m.icon className={cn("w-10 h-10 transition-transform group-hover:scale-110", form.watch('mood') === m.value ? m.color : "text-muted-foreground")} />
                      <span className={cn("font-black text-sm tracking-tight", form.watch('mood') === m.value ? "text-foreground" : "text-muted-foreground")}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <FormLabel className="text-sm font-black text-muted-foreground uppercase tracking-widest">What did you accomplish yesterday?</FormLabel>
                      </div>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Focus on results, not tasks..."
                          className="min-h-[140px] rounded-2xl bg-secondary/30 border-border/50 focus:ring-primary/20 transition-all p-6 text-base font-medium resize-none leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planned"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <FormLabel className="text-sm font-black text-muted-foreground uppercase tracking-widest">What is your focus for today?</FormLabel>
                      </div>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="List your most important task..."
                          className="min-h-[140px] rounded-2xl bg-secondary/30 border-border/50 focus:ring-primary/20 transition-all p-6 text-base font-medium resize-none leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blockers"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <FormLabel className="text-sm font-black text-muted-foreground uppercase tracking-widest">Any blockers?</FormLabel>
                      </div>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="None"
                          className="min-h-[100px] rounded-2xl bg-secondary/30 border-border/50 focus:ring-primary/20 transition-all p-6 text-base font-medium resize-none leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-20 bg-[#00695C] hover:bg-[#004D40] text-white rounded-3xl font-black text-xl gap-3 shadow-2xl shadow-teal-500/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>Submit Daily Report <Send className="w-6 h-6" /></>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
