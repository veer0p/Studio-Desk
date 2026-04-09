// components/portal/client-bookings/ClientBookingDetail.tsx
"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle, FileText, Image as ImageIcon, MapPin, Users, CalendarClock, CreditCard } from "lucide-react"

export function ClientBookingDetail({ studioSlug, bookingId }: { studioSlug: string, bookingId: string }) {

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      
      {/* Header */}
      <div className="mb-6">
        <Link href={`/portal/${studioSlug}/bookings`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Bookings
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Priya & Raj Wedding</h1>
             <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
               <MapPin className="w-4 h-4" /> Taj Mahal Palace, Mumbai
             </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 w-fit">
            Upcoming
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Left Col */}
        <div className="space-y-6">
          
          {/* Event Details Map */}
          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <CalendarClock className="w-5 h-5 text-[hsl(var(--portal-primary))]" /> Shoot Details
            </h3>
            <div className="space-y-4 text-sm">
               <div className="grid grid-cols-3">
                 <span className="text-muted-foreground">Date:</span>
                 <span className="col-span-2 font-medium">Saturday, 25 Apr 2026</span>
               </div>
               <div className="grid grid-cols-3">
                 <span className="text-muted-foreground">Time:</span>
                 <span className="col-span-2 font-medium">10:00 AM - 6:00 PM</span>
               </div>
               <div className="grid grid-cols-3">
                 <span className="text-muted-foreground">Package:</span>
                 <span className="col-span-2 font-medium">Premium Wedding Film & Photo</span>
               </div>
            </div>
          </div>

          {/* Assigned Team */}
          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <Users className="w-5 h-5 text-[hsl(var(--portal-primary))]" /> Your Dedicated Team
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">R</div>
                <div>
                  <p className="text-sm font-semibold">Rahul Sharma</p>
                  <p className="text-xs text-muted-foreground">Lead Photographer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">N</div>
                <div>
                  <p className="text-sm font-semibold">Neha K.</p>
                  <p className="text-xs text-muted-foreground">Cinematographer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Docs & Files */}
          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <FileText className="w-5 h-5 text-[hsl(var(--portal-primary))]" /> Documents & Finance
            </h3>
            <div className="space-y-2">
               <Link href={`/portal/${studioSlug}/proposals/1`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                   <div>
                     <p className="text-sm font-medium">Approved Proposal</p>
                     <p className="text-xs text-muted-foreground">PDF Copy</p>
                   </div>
                 </div>
               </Link>
               <Link href={`/portal/${studioSlug}/contracts/101`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                   <div>
                     <p className="text-sm font-medium">Service Contract</p>
                     <p className="text-xs text-muted-foreground text-amber-600 font-semibold">Signature Pending</p>
                   </div>
                 </div>
               </Link>
               <Link href={`/portal/${studioSlug}/invoices/202`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                   <div>
                     <p className="text-sm font-medium">Invoice INV-2026-047</p>
                     <p className="text-xs text-red-600 font-semibold">Payment Due: ₹45,000</p>
                   </div>
                 </div>
               </Link>
            </div>
          </div>

        </div>

        {/* Right Col */}
        <div className="space-y-6">
          
          {/* Timeline Engine */}
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm relative">
             <h3 className="font-semibold text-foreground tracking-tight mb-6">Booking Timeline</h3>
             
             <div className="absolute left-[39px] top-[74px] bottom-8 w-0.5 bg-border/60" />

             <div className="space-y-6 relative z-10">
               
               <div className="flex gap-4">
                 <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
                 <div>
                   <p className="text-sm font-semibold">Booking Confirmed</p>
                   <p className="text-xs text-muted-foreground mt-0.5">14 Feb 2026</p>
                 </div>
               </div>
               
               <div className="flex gap-4 opacity-50">
                 <div className="w-6 h-6 rounded-full bg-background border-2 border-muted flex items-center justify-center shrink-0 mt-0.5"><Circle className="w-2.5 h-2.5 fill-muted-foreground text-muted-foreground" /></div>
                 <div>
                   <p className="text-sm font-semibold">Contract Signed</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Pending your signature</p>
                 </div>
               </div>

               <div className="flex gap-4 opacity-50">
                 <div className="w-6 h-6 rounded-full bg-background border-2 border-muted flex items-center justify-center shrink-0 mt-0.5"><Circle className="w-2.5 h-2.5 fill-muted-foreground text-muted-foreground" /></div>
                 <div>
                   <p className="text-sm font-semibold">Advance Payment</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
                 </div>
               </div>

               <div className="flex gap-4 opacity-50">
                 <div className="w-6 h-6 rounded-full bg-background border-2 border-muted flex items-center justify-center shrink-0 mt-0.5"><Circle className="w-2.5 h-2.5 fill-muted-foreground text-muted-foreground" /></div>
                 <div>
                   <p className="text-sm font-semibold">Shoot Day</p>
                   <p className="text-xs text-muted-foreground mt-0.5">25 Apr 2026</p>
                 </div>
               </div>

               <div className="flex gap-4 opacity-50">
                 <div className="w-6 h-6 rounded-full bg-background border-2 border-muted flex items-center justify-center shrink-0 mt-0.5"><Circle className="w-2.5 h-2.5 fill-muted-foreground text-muted-foreground" /></div>
                 <div>
                   <p className="text-sm font-semibold">Gallery Delivery</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Expected 10 May 2026</p>
                 </div>
               </div>

             </div>
          </div>

           {/* Gallery Banner */}
          <div className="bg-muted/10 border border-[hsl(var(--portal-primary))/30] rounded-xl p-5 shadow-sm text-center">
            <div className="w-12 h-12 bg-[hsl(var(--portal-primary))/20] rounded-full flex items-center justify-center mx-auto mb-3">
               <ImageIcon className="w-6 h-6 text-[hsl(var(--portal-primary))]" />
            </div>
            <h3 className="font-semibold text-foreground tracking-tight">Your Event Gallery</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Gallery will securely unlock here once your event concludes and processing completes.</p>
            <button className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--portal-primary))] opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
