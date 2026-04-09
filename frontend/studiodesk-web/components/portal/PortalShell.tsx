"use client"

import { ReactNode, useEffect, useState } from "react"
import { PortalNav } from "./PortalNav"
import { usePathname } from "next/navigation"

export function PortalShell({ children, studioSlug }: { children: ReactNode, studioSlug: string }) {
  const pathname = usePathname()
  const isLogin = pathname.includes('/login')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.style.setProperty('--portal-primary', '221.2 83.2% 53.3%')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 font-sans relative">
      <PortalNav studioSlug={studioSlug} />

      <main className="flex-1 flex flex-col w-full h-full relative">
        <div className={`w-full mx-auto ${isLogin ? 'max-w-md my-auto px-4 py-12' : 'max-w-3xl px-4 md:px-6 py-8 md:py-12'}`}>
          {children}
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-border/40 bg-card py-6 mt-auto shrink-0">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase font-semibold">
            Powered by StudioDesk
          </p>
          {mounted && (
            <p className="text-xs text-muted-foreground">
              Need help? Contact {studioSlug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")} studio directly.
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
