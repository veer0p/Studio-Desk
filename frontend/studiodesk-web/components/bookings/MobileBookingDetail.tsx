"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import SlideOverTabs from "@/components/bookings/slideover/SlideOverTabs"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { BookingStatusBadge } from "@/components/bookings/shared/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function MobileBookingDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: booking, isLoading } = useSWR(`/api/v1/bookings/${id}`, fetcher, { dedupingInterval: 60000 })

  useEffect(() => {
    // If on large screens, automatically route to the slideover experience
    const checkLayout = () => {
      if (window.innerWidth >= 1024) {
        router.replace(`/bookings?id=${id}`)
      }
    }
    checkLayout()
    window.addEventListener("resize", checkLayout)
    return () => window.removeEventListener("resize", checkLayout)
  }, [id, router])

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 space-y-4 lg:hidden">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-full h-24 mt-4" />
        <Skeleton className="w-full h-96" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center lg:hidden p-6 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button onClick={() => router.push("/bookings")} variant="outline" className="mt-4">
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-background lg:hidden relative">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 pb-4">
        
        {/* Nav Header */}
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/bookings")} className="-ml-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Bookings
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Title Area */}
        <div className="px-4 flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{booking.clientName}</h1>
          <div className="flex items-center gap-2">
            <EventTypeDot type={booking.eventType} />
            <span className="text-sm font-medium text-muted-foreground">{booking.eventName || booking.eventType}</span>
          </div>
          <div className="mt-2">
            <BookingStatusBadge stage={booking.stage} />
          </div>
        </div>

      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <SlideOverTabs booking={booking} />
      </div>
    </div>
  )
}
