"use client"

import OnboardingWizard from "@/components/onboarding/OnboardingWizard"
import { Camera, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-start p-4 sm:p-8 md:p-12 relative overflow-x-hidden">
      {/* Dynamic Header */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-12 z-10">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground/90">
            StudioDesk
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex items-center justify-center z-10">
        <OnboardingWizard />
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] -z-10" />
    </div>
  )
}
