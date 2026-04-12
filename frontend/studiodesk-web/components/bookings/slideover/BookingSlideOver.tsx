"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { ROUTES } from "@/lib/constants/routes"
import { fetchBookingDetail } from "@/lib/api"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { BookingStatusBadge } from "@/components/bookings/shared/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import { X, MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import SlideOverTabs from "@/components/bookings/slideover/SlideOverTabs"

export default function BookingSlideOver({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const { data: booking, isLoading, error } = useSWR(`/api/v1/bookings/${bookingId}`, fetchBookingDetail, {
    dedupingInterval: 60000
  })

  // Show immediate loading state when bookingId changes
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 200)
    return () => clearTimeout(timer)
  }, [bookingId])

  const closeSlideOver = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
  }

  if (isLoading || isTransitioning) {
    return (
      <div className="w-full h-full flex flex-col p-6 gap-6 animate-pulse">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Failed to load booking.</p>
        <p className="text-xs text-muted-foreground mb-4">{error.message || "Please try again later."}</p>
        <Button variant="outline" size="sm" onClick={closeSlideOver}>Close</Button>
      </div>
    )
  }

  // Fallback if booking fails to load or not found
  if (!booking) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button variant="outline" className="mt-4" onClick={closeSlideOver}>Close</Button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="flex flex-col gap-3 p-6 pb-4 border-b border-border/40 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5 pr-4">
            <h2 className="text-lg font-semibold tracking-tight">{booking.clientName}</h2>
            <div className="flex items-center gap-2">
              <EventTypeDot type={booking.eventType} />
              <span className="text-sm font-medium text-muted-foreground">{booking.eventName || booking.eventType}</span>
            </div>
            <div className="mt-1">
              <BookingStatusBadge stage={booking.stage} />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={closeSlideOver}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Tabs Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SlideOverTabs booking={booking} />
      </div>
    </div>
  )
}
