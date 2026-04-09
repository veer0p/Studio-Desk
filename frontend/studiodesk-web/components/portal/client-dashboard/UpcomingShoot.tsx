// components/portal/client-dashboard/UpcomingShoot.tsx
"use client"

import { Calendar, Clock, MapPin, User, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function UpcomingShoot({ studioSlug }: { studioSlug: string }) {
  
  const hasShoot = true

  if (!hasShoot) {
    return (
      <div className="w-full bg-[hsl(var(--portal-primary))/5] border border-[hsl(var(--portal-primary))/20] rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">No upcoming shoots</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">Contact us to book your next amazing event seamlessly.</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all" asChild>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
             <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Studio
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-[hsl(var(--portal-primary))] text-primary-foreground rounded-2xl overflow-hidden shadow-md relative">
      {/* Decorative Blur BG Native */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Calendar className="w-48 h-48 rotate-12 translate-x-12 -translate-y-12" />
      </div>
      
      <div className="relative p-6 sm:p-8">
        <div className="inline-flex items-center rounded-sm bg-white/20 px-2.5 py-0.5 text-xs font-semibold mb-3 tracking-wide backdrop-blur-sm">
          Your Next Shoot
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Priya & Raj Wedding</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base mb-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
               <Calendar className="w-4 h-4 text-white" />
             </div>
             <div>
               <p className="font-semibold">Saturday, 25 April 2026</p>
               <p className="text-white/70 text-xs mt-0.5">In 9 Days</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
               <Clock className="w-4 h-4 text-white" />
             </div>
             <div>
               <p className="font-semibold">10:00 AM Onwards</p>
               <p className="text-white/70 text-xs mt-0.5">Duration: 8 Hrs</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
               <MapPin className="w-4 h-4 text-white" />
             </div>
             <div className="truncate pr-4">
               <p className="font-semibold truncate">Taj Mahal Palace</p>
               <p className="text-white/70 text-xs mt-0.5 truncate">Apollo Bunder, Mumbai</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
               <User className="w-4 h-4 text-white" />
             </div>
             <div>
               <p className="font-semibold">Team Sharma</p>
               <p className="text-white/70 text-xs mt-0.5">Assigned: Rahul, Neha</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           <Button variant="secondary" className="w-full sm:w-auto font-semibold" asChild>
             <Link href={`/portal/${studioSlug}/bookings/501`}>
               View Booking Details <ArrowRight className="w-4 h-4 ml-2" />
             </Link>
           </Button>
           <Button className="w-full sm:w-auto bg-emerald-600/20 hover:bg-emerald-600/30 text-white border border-emerald-600/50 transition-colors font-medium backdrop-blur-sm" asChild>
             <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Studio
             </a>
           </Button>
        </div>
      </div>
    </div>
  )
}
