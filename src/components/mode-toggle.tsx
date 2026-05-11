"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@teispace/next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-xl text-muted-foreground hover:bg-[#F6823A]/10 hover:text-[#F6823A] h-11 w-11 transition-all relative overflow-hidden"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
