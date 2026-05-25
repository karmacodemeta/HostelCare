"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={cn("p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800", className)}>
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
        className
      )}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
      )}
    </button>
  )
}
