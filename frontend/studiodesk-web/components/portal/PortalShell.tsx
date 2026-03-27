"use client"

import { ReactNode } from "react"
import { PortalNav } from "./PortalNav"
import { usePathname } from "next/navigation"
import { Phone, MessageCircle } from "lucide-react"

export function PortalShell({ children, studioSlug }: { children: ReactNode, studioSlug: string }) {
  const pathname = usePathname()
  const isLogin = pathname.includes('/login')

  return (
    <div className="min-h-screen flex flex-col bg-muted/5 font-sans relative">
      {/* Dynamic CSS Var injection mock matching studio brand overrides securely */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --portal-primary: 221.2 83.2% 53.3%;
        }
      `}} />

      <PortalNav studioSlug={studioSlug} />
      
      <main className="flex-1 flex flex-col w-full h-full relative">
        <div className={`w-full mx-auto ${isLogin ? 'max-w-md my-auto px-4 py-12' : 'max-w-3xl px-4 md:px-6 py-8 md:py-12'}`}>
          {children}
        </div>
      </main>

      {/* Global Footer Banner */}
      <footer className="w-full border-t border-border/40 bg-card py-6 mt-auto shrink-0">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
             <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-foreground transition-colors"><Phone className="w-4 h-4" /> +91 98765 43210</a>
             <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#25D366] transition-colors"><MessageCircle className="w-4 h-4" /> WhatsApp Us</a>
          </div>
          <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase font-semibold">
            Powered by StudioDesk
          </p>
        </div>
      </footer>
    </div>
  )
}
