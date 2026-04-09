"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { UpcomingShoot } from "./UpcomingShoot"
import { ActionItems } from "./ActionItems"
import { CalendarCheck, FileText, Image as ImageIcon, Phone } from "lucide-react"

export function ClientHome({ studioSlug }: { studioSlug: string }) {
  const { user } = useAuth()

  const studioName = studioSlug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")

  const quickLinks = [
    { label: "Bookings", icon: CalendarCheck, href: `/portal/${studioSlug}/bookings` },
    { label: "Invoices", icon: FileText, href: `/portal/${studioSlug}/invoices` },
    { label: "Galleries", icon: ImageIcon, href: `/portal/${studioSlug}/gallery` },
    { label: "Contact", icon: Phone, href: `#contact`, external: false },
  ]

  const clientName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest"

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Greeting Boundary */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hello, {clientName}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5">Your personal portal with <span className="font-semibold text-foreground">{studioName}</span></p>
      </div>

      {/* Main Feature Component */}
      <UpcomingShoot studioSlug={studioSlug} />

      {/* Grid Split Structure */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Left Column: Actions */}
        <div className="md:col-span-8 space-y-4">
          <ActionItems studioSlug={studioSlug} />
        </div>

        {/* Right Column: Quick Links */}
        <div className="md:col-span-4 space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href} className="flex items-center gap-3 p-3.5 bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/50] rounded-xl transition-all hover:bg-muted/30 shadow-sm group">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--portal-primary))/10] flex items-center justify-center text-[hsl(var(--portal-primary))] group-hover:scale-110 transition-transform">
                  <link.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
