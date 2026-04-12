"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { ROUTES } from "@/lib/constants/routes"
import { BookingStatusBadge } from "@/components/bookings/shared/BookingStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Plus } from "lucide-react"
import type { BookingSummary, ClientDetail } from "@/lib/api"

const formatAmount = (amt: number) => {
  if (!amt) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`
  return `₹${amt}`
}

export function ClientBookings({ client }: { client: ClientDetail }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState("All")

  const filters = ["All", "Active", "Completed", "Cancelled"]
  const bookings = client.bookings || []

  const filteredBookings = bookings.filter((b) => {
    if (filter === "All") return true
    if (filter === "Completed") return b.stage === "Delivered"
    if (filter === "Cancelled") return b.stage === "Cancelled"
    return b.stage !== "Delivered" && b.stage !== "Cancelled" // Active
  })

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/40 w-fit">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/5 h-64 flex items-center justify-center rounded-md shadow-none">
          <CardContent className="flex flex-col items-center pt-6">
            <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center mb-4">
              <span className="text-xl opacity-50">📅</span>
            </div>
            <p className="font-medium text-muted-foreground mb-1">No bookings found</p>
            <p className="text-sm text-muted-foreground max-w-[250px] text-center">
              {filter === "All" ? "Create the first booking for this client." : `No ${filter.toLowerCase()} bookings found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking: BookingSummary) => (
            <div 
              key={booking.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("id", booking.id)
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border border-border/60 bg-card hover:border-foreground/20 transition-colors cursor-pointer shadow-none"
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className="hidden sm:flex w-10 h-10 rounded-sm bg-muted items-center justify-center border border-border/40">
                  <EventTypeDot type={booking.eventType} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{booking.eventName}</span>
                    <BookingStatusBadge stage={booking.stage} />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{booking.date}</span>
                    <span className="text-border">•</span>
                    <span>{booking.venue || "TBD"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                <div className="flex flex-col sm:items-end">
                  <span className="font-mono text-[11px] tracking-widest uppercase mt-0.5">{formatAmount(booking.amount)}</span>
                  {(booking.balanceDue > 0) ? (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">Balance: <span className="text-foreground">{formatAmount(booking.balanceDue)}</span></span>
                  ) : (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">Paid in full</span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
