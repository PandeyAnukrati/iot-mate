"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import clsx from "clsx"

export function SmartLampThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [auto, setAuto] = useState(true)

  const lightModeStart = 7
  const darkModeStart = 19

  useEffect(() => {
    if (!auto) return

    const updateTheme = () => {
      const hour = new Date().getHours()
      if (hour >= darkModeStart || hour < lightModeStart) {
        setTheme("dark")
      } else {
        setTheme("light")
      }
    }

    updateTheme()
    const interval = setInterval(updateTheme, 60000)
    return () => clearInterval(interval)
  }, [auto, setTheme])

  const toggleManual = () => {
    setAuto(false)
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        onClick={toggleManual}
        className={clsx(
          "relative p-4 rounded-full shadow-md transition-all duration-300 ease-in-out",
          theme === "light"
            ? "bg-yellow-100 animate-glow"
            : "bg-gray-800 hover:bg-gray-700"
        )}
      >
        <Lightbulb
          className={clsx(
            "w-6 h-6 transition-colors duration-300",
            theme === "light" ? "text-yellow-500" : "text-gray-500"
          )}
        />
        <span className="sr-only">Toggle Theme</span>
      </Button>

      <div className="text-sm">
        {auto ? (
          <span className="text-muted-foreground">Auto theme: based on time</span>
        ) : (
          <span className="text-blue-600">Manual override active</span>
        )}
      </div>
    </div>
  )
}
