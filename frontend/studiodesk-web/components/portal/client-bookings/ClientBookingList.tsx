// components/portal/client-bookings/ClientBookingList.tsx
"use client"

import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

export function ClientBookingList({ studioSlug }: { studioSlug: string }) {
  
  const bookings = [
    {
      id: "501",
      title: "Priya & Raj Wedding",
      date: "25 Apr 2026",
      venue: "Taj Mahal Palace, Mumbai",
      status: "Upcoming",
      pkg: "Premium Wedding Film & Photo",
      amount: "₹4,50,000"
    },
    {
      id: "402",
      title: "Pre-Wedding Shoot",
      date: "10 Mar 2026",
      venue: "Sanjay Gandhi National Park",
      status: "Completed",
      pkg: "Cinematic Pre-Wedding",
      amount: "₹85,000"
    }
  ]

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your events and deliverables securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map(book => (
          <Link href={`/portal/${studioSlug}/bookings/${book.id}`} key={book.id} className="block transition-transform hover:-translate-y-0.5">
            <div className="w-full bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/40] rounded-xl p-5 shadow-sm group">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[hsl(var(--portal-primary))] transition-colors">{book.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {book.date}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {book.venue.split(',')[0]}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    book.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {book.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                 <div>
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Package</p>
                   <p className="text-sm font-semibold">{book.pkg}</p>
                 </div>
                 <div className="text-right flex items-center gap-3">
                   <span className="text-sm font-semibold text-muted-foreground">View Details</span>
                   <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-[hsl(var(--portal-primary))] group-hover:text-white transition-colors">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                 </div>
              </div>

            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
