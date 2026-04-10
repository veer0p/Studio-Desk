"use client"

import Link from "next/link"
import { usePortalAuth } from "@/lib/portal-auth"
import { fetchClientBookings, ClientPortalBooking } from "@/lib/api"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

const statusStyles: Record<string, string> = {
  upcoming: "bg-blue-500/10 text-blue-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
  postponed: "bg-amber-500/10 text-amber-600",
}

export function ClientBookingList({ studioSlug }: { studioSlug: string }) {
  const { user } = usePortalAuth()
  const { data: bookings, isLoading, error } = useSWR(
    user?.token ? `/api/v1/portal/${user.token}/bookings` : null,
    fetchClientBookings
  )

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-72" />
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all your events and deliverables securely.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-xl">
          <p className="font-medium text-foreground mb-1">Failed to load bookings</p>
          <p className="text-sm">{error.message || "Please try again later."}</p>
        </div>
      </div>
    )
  }

  if (!bookings?.length) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all your events and deliverables securely.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-xl">
          <p className="font-medium text-foreground mb-1">No bookings found</p>
          <p className="text-sm">Your upcoming events will appear here once scheduled by the studio.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your events and deliverables securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((book: ClientPortalBooking) => {
          const statusClass = statusStyles[book.status?.toLowerCase()] || "bg-gray-500/10 text-gray-600"
          return (
            <Link href={`/portal/${studioSlug}/bookings/${book.id}`} key={book.id} className="block transition-transform hover:-translate-y-0.5">
              <div className="w-full bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/40] rounded-xl p-5 shadow-sm group">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[hsl(var(--portal-primary))] transition-colors">{book.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {book.date}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {book.venue}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusClass}`}>
                      {book.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                   <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Package</p>
                     <p className="text-sm font-semibold">{book.packageName}</p>
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
          )
        })}
      </div>

    </div>
  )
}
